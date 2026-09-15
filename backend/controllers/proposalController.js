const Proposal=require('../models/Proposal');
const Job=require("../models/Job");
const mongoose= require('mongoose');
const Contract = require('../models/Contract');

//create proposal
const createProposal=async (req,res)=>{
  try{
    const {jobId, coverLetter, bidAmount, deliveryTime }=req.body;

    //check required fields
    if (!jobId || !coverLetter || !bidAmount || !deliveryTime) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    // Check whether job exists
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        message: 'Job not found'
      });
    }

     // Create proposal
    const proposal = await Proposal.create({
      freelancer: req.user.id,
      job: jobId,
      coverLetter,
      bidAmount,
      deliveryTime
    });

    res.status(201).json({
      message: 'Proposal submitted successfully',
      proposal
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
}

// GET PROPOSALS FOR A JOB
const getJobProposals = async (req, res) => {
  try {
    const { jobId } = req.params;

    const proposals = await Proposal.find({ job: jobId })
      .populate('freelancer', 'name email skills bio')
      .populate('job', 'title budget');

    res.status(200).json({
      count: proposals.length,
      proposals
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// GET MY PROPOSALS
const getMyProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({
      freelancer: req.user.id
    })
      .populate('job', 'title description budget');

    res.status(200).json({
      count: proposals.length,
      proposals
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// ACCEPT PROPOSAL
const acceptProposal = async (req, res) => {
  try {
    const { id } = req.params;

    // Find proposal
    const proposal = await Proposal.findById(id);

    if (!proposal) {
      return res.status(404).json({
        message: 'Proposal not found'
      });
    }

    // Find the job
    const job = await Job.findById(proposal.job);

    if (!job) {
      return res.status(404).json({
        message: 'Job not found'
      });
    }

    // Check whether logged-in user owns the job
    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Only the job owner can accept this proposal'
      });
    }

    // Accept proposal
    proposal.status = 'accepted';

    await proposal.save();

    // Check if contract already exists
const existingContract = await Contract.findOne({
  proposal: proposal._id
});

if (existingContract) {
  return res.status(400).json({
    message: 'Contract already exists for this proposal'
  });
}

    // Create contract
  const contract = await Contract.create({
  client: job.client,
  freelancer: proposal.freelancer,
  job: proposal.job,
  proposal: proposal._id,
  agreedAmount: proposal.bidAmount,
  deliveryTime: proposal.deliveryTime
  });

    res.status(200).json({
      message: 'Proposal accepted and contract created successfully',
      proposal,contract
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// REJECT PROPOSAL
const rejectProposal = async (req, res) => {
  try {
    const { id } = req.params;

    // Find proposal
    const proposal = await Proposal.findById(id);

    if (!proposal) {
      return res.status(404).json({
        message: 'Proposal not found'
      });
    }

    // Find the job
    const job = await Job.findById(proposal.job);

    if (!job) {
      return res.status(404).json({
        message: 'Job not found'
      });
    }

    // Check job owner
    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Only the job owner can reject this proposal'
      });
    }

    // Reject proposal
    proposal.status = 'rejected';

    await proposal.save();

    res.status(200).json({
      message: 'Proposal rejected successfully',
      proposal
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};


module.exports = {
  createProposal,getJobProposals,getMyProposals,acceptProposal,rejectProposal
};