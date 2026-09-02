import amqp from "amqplib";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function connect() {
  try {
    const connection = await amqp.connect("amqp://admin:admin@localhost:5672");
    console.log("Connected to RabbitMQ");
    const channel = await connection.createChannel();
    console.log("Canal criado com sucesso");
    await sleep(30000);

    await channel.close();
    await connection.close();
    console.log("Connection closed");
  } catch (error) {
    console.error("Failed to connect to RabbitMQ", error);
  }
}

connect();
