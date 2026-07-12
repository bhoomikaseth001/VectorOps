const { Trip, Vehicle, Driver } = require('../models');

// GET /api/trips
exports.getTrips = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;
    const trips = await Trip.findAll({
      where,
      include: [
        { model: Vehicle, attributes: ['registrationNumber', 'name', 'type', 'maxLoadCapacity'] },
        { model: Driver, attributes: ['name', 'licenseNumber', 'status'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/trips -> creates a Draft trip
exports.createTrip = async (req, res) => {
  try {
    const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance } = req.body;

    const vehicleDoc = await Vehicle.findByPk(vehicleId);
    const driverDoc = await Driver.findByPk(driverId);
    if (!vehicleDoc || !driverDoc) {
      return res.status(404).json({ message: 'Vehicle or Driver not found' });
    }

    // Rule: Retired or In Shop vehicles must never appear in dispatch selection
    if (['In Shop', 'Retired', 'On Trip'].includes(vehicleDoc.status)) {
      return res.status(400).json({ message: `Vehicle is ${vehicleDoc.status} and cannot be assigned` });
    }

    // Rule: Drivers with expired licenses or Suspended status cannot be assigned
    if (driverDoc.status === 'Suspended' || driverDoc.status === 'On Trip') {
      return res.status(400).json({ message: `Driver is ${driverDoc.status} and cannot be assigned` });
    }
    if (new Date(driverDoc.licenseExpiryDate) < new Date()) {
      return res.status(400).json({ message: 'Driver license has expired' });
    }

    // Rule: Cargo Weight must not exceed vehicle's maximum load capacity
    if (cargoWeight > vehicleDoc.maxLoadCapacity) {
      return res.status(400).json({
        message: `Cargo weight (${cargoWeight}kg) exceeds vehicle max capacity (${vehicleDoc.maxLoadCapacity}kg)`,
      });
    }

    const trip = await Trip.create({
      source,
      destination,
      vehicleId,
      driverId,
      cargoWeight,
      plannedDistance,
      status: 'Draft',
    });

    res.status(201).json(trip);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PATCH /api/trips/:id/dispatch
exports.dispatchTrip = async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.status !== 'Draft') {
      return res.status(400).json({ message: 'Only Draft trips can be dispatched' });
    }

    const vehicleDoc = await Vehicle.findByPk(trip.vehicleId);
    const driverDoc = await Driver.findByPk(trip.driverId);

    if (vehicleDoc.status !== 'Available') {
      return res.status(400).json({ message: `Vehicle is no longer Available (${vehicleDoc.status})` });
    }
    if (driverDoc.status !== 'Available') {
      return res.status(400).json({ message: `Driver is no longer Available (${driverDoc.status})` });
    }

    await vehicleDoc.update({ status: 'On Trip' });
    await driverDoc.update({ status: 'On Trip' });

    await trip.update({ status: 'Dispatched', dispatchedAt: new Date() });

    res.json(trip);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PATCH /api/trips/:id/complete
exports.completeTrip = async (req, res) => {
  try {
    const { finalOdometer, fuelConsumed, actualDistance } = req.body;
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.status !== 'Dispatched') {
      return res.status(400).json({ message: 'Only Dispatched trips can be completed' });
    }

    const vehicleDoc = await Vehicle.findByPk(trip.vehicleId);
    const driverDoc = await Driver.findByPk(trip.driverId);

    await vehicleDoc.update({
      status: 'Available',
      odometer: finalOdometer || vehicleDoc.odometer,
    });
    await driverDoc.update({ status: 'Available' });

    await trip.update({
      status: 'Completed',
      completedAt: new Date(),
      finalOdometer,
      fuelConsumed,
      actualDistance,
    });

    res.json(trip);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PATCH /api/trips/:id/cancel
exports.cancelTrip = async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (!['Draft', 'Dispatched'].includes(trip.status)) {
      return res.status(400).json({ message: 'Only Draft or Dispatched trips can be cancelled' });
    }

    if (trip.status === 'Dispatched') {
      const vehicleDoc = await Vehicle.findByPk(trip.vehicleId);
      const driverDoc = await Driver.findByPk(trip.driverId);
      await vehicleDoc.update({ status: 'Available' });
      await driverDoc.update({ status: 'Available' });
    }

    await trip.update({ status: 'Cancelled', cancelledAt: new Date() });

    res.json(trip);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
