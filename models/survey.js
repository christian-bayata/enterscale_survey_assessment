"use strict";
module.exports = (sequelize, DataTypes) => {
  const Survey = sequelize.define("Survey", {
    title: {
      type: DataTypes.STRING,
    },
    companyId: {
      type: DataTypes.INTEGER,
    },
  });

  Survey.associate = function (models) {
    Survey.belongsTo(models.Company, {
      foreignKey: "companyId",
      as: "company_info",
    });
    Survey.hasMany(models.Question, {
      foreignKey: "surveyId",
      as: "survey_questions",
    });
  };
};
