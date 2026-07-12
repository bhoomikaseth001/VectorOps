const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const FuelLog = sequelize.define('FuelLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  liters: { type: DataTypes.FLOAT, allowNull: false },
  cost: { type: DataTypes.FLOAT, allowNull: false },
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = FuelLog;
