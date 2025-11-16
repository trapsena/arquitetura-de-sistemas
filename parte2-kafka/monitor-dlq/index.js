const { Kafka } = require('kafkajs');

const KAFKA_BROKERS = ['localhost:9094'];
const DLQ_TOPIC = 'pedidos.dlq';
const MONITOR_GROUP_ID = 'grupo-monitor-dlq';

const kafka = new Kafka({
  clientId: 'dlq-monitor-app',
  brokers: KAFKA_BROKERS,
});

const consumer = kafka.consumer({ groupId: MONITOR_GROUP_ID, fromBeginning: true });

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: DLQ_TOPIC, fromBeginning: true });

  console.log(`Monitor da DLQ conectado. Aguardando mensagens com erro em '${DLQ_TOPIC}'...`);

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const errorHeaders = {};
      if (message.headers) {
        Object.keys(message.headers).forEach(key => {
          errorHeaders[key] = message.headers[key].toString();
        });
      }

      console.log('----------------------------------------------------');
      console.log('MENSAGEM COM ERRO RECEBIDA NA DLQ!');
      console.log(`Conteúdo: ${message.value.toString()}`);
      console.log('Metadados do Erro:', errorHeaders);
      console.log('----------------------------------------------------');
    },
  });
}

run().catch(console.error);