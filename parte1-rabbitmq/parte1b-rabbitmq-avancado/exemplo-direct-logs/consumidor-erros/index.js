const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://admin:admin@localhost:5672';
const EXCHANGE_NAME = 'logs_direct_exchange';

async function startConsumer() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: false });

  // Fila exclusiva para este consumidor
  const q = await channel.assertQueue('', { exclusive: true });
  console.log(`[*] Consumidor de ERROS esperando na fila: ${q.queue}`);

  channel.bindQueue(q.queue, EXCHANGE_NAME, 'error');
  console.log("--> Inscrito APENAS para a routing key 'error'.");

  channel.consume(q.queue, (msg) => {
    console.log(`[!] [ERRO GRAVE] Recebido: ${msg.content.toString()}`);
  }, { noAck: true });
}

startConsumer().catch(console.error);