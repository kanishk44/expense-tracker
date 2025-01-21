const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Expense = sequelize.define("expense", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  amount: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
  },
  category: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  date: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
});

module.exports = Expense;
