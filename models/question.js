"use strict";
module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define("Question", {
    surveyId: {
      type: DataTypes.INTEGER,
    },
  });

  Question.associate = function (models) {
    Question.belongsTo(models.Survey, {
      foreignKey: "surveyId",
      as: "question_survey",
    });
  };
};
