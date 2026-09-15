const express = require('express');
const router = express.Router();

const { createProposal,getJobProposals,getMyProposals,acceptProposal,rejectProposal} = require('../controllers/proposalController');

const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createProposal);
router.get('/job/:jobId', authMiddleware, getJobProposals);
router.get('/my', authMiddleware, getMyProposals);
router.put('/:id/accept', authMiddleware, acceptProposal);
router.put('/:id/reject', authMiddleware, rejectProposal);

module.exports = router;