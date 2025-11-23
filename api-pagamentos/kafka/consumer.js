const { Kafka } = require("kafkajs");
const { processarEventoDePagamento } = require("../services/paymentController");

const kafka = new Kafka({
  clientId: "payment-service",
  brokers: ["kafka:9092"],
});

const consumer = kafka.consumer({ groupId: "payment-group" });

async function startKafkaConsumer() {
  await consumer.connect();

  await consumer.subscribe({
    topic: "pedidos",
    fromBeginning: false,
  });

  console.log("📥 Payment-Service conectado ao Kafka. Aguardando pedidos...");

  await consumer.run({
  eachMessage: async ({ message }) => {
    const evento = JSON.parse(message.value.toString());
    console.log("📩 Evento recebido:", evento);

    await processarEventoDePagamento(evento);
  }
});
}

module.exports = { startKafkaConsumer };
