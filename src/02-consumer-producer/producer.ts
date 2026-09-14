import amqp from "amqplib";

async function producer() {
  try {
    const connection = await amqp.connect("amqp://admin:admin@localhost:5672");
    const channel = await connection.createChannel();

    const queue = "products";
    const message =  JSON.stringify({id: 1, name: "Product 1", price: 100 }); 

    await channel.assertQueue(queue);
    channel.sendToQueue(queue, Buffer.from(message),{
      contentType: "application/json"
    });

    console.log(`[X] Sent message: ${message}`);
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
