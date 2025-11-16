// consumidor de notificações
const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://admin:admin@localhost:5672';
const EXCHANGE_NAME = 'pedidos_exchange';
const EXCHANGE_TYPE = 'fanout';

async function startConsumer() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Este comando garante que uma exchange exista. Se não existir, ele a cria. Se já existir, ele não faz nada.
    await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: false });

    // Cria uma fila anônima e exclusiva para este consumidor
    const q = await channel.assertQueue('', { exclusive: true });
    console.log(`[*] Serviço de Notificações esperando por eventos na fila: ${q.queue}`);

    // Liga a fila à exchange para receber as mensagens
    channel.bindQueue(q.queue, EXCHANGE_NAME, '');

    channel.consume(q.queue, (msg) => {
      if (msg.content) {
        const pedido = JSON.parse(msg.content.toString());
        console.log(`[!] Recebido evento 'PedidoCriado' [ID: ${pedido.id}]. Enviando notificação para o cliente ${pedido.cliente}...`);
      }
    }, {
      noAck: true
    });

  } catch (error) {
    console.error('Erro no consumidor de Notificações:', error);
    setTimeout(startConsumer, 10000);
  }
}

startConsumer();