import amqp from "amqplib";

async function producer() {
  try {
    const connection = await amqp.connect("amqp://admin:admin@localhost:5672");
    const channel = await connection.createChannel();

    const queue = "products";

    const messages = new Array(10000).fill(0).map((_, i) => ({
      id: i,
      name: `Product ${i}`,
      price: Math.floor(Math.random() * 100) + 1,
    }));

    await Promise.all(
      messages.map((message) => {
        return channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
          contentType: "application/json",
         })
      })
    );
    console.log(`[X] Sent all messages to queue: ${queue}`);

    setTimeout(async () => {
      await connection.close();
      process.exit(0);
    }, 30000);
  } catch (error) {
    console.error("Failed to send message to RabbitMQ", error);
  }
}

producer().catch((error) => {
  console.error("Failed to run producer", error);
});
