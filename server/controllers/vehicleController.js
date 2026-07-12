const { Vehicle } = require('../models');

// GET /api/vehicles (supports ?status=&type=&region=)
exports.getVehicles = async (req, res) => {
  try {
    const { status, type, region } = req.query;
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (region) where.region = region;
    const vehicles = await Vehicle.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/vehicles/available
exports.getAvailableVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({ where: { status: 'Available' } });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/vehicles
exports.createVehicle = async (req, res) => {
  try {
    const existing = await Vehicle.findOne({
      where: { registrationNumber: req.body.registrationNumber },
    });
    if (existing) {
      return res.status(409).json({ message: 'Registration number already exists' });
    }
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/vehicles/:id
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    await vehicle.update(req.body);
    res.json(vehicle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/vehicles/:id
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    await vehicle.destroy();
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
