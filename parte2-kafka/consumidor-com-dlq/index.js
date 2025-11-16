const { Kafka } = require('kafkajs');

const KAFKA_BROKERS = ['localhost:9094'];
const MAIN_TOPIC = 'pedidos';
const DLQ_TOPIC = 'pedidos.dlq';
const CONSUMER_GROUP_ID = 'grupo-notificacoes-com-dlq';

const kafka = new Kafka({
  clientId: 'notificacao-app',
  brokers: KAFKA_BROKERS,
});

const consumer = kafka.consumer({ groupId: CONSUMER_GROUP_ID });
const dlqProducer = kafka.producer();

async function run() {
  await consumer.connect();
  await dlqProducer.connect();
  await consumer.subscribe({ topic: MAIN_TOPIC, fromBeginning: true });

  console.log(`Consumidor principal conectado e inscrito no tópico '${MAIN_TOPIC}'`);
  console.log(`Configurado para enviar mensagens com falha para o tópico '${DLQ_TOPIC}'`);

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const pedidoString = message.value.toString();
      const pedido = JSON.parse(pedidoString);
      
      try {
        console.log(`Processando pedido ID: ${pedido.id}...`);

        if (pedido.id % 5 === 0) {
          throw new Error(`ERRO DE NEGÓCIO: Cliente inválido para o pedido ID ${pedido.id}`);
        }
        
        console.log(`Notificação enviada para o pedido ID: ${pedido.id}`);

      } catch (error) {
        console.error(`Falha ao processar pedido ID ${pedido.id}: ${error.message}`);
        
        await dlqProducer.send({
          topic: DLQ_TOPIC,
          messages: [
            {
              // Enviamos a mensagem original, sem modificação
              key: message.key,
              value: message.value,
              // É uma boa prática adicionar headers com informações do erro
              headers: {
                'error-reason': error.message,
                'original-topic': topic,
                'original-partition': partition.toString(),
                'original-offset': message.offset,
              },
            },
          ],
        });
        
        console.log(`[➡️] Mensagem do pedido ID ${pedido.id} enviada para a DLQ.`);
      }
      
      // O kafkajs com 'eachMessage' comita o offset automaticamente
      // após a função ser concluída sem lançar uma exceção não capturada.
      // Como nosso 'catch' lida com o erro, o offset será comitado e não receberemos a mensagem de novo.
    },
  });
}

run().catch(async (error) => {
  console.error('Erro fatal:', error);
  await consumer.disconnect();
  await dlqProducer.disconnect();
  process.exit(1);
});