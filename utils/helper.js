const CryptoJS = require("crypto-js");
const crypto = require("crypto");

const formatCompanyData = (data) => {
  const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), "!@#109Tyuuryfqowp085rjf{}[])_+.//||").toString();
  return ciphertext;
};

const resetToken = async (company) => {
  const token = crypto.randomBytes(20).toString("hex");

  //Encrypt the token and set it to resetPasswordToken
  company.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
  company.resetPasswordDate = Date.now();
  await company.save();

  return company.resetPasswordToken;
};

module.exports = {
  formatCompanyData,
  resetToken,
};
