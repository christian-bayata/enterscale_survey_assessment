require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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
    resetPasswordToken: String,
    resetPasswordDate: Date,
  },
  { timestamps: true }
);

/* Generate JSON web token for company */
CompanySchema.methods.generateJsonWebToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.JWT_SECRET_KEY
  );
};

/* Hash the password before storing it in the database */
CompanySchema.pre("save", async function save(next) {
  try {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
  } catch (err) {
    return next(err);
  }
});

/* Compare password using bcrypt.compare */
CompanySchema.methods.comparePassword = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password);
};

/* Creates the company model */
const Company = mongoose.model("Company", CompanySchema);
module.exports = Company;
