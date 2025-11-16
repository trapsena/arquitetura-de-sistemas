const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672';
const EXCHANGE_NAME = 'transacoes_durable_exchange';
const ROUTING_KEY = 'transacao.critica';
const QUEUE_NAME = 'auditoria_transacoes';

async function startAuditoriaConsumer() {
  try {
    // 1️⃣ Conecta ao RabbitMQ
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // 2️⃣ Garante que a exchange e a fila existem
    await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // 3️⃣ Liga a fila à exchange (com routing key)
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

    console.log('📥 Auditoria aguardando eventos de pagamento...');

    // 4️⃣ Começa a consumir mensagens
    channel.consume(
      QUEUE_NAME,
      (msg) => {
        if (msg !== null) {
          const evento = JSON.parse(msg.content.toString());

          console.log('📘 Evento recebido da Auditoria:');
          console.log('----------------------------------------');
          console.log(`🧾 Pedido: ${evento.pedidoId}`);
          console.log(`💰 Status: ${evento.status}`);
          if (evento.metodo) console.log(`🏦 Método: ${evento.metodo}`);
          if (evento.total) console.log(`💵 Valor: R$${evento.total}`);
          if (evento.motivo) console.log(`⚠️ Motivo: ${evento.motivo}`);
          console.log(`📅 Data: ${new Date().toLocaleString()}`);
          console.log('----------------------------------------\n');

          // Aqui você pode salvar no banco, enviar email, etc.
          // Exemplo: salvar num log ou banco MongoDB/Postgres

          channel.ack(msg); // marca mensagem como processada
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error('❌ Erro no consumidor de auditoria:', error.message);
    setTimeout(startAuditoriaConsumer, 5000); // tenta reconectar
  }
}

// Inicia o consumidor
startAuditoriaConsumer();
