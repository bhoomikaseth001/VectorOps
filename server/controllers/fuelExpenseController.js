const { FuelLog, Expense, Maintenance } = require('../models');

// POST /api/fuel-logs
exports.createFuelLog = async (req, res) => {
  try {
    const log = await FuelLog.create(req.body);
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/fuel-logs?vehicleId=
exports.getFuelLogs = async (req, res) => {
  try {
    const where = {};
    if (req.query.vehicleId) where.vehicleId = req.query.vehicleId;
    const logs = await FuelLog.findAll({ where, order: [['date', 'DESC']] });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/expenses
exports.createExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/expenses?vehicleId=
exports.getExpenses = async (req, res) => {
  try {
    const where = {};
    if (req.query.vehicleId) where.vehicleId = req.query.vehicleId;
    const expenses = await Expense.findAll({ where, order: [['date', 'DESC']] });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/fuel-logs/cost-summary/:vehicleId
exports.getVehicleCostSummary = async (req, res) => {
  try {
    const vehicleId = req.params.vehicleId;

    const fuelLogs = await FuelLog.findAll({ where: { vehicleId } });
    const expenses = await Expense.findAll({ where: { vehicleId } });
    const maintenance = await Maintenance.findAll({ where: { vehicleId } });

    const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
    const totalFuelLiters = fuelLogs.reduce((sum, f) => sum + f.liters, 0);
    const totalExpenseCost = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + m.cost, 0);

    const totalOperationalCost = totalFuelCost + totalMaintenanceCost + totalExpenseCost;

    res.json({
      vehicleId,
      totalFuelCost,
      totalFuelLiters,
      totalExpenseCost,
      totalMaintenanceCost,
      totalOperationalCost,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
