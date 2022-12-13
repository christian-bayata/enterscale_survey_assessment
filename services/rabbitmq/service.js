const amqp = require("amqplib/callback_api");
const connectionString = require("./connection");

let ch = null;
amqp.connect(connectionString, function (err, conn) {
  conn.createChannel(function (err, channel) {
    ch = channel;
  });
});

/********************** Publish to queue *****************************/
const publishToQueue = async (queueName, data) => {
  console.log("queue", queueName);
  console.log(" [x] Sent %s", data);
  return ch.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), { persistent: true });
};

/********************** Consume from queue *****************************/
const consumeFromQueue = async (queueName, data) => {
  console.log(" [x] Received %s", data.content.toString());
  return ch.consume(queueName, data.content.toString(), { noAck: true });
};

process.on("exit", () => {
  ch.close();
  console.log(`Closing rabbitmq channel`);
});

module.exports = {
  publishToQueue,
  consumeFromQueue,
};
