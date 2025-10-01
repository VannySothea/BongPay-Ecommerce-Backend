import amqp from "amqplib"
import logger from "./logger"

let connection: any = null
let channels: Record<string, amqp.Channel> = {};

export const connectToRabbitMQ = async (): Promise<amqp.Connection> => {
  if (connection) return connection;

  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL as string);
    logger.info("Connected to RabbitMQ");
    return connection;
  } catch (error) {
    logger.error("Error connecting to RabbitMQ:", error);
    throw error;
  }
};

export const getChannelForExchange = async (
  exchangeName: string,
  type: "topic" | "fanout" | "direct" = "topic",
  durable = false
): Promise<amqp.Channel> => {
  if (channels[exchangeName]) return channels[exchangeName];

  await connectToRabbitMQ();
  const channel = await connection.createChannel();
  await channel.assertExchange(exchangeName, type, { durable });

  channels[exchangeName] = channel;
  logger.info(`Channel created for exchange: ${exchangeName}`);
  return channel;
};

export const publishEvent = async (
  exchangeName: string,
  routingKey: string,
  message: unknown
) => {
  const channel = await getChannelForExchange(exchangeName);
  channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(message)));
  logger.info(`Event published: ${exchangeName} -> ${routingKey}`);
};