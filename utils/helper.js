const CryptoJS = require("crypto-js");

const formatUserData = (data) => {
  const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), "!@#109Tyuuryfqowp085rjf{}[])_+.//||").toString();
  return ciphertext;
};

module.exports = {
  formatUserData,
};
