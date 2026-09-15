const express = require('express');
const router = express.Router();

const {getMyContracts,getSingleContract,completeContract,cancelContract}= require('../controllers/contractController');

const authMiddleware = require('../middleware/authMiddleware');

router.get('/my', authMiddleware, getMyContracts);
router.get('/:id', authMiddleware, getSingleContract);
router.put('/:id/complete', authMiddleware, completeContract);
router.put('/:id/cancel', authMiddleware, cancelContract);

module.exports = router;