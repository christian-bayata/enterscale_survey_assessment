require("dotenv").config();
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const TokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    token: {
      type: String,
    },
  },
  { timestamps: true }
);

/* Creates the token model */
const Token = mongoose.model("Token", TokenSchema);
module.exports = Token;
