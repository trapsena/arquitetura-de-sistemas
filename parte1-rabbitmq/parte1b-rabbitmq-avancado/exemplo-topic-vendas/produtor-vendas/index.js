const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://admin:admin@localhost:5672';
const EXCHANGE_NAME = 'vendas_topic_exchange';
const EXCHANGE_TYPE = 'topic';

async function startProducer() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: false });
  console.log('Produtor de Vendas pronto.');

  const routingKeys = [
    'venda.br.sul',
    'venda.us.leste',
    'venda.br.nordeste',
    'venda.ar.sul',
    'venda.us.oeste'
  ];

  setInterval(() => {
    const routingKey = routingKeys[Math.floor(Math.random() * routingKeys.length)];
    const message = `Venda de $${(Math.random() * 1000).toFixed(2)} na região ${routingKey}`;

    channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(message));
    console.log(`[x] Evento de Venda Enviado [${routingKey}]: '${message}'`);
  }, 3000);
}

startProducer().catch(console.error);