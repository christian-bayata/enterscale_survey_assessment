const connectionString = require("./connection");
const open = require("amqplib").connect(connectionString);

class RabbitMqService {
  /**
   *
   * @param queue
   * @param data
   */
  static publish(queue, data) {
    open
      .then(function (conn) {
        return conn.createChannel();
      })
      .then(function (ch) {
        return ch.assertQueue(queue).then(function (ok) {
          return ch.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
        });
      })
      .catch(console.warn);
  }
}

module.exports = RabbitMqService;
