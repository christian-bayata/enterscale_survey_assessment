require("dotenv").config();
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const AnswerSchema = new Schema(
  {
    question: {
      type: Schema.Types.ObjectId,
      ref: "Question",
    },
    answer: {
      type: String,
    },
  },
  { timestamps: true }
);

/* Creates the question model */
const Answer = mongoose.model("Answer", AnswerSchema);
module.exports = Answer;
