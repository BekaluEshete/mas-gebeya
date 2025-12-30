const express = require('express');
const { body, param, query } = require('express-validator');
const { getDeals, getDealById, createDeal, updateDealStatus, deleteDeal, getDealStats, getRecentCompletedDeals } = require('../controllers/dealController');
const { protect, adminOnly } = require('../middlewares/auth');
const { validateRequest } = require('../middlewares/requestValidator');

const router = express.Router();

// Public route - must be before router.use(protect)
router.get('/recent', getRecentCompletedDeals);

router.use(protect);


const getDealByIdValidation = [
  param('id').isMongoId().withMessage('Invalid deal ID'),
];



const deleteDealValidation = [
  param('id').isMongoId().withMessage('Invalid deal ID'),
];

router.get('/', getDeals);
router.get('/deal/stats', adminOnly, getDealStats);
router.get('/:id', getDealById);
router.post('/', createDeal);
router.put('/:id/status', updateDealStatus);
router.delete('/:id', deleteDeal);

module.exports = router;