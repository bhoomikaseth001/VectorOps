const { Parser } = require('json2csv');
const { Vehicle, Trip, FuelLog, Expense, Maintenance } = require('../models');

const buildVehicleReport = async () => {
  const vehicles = await Vehicle.findAll();
  const report = [];

  for (const v of vehicles) {
    const trips = await Trip.findAll({ where: { vehicleId: v.id, status: 'Completed' } });
    const totalDistance = trips.reduce((sum, t) => sum + (t.actualDistance || 0), 0);
    const totalFuelFromTrips = trips.reduce((sum, t) => sum + (t.fuelConsumed || 0), 0);

    const fuelLogs = await FuelLog.findAll({ where: { vehicleId: v.id } });
    const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
    const totalFuelLiters = fuelLogs.reduce((sum, f) => sum + f.liters, 0) || totalFuelFromTrips;

    const maintenance = await Maintenance.findAll({ where: { vehicleId: v.id } });
    const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + m.cost, 0);

    const expenses = await Expense.findAll({ where: { vehicleId: v.id } });
    const totalExpenseCost = expenses.reduce((sum, e) => sum + e.amount, 0);

    const operationalCost = totalFuelCost + totalMaintenanceCost + totalExpenseCost;

    const fuelEfficiency = totalFuelLiters > 0 ? (totalDistance / totalFuelLiters).toFixed(2) : '0.00';

    // Revenue placeholder - wire up real revenue if/when tracked per trip
    const revenue = 0;
    const roi = v.acquisitionCost > 0
      ? (((revenue - (totalMaintenanceCost + totalFuelCost)) / v.acquisitionCost) * 100).toFixed(2)
      : '0.00';

    report.push({
      registrationNumber: v.registrationNumber,
      vehicleName: v.name,
      status: v.status,
      totalTrips: trips.length,
      totalDistanceKm: totalDistance,
      totalFuelLiters,
      fuelEfficiencyKmPerL: Number(fuelEfficiency),
      totalFuelCost,
      totalMaintenanceCost,
      totalExpenseCost,
      totalOperationalCost: operationalCost,
      roiPercent: Number(roi),
    });
  }

  return report;
};

// GET /api/reports/fleet
exports.getFleetReport = async (req, res) => {
  try {
    const report = await buildVehicleReport();
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reports/fleet/export/csv
exports.exportFleetReportCsv = async (req, res) => {
  try {
    const report = await buildVehicleReport();
    const parser = new Parser();
    const csv = parser.parse(report);

    res.header('Content-Type', 'text/csv');
    res.attachment('fleet_report.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
