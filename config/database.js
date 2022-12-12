const mongoose = require("mongoose");

class Database {
  constructor(connectionString) {
    this.connectionString = connectionString;
  }

  async connect() {
    try {
      mongoose.set("strictQuery", false);
      const connection = await mongoose.connect(this.connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to the database successfully");
      return connection;
    } catch (error) {
      console.log("Could not connect to the database", error);
      return error;
    }
  }
}

module.exports = Database;
