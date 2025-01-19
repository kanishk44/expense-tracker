const Sequelize = require("sequelize");

const sequelize = new Sequelize("node-complete", "root", "Pass@123", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;
