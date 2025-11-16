const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://admin:admin@localhost:5672';
const EXCHANGE_NAME = 'vendas_topic_exchange';
const BINDING_PATTERN = 'venda.br.#';

async function startConsumer() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: false });

  const q = await channel.assertQueue('', { exclusive: true });
  console.log(`[*] Consumidor BRASIL esperando na fila: ${q.queue}`);

  channel.bindQueue(q.queue, EXCHANGE_NAME, BINDING_PATTERN);
  console.log(`--> Inscrito com o padrão: "${BINDING_PATTERN}"`);

  channel.consume(q.queue, (msg) => {
    console.log(`[🇧🇷 Dashboard Brasil] Recebido [${msg.fields.routingKey}]: ${msg.content.toString()}`);
  }, { noAck: true });
}

startConsumer().catch(console.error);