// produtor
const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://admin:admin@localhost:5672';
const EXCHANGE_NAME = 'pedidos_exchange';
const EXCHANGE_TYPE = 'fanout';

async function startProducer() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Garante que a exchange exista
    await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: false });

    console.log('Produtor conectado ao RabbitMQ e pronto para enviar eventos.');

    // Simula a criação de um novo pedido a cada 5 segundos
    setInterval(() => {
      const pedido = {
        id: Math.floor(Math.random() * 1000),
        cliente: 'Cliente ' + Math.floor(Math.random() * 100),
        valor: (Math.random() * 500).toFixed(2),
        criadoEm: new Date().toISOString()
      };

      const message = JSON.stringify(pedido);
      
      // Publica a mensagem na exchange, sem uma routing key específica (fanout ignora)
      channel.publish(EXCHANGE_NAME, '', Buffer.from(message));
      
      console.log(`[x] Evento 'PedidoCriado' enviado: ${message}`);
    }, 5000);

  } catch (error) {
    console.error('Erro no produtor RabbitMQ:', error);
    // Tenta reconectar após um tempo
    setTimeout(startProducer, 10000);
  }
}

startProducer();