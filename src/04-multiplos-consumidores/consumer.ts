import amqp from "amqplib";

async function consumer() {
  try {
    const connection = await amqp.connect("amqp://admin:admin@localhost:5672");
    const channel = await connection.createChannel();

    const queue = "products";

    await channel.assertQueue(queue);
    console.log(`[X] Waiting for messages in ${queue}`);

    channel.consume(queue, (msg) => {
      if (msg) {
        const obj = JSON.parse(msg.content.toString());
        console.log(`[X] Received ${JSON.stringify(obj)}`);
        console.log(`${msg.properties.contentType} is the content type of the message`);

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
