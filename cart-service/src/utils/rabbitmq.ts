import amqp from "amqplib"
import logger from "./logger"

let connection: any = null
let channel: any = null

const EXCHANGE_NAME = "product_events"

export const connectToRabbitMQ = async (): Promise<any> => {
	if (channel) return channel // already connected

	try {
		if (!connection) {
			connection = await amqp.connect(process.env.RABBITMQ_URL as string)
		}

		channel = await connection.createChannel()
		await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false })
		logger.info("Connected to RabbitMQ")

		return channel
	} catch (error) {
		logger.error("Error connecting to RabbitMQ:", error)
		throw error
	}
}

export const publishEvent = async (
	routingKey: string,
	message: unknown
): Promise<void> => {
	if (!channel) {
		await connectToRabbitMQ()
	}

	// Non-null assertion because connectToRabbitMQ ensures channel exists
	channel!.publish(
		EXCHANGE_NAME,
		routingKey,
		Buffer.from(JSON.stringify(message))
	)
	logger.info(`Event published: ${routingKey}`)
}

export const consumeEvent = async (
	routingKey: string,
	callback: (msg: any) => void
): Promise<void> => {
	if (!channel) {
		await connectToRabbitMQ()
	}
  const q = await channel.assertQueue("", {exclusive: true})

  await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey)

  channel.consume(q.queue, (msg: any) => {
    if (msg !== null) {
      const content = JSON.parse(msg.content.toString())
      callback(content)
      channel.ack(msg)
    }
  })

  logger.info(`Subscribed to event: ${routingKey}`)
}
