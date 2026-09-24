const express = require("express");

const router = express.Router();

const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,searchJobs
} = require("../controllers/jobController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");

// CREATE JOB - CLIENT ONLY
router.post(
  "/create",
  authMiddleware,
  authorizeRole("client"),
  createJob
);

// GET ALL JOBS
router.get("/getAllJobs", getAllJobs);


//search jobs
router.get("/search", searchJobs);

// GET SINGLE JOB
router.get("/:id", getJobById);

// UPDATE JOB - CLIENT ONLY
router.put(
  "/:id",
  authMiddleware,
  authorizeRole("client"),
  updateJob
);

// DELETE JOB - CLIENT ONLY
router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("client"),
  deleteJob
);



module.exports = router;