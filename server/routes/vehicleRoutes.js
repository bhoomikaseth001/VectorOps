const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getVehicles,
  getAvailableVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicleController');

router.use(protect);

router.get('/', getVehicles);
router.get('/available', getAvailableVehicles);
router.post('/', authorize('FleetManager'), createVehicle);
router.put('/:id', authorize('FleetManager'), updateVehicle);
router.delete('/:id', authorize('FleetManager'), deleteVehicle);

module.exports = router;
