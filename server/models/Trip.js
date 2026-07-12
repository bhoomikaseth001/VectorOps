const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Trip = sequelize.define('Trip', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  source: { type: DataTypes.STRING, allowNull: false },
  destination: { type: DataTypes.STRING, allowNull: false },
  cargoWeight: { type: DataTypes.FLOAT, allowNull: false },
  plannedDistance: { type: DataTypes.FLOAT, allowNull: false },
  actualDistance: { type: DataTypes.FLOAT },
  fuelConsumed: { type: DataTypes.FLOAT },
  finalOdometer: { type: DataTypes.FLOAT },
  status: {
    type: DataTypes.ENUM('Draft', 'Dispatched', 'Completed', 'Cancelled'),
    defaultValue: 'Draft',
  },
  dispatchedAt: { type: DataTypes.DATE },
  completedAt: { type: DataTypes.DATE },
  cancelledAt: { type: DataTypes.DATE },
  // vehicleId, driverId added automatically by associations in models/index.js
});

module.exports = Trip;
