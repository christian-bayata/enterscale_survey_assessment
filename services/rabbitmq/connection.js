require("dotenv").config();
const username = process.env.RABBITMQ_USERNAME;
const password = process.env.RABBITMQ_PASSWORD;
const host = process.env.RABBITMQ_HOST;
const port = process.env.RABBITMQ_PORT;
const vHost = process.env.RABBITMQ_VHOST;

const connectionString = `amqp://${username}:${password}@${host}/${vHost}`;
module.exports = connectionString;
