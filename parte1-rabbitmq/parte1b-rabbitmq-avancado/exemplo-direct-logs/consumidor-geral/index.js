const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://admin:admin@localhost:5672';
const EXCHANGE_NAME = 'logs_direct_exchange';

async function startConsumer() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: false });
  
  const q = await channel.assertQueue('', { exclusive: true });
  console.log(`[*] Consumidor GERAL esperando na fila: ${q.queue}`);
  
  channel.bindQueue(q.queue, EXCHANGE_NAME, 'info');
  channel.bindQueue(q.queue, EXCHANGE_NAME, 'warn');
  console.log("--> Inscrito para as routing keys 'info' e 'warn'.");

  channel.consume(q.queue, (msg) => {
    console.log(`[i] [LOG GERAL] Recebido [${msg.fields.routingKey}]: ${msg.content.toString()}`);
  }, { noAck: true });
}

startConsumer().catch(console.error);