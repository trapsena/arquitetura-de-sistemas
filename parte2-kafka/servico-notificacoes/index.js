// consumidor de notificações kafka
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'notificacao-consumer',
  brokers: ['localhost:9094']
});

const consumer = kafka.consumer({ groupId: 'grupo-notificacoes' }); // Group ID diferente
const TOPIC_NAME = 'pedidos';

async function startConsumer() {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });
    
    console.log('[*] Serviço de Notificações conectado e esperando por eventos...');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const pedido = JSON.parse(message.value.toString());
        console.log(`[!] [Notificações] Recebido evento 'PedidoCriado' [ID: ${pedido.id}]. Enviando notificação para o cliente ${pedido.cliente}...`);
        // Lógica de envio de e-mail/SMS aqui
      },
    });

  } catch (error) {
    console.error('Erro no consumidor de Notificações Kafka:', error);
    await consumer.disconnect();
    process.exit(1);
  }
}

startConsumer();