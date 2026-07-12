const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTrips,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
} = require('../controllers/tripController');

router.use(protect);

router.get('/', getTrips);
router.post('/', createTrip);
router.patch('/:id/dispatch', dispatchTrip);
router.patch('/:id/complete', completeTrip);
router.patch('/:id/cancel', cancelTrip);

module.exports = router;
