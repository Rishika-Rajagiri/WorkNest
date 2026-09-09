const express=require("express");
const cors=require("cors");
require("dotenv").config();
const connectDB=require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app=express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

connectDB();

app.get("/",(req,res)=>{
  res.json({
    message:"Welcome to WorkNest API"
  })
})

const PORT=process.env.PORT || 5000;

app.listen(PORT,()=>{
  console.log(`Server is running on port ${PORT}`);
})