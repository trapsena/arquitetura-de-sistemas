// consumidor de estoque kafka
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'estoque-consumer',
  brokers: ['localhost:9094']
});

const consumer = kafka.consumer({ groupId: 'grupo-estoque' }); // Group ID diferente
const TOPIC_NAME = 'pedidos';

async function startConsumer() {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });

    console.log('[*] Serviço de Estoque conectado e esperando por eventos...');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const pedido = JSON.parse(message.value.toString());
        console.log(`[!] [Estoque] Recebido evento 'PedidoCriado' [ID: ${pedido.id}]. Atualizando o estoque...`);
        // Lógica de atualização do banco de dados de estoque aqui
      },
    });
    
  } catch (error) {
    console.error('Erro no consumidor de Estoque Kafka:', error);
    await consumer.disconnect();
    process.exit(1);
  }
}

startConsumer();