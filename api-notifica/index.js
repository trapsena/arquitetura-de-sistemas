const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672';
const EXCHANGE_NAME = 'transacoes_durable_exchange';
const ROUTING_KEY = 'transacao.critica';
const QUEUE_NAME = 'auditoria_transacoes';

async function startAuditoriaConsumer() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

    console.log("📥 Auditoria aguardando *transações*...");

    channel.consume(
      QUEUE_NAME,
      (msg) => {
        if (!msg) return;

        // 🔄 Agora chamamos de transacao
        const transacao = JSON.parse(msg.content.toString());

        console.log("📘 Transação recebida:");
        console.log("----------------------------------------");
        console.log(`🧾 Pedido: ${transacao.pedidoId}`);
        console.log(`💰 Status: ${transacao.status}`);
        if (transacao.metodo) console.log(`🏦 Método: ${transacao.metodo}`);
        if (transacao.total) console.log(`💵 Valor: R$${transacao.total}`);
        if (transacao.motivo) console.log(`⚠️ Motivo: ${transacao.motivo}`);
        console.log(`🕒 Data Evento: ${transacao.timestamp}`);
        console.log("----------------------------------------\n");

        // aqui você salva no banco, envia email, etc

        channel.ack(msg);
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("❌ Erro no consumidor de transações:", error.message);
    setTimeout(startAuditoriaConsumer, 5000);
  }
}

startAuditoriaConsumer();
