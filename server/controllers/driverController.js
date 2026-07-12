const { Op } = require('sequelize');
const { Driver } = require('../models');

// GET /api/drivers
exports.getDrivers = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;
    const drivers = await Driver.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/drivers/available -> Available AND license not expired
exports.getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await Driver.findAll({
      where: {
        status: 'Available',
        licenseExpiryDate: { [Op.gte]: new Date() },
      },
    });
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/drivers
exports.createDriver = async (req, res) => {
  try {
    const existing = await Driver.findOne({ where: { licenseNumber: req.body.licenseNumber } });
    if (existing) {
      return res.status(409).json({ message: 'License number already exists' });
    }
    const driver = await Driver.create(req.body);
    res.status(201).json(driver);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/drivers/:id
exports.updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    await driver.update(req.body);
    res.json(driver);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/drivers/:id
exports.deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    await driver.destroy();
    res.json({ message: 'Driver deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
