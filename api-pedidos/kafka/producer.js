const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  brokers: ["kafka:9092"], // dentro do docker
  clientId: "order-service"
});

const producer = kafka.producer({
  allowAutoTopicCreation: true
});

async function enviarPedidoKafka(evento) {
  await producer.connect();

  await producer.send({
    topic: "pedidos",
    messages: [
      {
        value: JSON.stringify(evento)
      }
    ]
  });

  console.log("📤 Evento enviado para o tópico 'pedidos':", evento);
}

module.exports = { enviarPedidoKafka };
