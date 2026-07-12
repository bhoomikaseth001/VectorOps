const { Op } = require('sequelize');
const { Vehicle, Trip, Driver } = require('../models');

// GET /api/dashboard/kpis?type=&region=
exports.getKpis = async (req, res) => {
  try {
    const { type, region } = req.query;
    const vehicleWhere = {};
    if (type) vehicleWhere.type = type;
    if (region) vehicleWhere.region = region;

    const [
      totalVehicles,
      activeVehicles,
      availableVehicles,
      inMaintenanceVehicles,
      activeTrips,
      pendingTrips,
      driversOnDuty,
    ] = await Promise.all([
      Vehicle.count({ where: vehicleWhere }),
      Vehicle.count({ where: { ...vehicleWhere, status: { [Op.ne]: 'Retired' } } }),
      Vehicle.count({ where: { ...vehicleWhere, status: 'Available' } }),
      Vehicle.count({ where: { ...vehicleWhere, status: 'In Shop' } }),
      Trip.count({ where: { status: 'Dispatched' } }),
      Trip.count({ where: { status: 'Draft' } }),
      Driver.count({ where: { status: 'On Trip' } }),
    ]);

    const fleetUtilization = totalVehicles > 0
      ? ((activeTrips / totalVehicles) * 100).toFixed(2)
      : '0.00';

    res.json({
      activeVehicles,
      availableVehicles,
      vehiclesInMaintenance: inMaintenanceVehicles,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilizationPercent: Number(fleetUtilization),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
