require("dotenv").config();
const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
// const mongoosastic = require("mongoosastic");

const Schema = mongoose.Schema;

const CompanySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    slug: { type: String, slug: "name" },
  },
  { timestamps: true }
);
mongoose.plugin(slug);

/* Creates the user model */
const Company = mongoose.model("Company", CompanySchema);
module.exports = Company;
