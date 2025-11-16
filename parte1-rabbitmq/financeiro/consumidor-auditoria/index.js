const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://admin:admin@localhost:5672';
const EXCHANGE_NAME = 'transacoes_durable_exchange';
const QUEUE_NAME = 'fila_auditoria_durable';
const ROUTING_KEY = 'transacao.critica';

async function startResilientConsumer() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // 1. Garante que a exchange durável existe
    await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });

    // 2. Fila DURÁVEL (durable: true) e com NOME FIXO.
    // NÃO é exclusiva. Se este consumidor cair e voltar, ele reconecta na MESMA fila
    // e continua de onde parou, sem perder mensagens que chegaram durante a queda.
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    
    // 3. Liga a fila à exchange
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

    // 4. QoS (Quality of Service): Pré-carrega apenas 1 mensagem por vez.
    // O RabbitMQ não enviará outra mensagem até que a atual seja confirmada (ack).
    // Isso impede que um consumidor trave segurando milhares de mensagens não processadas em memória.
    channel.prefetch(1);

    console.log(`[*] Auditoria pronta. Aguardando transações na fila durável '${QUEUE_NAME}'.`);

    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg.content) {
        const transacao = JSON.parse(msg.content.toString());
        console.log(`Recebida Transação ID ${transacao.id}. Processando...`);

        // Simula um processamento demorado e perigoso (ex: salvar no banco de dados)
        setTimeout(() => {
            console.log(`Transação ID ${transacao.id} salva no banco de dados.`);
            
            // 5. CONFIRMAÇÃO MANUAL (ACK)
            // Só dizemos ao RabbitMQ para apagar a mensagem DEPOIS que terminamos tudo com sucesso.
            // Se o processo morrer antes dessa linha, a mensagem volta para a fila.
            channel.ack(msg);
            console.log(`ACK enviado para ID ${transacao.id}`);

        }, 2000); // Demora 2 segundos para processar
      }
    }, { 
      // DESLIGA a confirmação automática. Essencial para confiabilidade.
      noAck: false 
    });

  } catch (error) {
    console.error('Erro no consumidor:', error);
  }
}

startResilientConsumer();