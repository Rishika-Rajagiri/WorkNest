const Job=require("../models/Job");

const createJob=async (req,res)=>{
  try{
    const {title,description,budget,skills,deadline}=req.body;

    //check required fields
    if(!title||!description||!budget||!deadline){
      return res.status(400).json({
        message: "Please fill in all required fields"
      })
    }

    //Create Job 
    const job=await Job.create({
     title,
      description,
      budget,
      skills: skills || [],
      deadline,

      // Get logged-in user's ID from JWT
      client: req.user.id 
    })
    res.status(201).json({
      message: "Job created successfully",
      job
    });

  }catch (error) {
    console.error("Error creating job:", error);

    res.status(500).json({
      message: "Server error"
    });
}
}

//get all open jobs
const getAllJobs=async (req,res)=>{
  try{
    const jobs=await Job.find({status:'open'})
      .populate('client', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: jobs.length,
      jobs
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
    
  }
}

//get single job
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('client', 'name email');

    if (!job) {
      return res.status(404).json({
        message: 'Job not found'
      });
    }

    res.status(200).json({
      job
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

//update job
const updateJob=async (req,res)=>{
  try{
    const {title, description, skills, budget, deadline }=req.body;

    const job=await Job.findById(req.params.id);

     if (!job) {
      return res.status(404).json({
        message: 'Job not found'
      });
    }
     // Check if logged-in user owns the job
    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'You are not authorized to update this job'
      });
    }
    job.title = title || job.title;
    job.description = description || job.description;
    job.skills = skills || job.skills;
    job.budget = budget || job.budget;
    job.deadline = deadline || job.deadline;

    await job.save();

    res.status(200).json({
      message: 'Job updated successfully',
      job
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
}

// DELETE JOB
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: 'Job not found'
      });
    }

    // Check if logged-in user owns the job
    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'You are not authorized to delete this job'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: 'Job deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};


module.exports={
  createJob,getAllJobs,getJobById,updateJob,deleteJob
}