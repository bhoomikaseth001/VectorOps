const sequelize = require('../config/db');
const User = require('./User');
const Vehicle = require('./Vehicle');
const Driver = require('./Driver');
const Trip = require('./Trip');
const Maintenance = require('./Maintenance');
const FuelLog = require('./FuelLog');
const Expense = require('./Expense');

// Trip belongs to one Vehicle and one Driver
Vehicle.hasMany(Trip, { foreignKey: 'vehicleId' });
Trip.belongsTo(Vehicle, { foreignKey: 'vehicleId' });

Driver.hasMany(Trip, { foreignKey: 'driverId' });
Trip.belongsTo(Driver, { foreignKey: 'driverId' });

// Maintenance belongs to one Vehicle
Vehicle.hasMany(Maintenance, { foreignKey: 'vehicleId' });
Maintenance.belongsTo(Vehicle, { foreignKey: 'vehicleId' });

// FuelLog belongs to one Vehicle
Vehicle.hasMany(FuelLog, { foreignKey: 'vehicleId' });
FuelLog.belongsTo(Vehicle, { foreignKey: 'vehicleId' });

// Expense belongs to one Vehicle
Vehicle.hasMany(Expense, { foreignKey: 'vehicleId' });
Expense.belongsTo(Vehicle, { foreignKey: 'vehicleId' });

module.exports = {
  sequelize,
  User,
  Vehicle,
  Driver,
  Trip,
  Maintenance,
  FuelLog,
  Expense,
};
