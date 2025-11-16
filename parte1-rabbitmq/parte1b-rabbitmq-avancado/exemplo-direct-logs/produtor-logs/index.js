const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://admin:admin@localhost:5672';
const EXCHANGE_NAME = 'logs_direct_exchange';
const EXCHANGE_TYPE = 'direct';

async function startProducer() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: false });
  console.log('Produtor de Logs pronto.');

  const severities = ['info', 'warn', 'error'];
  let count = 0;

  setInterval(() => {
    const severity = severities[count % severities.length];
    const message = `Log #${count}: Esta é uma mensagem de [${severity.toUpperCase()}]`;

    channel.publish(EXCHANGE_NAME, severity, Buffer.from(message));
    
    console.log(`[x] Enviado [${severity}]: '${message}'`);
    count++;
  }, 2000);
}

startProducer().catch(console.error);