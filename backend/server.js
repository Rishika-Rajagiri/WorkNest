const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");

const mongoSanitize = require("@exortek/express-mongo-sanitize");

const Message = require("./models/Message");
const Contract = require("./models/Contract");

const jwt = require("jsonwebtoken");

const errorHandler = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const proposalRoutes = require("./routes/proposalRoutes");
const contractRoutes = require("./routes/contractRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const createNotification = require("./utils/notificationHelper");

const app = express();



const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL
  }
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(
        new Error("Authentication error: Token required")
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    socket.user = decoded;

    next();

  } catch (error) {
    console.log("JWT ERROR:", error.message);

    next(
      new Error(
        "Authentication error: Invalid or expired token"
      )
    );
  }
});

const onlineUsers = new Map();

io.on("connection", (socket) => {

  console.log("user connected:", socket.id);
  console.log("User ID:", socket.user.id);
  console.log("User Role:", socket.user.role);

  onlineUsers.set(
    socket.user.id,
    socket.id
  );

  console.log(
    `${socket.user.id} is ONLINE`
  );

  socket.on("join_contract", async (contractId) => {

    try {

      const contract =
        await Contract.findById(contractId);

      if (!contract) {
        console.log("Contract not found");
        return;
      }

      const userId =
        socket.user.id;

      const isParticipant =
        contract.client.toString() === userId ||
        contract.freelancer.toString() === userId;

      if (!isParticipant) {

        console.log(
          `User ${userId} is not authorized for contract ${contractId}`
        );

        socket.emit(
          "contract_access_denied",
          {
            message:
              "You are not a participant in this contract"
          }
        );

        return;
      }

      const roomName =
        `contract_${contractId}`;

      socket.join(roomName);

      console.log(
        `${userId} joined ${roomName}`
      );

    } catch (error) {

      console.error(
        "Error joining contract:",
        error
      );

    }

  });

  socket.on("typing", (data) => {

    const roomName =
      `contract_${data.contractId}`;

    socket.to(roomName).emit(
      "user_typing",
      {
        userId: socket.user.id
      }
    );

  });

  socket.on("stop_typing", (data) => {

    const roomName =
      `contract_${data.contractId}`;

    socket.to(roomName).emit(
      "user_stopped_typing",
      {
        userId: socket.user.id
      }
    );

  });

  socket.on("send_message", async (data) => {

  try {
     if (
      !data ||
      !data.contractId ||
      !data.receiverId ||
      typeof data.message !== "string" ||
      !data.message.trim()
    ) {
      socket.emit("message_error", {
        message: "Invalid message data"
      });

      return;
    }

    const contract = await Contract.findById(data.contractId);


    if (!contract) {

      socket.emit("message_error", {
        message: "Contract not found"
      });

      return;
    }

    const userId = socket.user.id;

    const isParticipant =
      contract.client.toString() === userId ||
      contract.freelancer.toString() === userId;

    if (!isParticipant) {
      socket.emit("message_error", {
        message: "You are not a participant in this contract"
      });

      return;
    }

    const isReceiverParticipant =
      contract.client.toString() === data.receiverId ||
      contract.freelancer.toString() === data.receiverId;

    if (!isReceiverParticipant) {

      socket.emit("message_error", {
        message: "Receiver is not a participant in this contract"
      });

      return;
    };

    if (contract.status !== "active") {
     
      socket.emit("message_error", {
        message: "Messaging is not allowed for this contract"
      });

      return;
    };

    const savedMessage = await Message.create({
      sender: socket.user.id,
      receiver: data.receiverId,
      contract: data.contractId,
      message: data.message
    });

    const notification = await createNotification({
      userId: data.receiverId,
      type: "new_message",
      message: "You received a new message",
      relatedId: savedMessage._id
    });

    const receiverSocketId = onlineUsers.get(data.receiverId);

if (receiverSocketId) {
  io.to(receiverSocketId).emit(
    "new_notification",
    notification
  );
}


    const roomName =
      `contract_${data.contractId}`;

    io.to(roomName).emit("receive_message", {
      messageId: savedMessage._id,
      senderId: socket.user.id,
      receiverId: data.receiverId,
      contractId: data.contractId,
      message: data.message
    });


  } catch (error) {

    console.error(
      "ERROR IN SEND_MESSAGE:",
      error
    );

  }

});

    

 socket.on("message_read", async (data) => {
  try {
    const message = await Message.findById(data.messageId);

    if (!message) {
      return;
    }

    if (message.receiver.toString() !== socket.user.id) {
      socket.emit("message_error", {
        message: "You are not authorized to mark this message as read"
      });

      return;
    }

    message.read = true;
    await message.save();

    console.log(
      "Message read:",
      data.messageId
    );

    io.to(
      `contract_${message.contract}`
    ).emit(
      "message_read_updated",
      {
        messageId: message._id,
        read: true
      }
    );

  } catch (error) {
    console.error(
      "Error updating read status:",
      error.message
    );
  }
});

  socket.on("disconnect", () => {

    onlineUsers.delete(
      socket.user.id
    );

    console.log(
      `${socket.user.id} is OFFLINE`
    );

    io.emit(
      "user_offline",
      {
        userId:
          socket.user.id
      }
    );

    console.log(
      "user disconnected:",
      socket.id
    );

  });

});

app.use(cors({ origin: process.env.FRONTEND_URL}));

app.use(helmet());

app.use(
  express.json()
);

app.use(mongoSanitize());

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/jobs",
  jobRoutes
);

app.use(
  "/api/proposals",
  proposalRoutes
);

app.use(
  "/api/contracts",
  contractRoutes
);

app.use(
  "/api/messages",
  messageRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);


app.use(errorHandler);

connectDB();

app.get(
  "/",
  (req, res) => {

    res.json({
      message:
        "Welcome to WorkNest API"
    });

  }
);

const PORT =
  process.env.PORT || 5000;

server.listen(
  PORT,
  () => {

    console.log(
      `Server is running on port ${PORT}`
    );

  }
);