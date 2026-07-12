const { Maintenance, Vehicle } = require('../models');

// GET /api/maintenance
exports.getMaintenanceLogs = async (req, res) => {
  try {
    const logs = await Maintenance.findAll({
      include: [{ model: Vehicle, attributes: ['registrationNumber', 'name', 'status'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/maintenance
exports.createMaintenance = async (req, res) => {
  try {
    const { vehicleId, description, cost, date } = req.body;
    const vehicleDoc = await Vehicle.findByPk(vehicleId);
    if (!vehicleDoc) return res.status(404).json({ message: 'Vehicle not found' });

    if (vehicleDoc.status === 'On Trip') {
      return res.status(400).json({ message: 'Vehicle is currently On Trip, cannot start maintenance' });
    }

    const record = await Maintenance.create({ vehicleId, description, cost, date, status: 'Active' });

    await vehicleDoc.update({ status: 'In Shop' });

    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PATCH /api/maintenance/:id/close
exports.closeMaintenance = async (req, res) => {
  try {
    const record = await Maintenance.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: 'Maintenance record not found' });
    if (record.status === 'Closed') {
      return res.status(400).json({ message: 'Maintenance already closed' });
    }

    await record.update({ status: 'Closed', closedAt: new Date() });

    const vehicleDoc = await Vehicle.findByPk(record.vehicleId);
    if (vehicleDoc && vehicleDoc.status !== 'Retired') {
      await vehicleDoc.update({ status: 'Available' });
    }

    res.json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
