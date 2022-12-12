require("dotenv").config();
const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");

const Schema = mongoose.Schema;
const SurveySchema = new Schema(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
    title: {
      type: String,
      required: true,
    },
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Question",
        es_indexed: true,
      },
    ],
    slug: { type: String, slug: "title" },
  },
  { timestamps: true }
);

mongoose.plugin(slug);

/* Creates the survey model */
const Survey = mongoose.model("Survey", SurveySchema);
module.exports = Survey;
