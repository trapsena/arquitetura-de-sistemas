const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://admin:admin@localhost:5672';
const EXCHANGE_NAME = 'transacoes_durable_exchange';
const ROUTING_KEY = 'transacao.critica';

async function startSafeProducer() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    
    // 1. Usamos um 'ConfirmChannel' em vez de um canal comum.
    // Isso é essencial para ter callbacks de confirmação do broker.
    const channel = await connection.createConfirmChannel();

    console.log('Canal com Confirmação criado.');

    // 2. Exchange DURÁVEL (durable: true)
    // Se o RabbitMQ reiniciar, esta exchange continuará existindo.
    await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });

    // Handler para mensagens retornadas (quando mandatory: true falha)
    channel.on('return', (msg) => {
      console.error(`MENSAGEM DEVOLVIDA! Não foi possível rotear para nenhuma fila: ${msg.content.toString()}`);
    });

    let count = 1;

    setInterval(() => {
      const transacao = { id: count++, valor: Math.floor(Math.random() * 5000), timestamp: new Date() };
      const message = JSON.stringify(transacao);

      console.log(`Enviando transação ID ${transacao.id}...`);

      // 3. Publicação com garantias
      channel.publish(
        EXCHANGE_NAME,
        ROUTING_KEY,
        Buffer.from(message),
        {
          // a) Garante que a mensagem seja escrita no disco do servidor RabbitMQ
          persistent: true, // ou deliveryMode: 2 (são alias um do outro)
          
          // b) Se a mensagem não puder ser entregue a NENHUMA fila, o broker DEVE devolvê-la ao produtor.
          // Isso evita "buracos negros" silenciosos se a fila não existir.
          mandatory: true 
        },
        // c) Callback de confirmação (Graças ao ConfirmChannel)
        (err, ok) => {
          if (err) {
            // Ocorreu um erro no broker (ex: disco cheio, erro interno)
            console.error(`FALHA ao confirmar transação ID ${transacao.id}:`, err);
            // Lógica de retentativa aqui!
          } else {
            // O broker confirmou que recebeu E persistiu a mensagem (se ela for persistent)
            console.log(`Transação ID ${transacao.id} confirmada pelo broker.`);
          }
        }
      );

    }, 5000);

  } catch (error) {
    console.error('Erro fatal no produtor:', error);
  }
}

startSafeProducer();