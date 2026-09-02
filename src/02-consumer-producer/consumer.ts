import amqp from "amqplib";

async function consumer() {
  try {
    const connection = await amqp.connect("amqp://admin:admin@localhost:5672");
    const channel = await connection.createChannel();

    const queue = "hello";

    await channel.assertQueue(queue);
    console.log(`[X] Waiting for messages in ${queue}`);

    channel.consume(queue, (msg) => {
      if (msg) {
        console.log(`[X] Received ${msg.content.toString()}`);
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("Failed to send message to RabbitMQ", error);
  }
}

consumer().catch((error) => {
  console.error("Failed to run consumer", error);
});
