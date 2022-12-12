"use strict";
const SequelizeSlugify = require("sequelize-slugify");

module.exports = (sequelize, DataTypes) => {
  const Company = sequelize.define("Company", {
    name: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    address: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
  });

  SequelizeSlugify.slugifyModel(Company, {
    source: ["name"],
  });

  Company.associate = function (models) {
    Company.hasMany(models.Product, {
      foreignKey: "companyId",
      as: "company_users",
    });
    Company.hasMany(models.Product, {
      foreignKey: "companyId",
      as: "company_surveys",
    });
  };
};
