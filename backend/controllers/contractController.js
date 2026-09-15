const Contract = require('../models/Contract');

// GET MY CONTRACTS
const getMyContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({
      $or: [
        { client: req.user.id },
        { freelancer: req.user.id }
      ]
    })
      .populate('client', 'name email')
      .populate('freelancer', 'name email')
      .populate('job', 'title description budget')
      .populate('proposal', 'coverLetter bidAmount deliveryTime status');

    res.status(200).json({
      count: contracts.length,
      contracts
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

//get single contract
const getSingleContract=async (req,res)=>{
  try{
    const {id}=req.params;

    const contract = await Contract.findById(id)
    .populate('client','name email')
     .populate('freelancer', 'name email')
      .populate('job', 'title description budget')
      .populate('proposal', 'coverLetter bidAmount deliveryTime status');

     if (!contract) {
      return res.status(404).json({
        message: 'Contract not found'
      });
    }
    
    //only client or freelancer can view the contract
    if (
      contract.client._id.toString() !== req.user.id &&
      contract.freelancer._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    res.status(200).json({
      contract
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
       
  }
}

// COMPLETE CONTRACT
const completeContract = async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findById(id);

    if (!contract) {
      return res.status(404).json({
        message: 'Contract not found'
      });
    }

    // Only client or freelancer can complete the contract
    if (
      contract.client.toString() !== req.user.id &&
      contract.freelancer.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    // Contract must be active
    if (contract.status !== 'active') {
      return res.status(400).json({
        message: 'Only active contracts can be completed'
      });
    }

    contract.status = 'completed';

    await contract.save();

    res.status(200).json({
      message: 'Contract completed successfully',
      contract
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// CANCEL CONTRACT
const cancelContract = async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findById(id);

    if (!contract) {
      return res.status(404).json({
        message: 'Contract not found'
      });
    }

    // Only client or freelancer can cancel the contract
    if (
      contract.client.toString() !== req.user.id &&
      contract.freelancer.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    // Contract must be active
    if (contract.status !== 'active') {
      return res.status(400).json({
        message: 'Only active contracts can be cancelled'
      });
    }

    contract.status = 'cancelled';

    await contract.save();

    res.status(200).json({
      message: 'Contract cancelled successfully',
      contract
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getMyContracts,getSingleContract,completeContract,cancelContract
};