const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Maintenance = sequelize.define('Maintenance', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  description: { type: DataTypes.STRING, allowNull: false },
  cost: { type: DataTypes.FLOAT, defaultValue: 0 },
  status: { type: DataTypes.ENUM('Active', 'Closed'), defaultValue: 'Active' },
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  closedAt: { type: DataTypes.DATE },
});

module.exports = Maintenance;
