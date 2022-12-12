"use strict";
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    firstName: {
      type: DataTypes.STRING,
    },
    lastName: {
      type: DataTypes.STRING,
    },
    companyId: {
      type: DataTypes.INTEGER,
    },
  });

  User.associate = function (models) {
    User.belongsTo(models.Company, {
      foreignKey: "companyId",
      as: "company_info",
    });
    User.hasMany(models.Answer, {
      foreignKey: "userId",
      as: "user_answers",
    });
  };
};
