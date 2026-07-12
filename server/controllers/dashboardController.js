const { Op } = require('sequelize');
const { Vehicle, Trip, Driver, FuelLog } = require('../models');

// GET /api/dashboard/kpis?type=&region=
exports.getKpis = async (req, res) => {
  try {
    const { type, region } = req.query;
    const vehicleWhere = {};
    if (type) vehicleWhere.type = type;
    if (region) vehicleWhere.region = region;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalVehicles,
      activeVehicles,
      availableVehicles,
      inMaintenanceVehicles,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      tripsToday,
      fuelLogsThisMonth,
    ] = await Promise.all([
      Vehicle.count({ where: vehicleWhere }),
      Vehicle.count({ where: { ...vehicleWhere, status: { [Op.ne]: 'Retired' } } }),
      Vehicle.count({ where: { ...vehicleWhere, status: 'Available' } }),
      Vehicle.count({ where: { ...vehicleWhere, status: 'In Shop' } }),
      Trip.count({ where: { status: 'Dispatched' } }),
      Trip.count({ where: { status: 'Draft' } }),
      Driver.count({ where: { status: 'On Trip' } }),
      Trip.count({ where: { createdAt: { [Op.gte]: startOfDay } } }),
      FuelLog.findAll({ where: { date: { [Op.gte]: startOfMonth } } }),
    ]);

    const fleetUtilization = totalVehicles > 0
      ? ((activeTrips / totalVehicles) * 100).toFixed(2)
      : '0.00';

    const fuelSpendMonth = fuelLogsThisMonth.reduce((sum, f) => sum + f.cost, 0);

    res.json({
      activeVehicles,
      availableVehicles,
      vehiclesInMaintenance: inMaintenanceVehicles,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilizationPercent: Number(fleetUtilization),
      tripsToday,
      fuelSpendMonth,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};