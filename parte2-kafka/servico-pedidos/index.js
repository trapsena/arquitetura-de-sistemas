// produtor kafka
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'pedido-producer',
  brokers: ['localhost:9094']
});

const producer = kafka.producer();
const TOPIC_NAME = 'pedidos';

async function startProducer() {
  try {
    await producer.connect();
    console.log('Produtor conectado ao Kafka e pronto para enviar eventos.');

    setInterval(() => {
      const pedido = {
        id: Math.floor(Math.random() * 1000),
        cliente: 'Cliente ' + Math.floor(Math.random() * 100),
        valor: (Math.random() * 500).toFixed(2),
        criadoEm: new Date().toISOString()
      };

      const message = {
        key: pedido.id.toString(),
        value: JSON.stringify(pedido)
      };

      producer.send({
        topic: TOPIC_NAME,
        messages: [message],
      });

      console.log(`[x] Evento 'PedidoCriado' enviado ao tópico '${TOPIC_NAME}': ${message.value}`);
    }, 5000);

  } catch (error) {
    console.error('Erro no produtor Kafka:', error);
    await producer.disconnect();
    process.exit(1);
  }
}

startProducer();