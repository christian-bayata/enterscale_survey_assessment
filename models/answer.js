"use strict";
module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define("Question", {
    userId: {
      type: DataTypes.INTEGER,
    },
    questionId: {
      type: DataTypes.INTEGER,
    },
  });

  Question.associate = function (models) {
    Question.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });

    Question.belongsTo(models.Question, {
      foreignKey: "questionId",
      as: "question",
    });
  };
};
