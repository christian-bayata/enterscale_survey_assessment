require("dotenv").config();
const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");

const Schema = mongoose.Schema;
const QuestionSchema = new Schema(
  {
    survey: {
      type: Schema.Types.ObjectId,
      ref: "Survey",
    },
    question: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

mongoose.plugin(slug);

/* Creates the question model */
const Question = mongoose.model("Question", QuestionSchema);
module.exports = Question;
