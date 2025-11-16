#!/bin/bash

NUM_TOPICS=5 

# Cluster 1
echo "Criando $NUM_TOPICS tópicos no Cluster 1..."

for i in $(seq 1 $NUM_TOPICS); do
  docker exec broker1 kafka-topics --create \
    --topic cluster1_teste_$i \
    --bootstrap-server broker1:19092,broker2:19093,broker3:19094 \
    --partitions 3 \
    --replication-factor 2 \
    --if-not-exists
done

echo "Tópicos do Cluster 1 criados com sucesso!"

# Cluster 2
echo "Criando $NUM_TOPICS tópicos no Cluster 2..."

for i in $(seq 1 $NUM_TOPICS); do
  docker exec broker4 kafka-topics --create \
    --topic cluster2_teste_$i \
    --bootstrap-server broker4:39192,broker5:39193,broker6:39194 \
    --partitions 3 \
    --replication-factor 2 \
    --if-not-exists
done

echo "Tópicos do Cluster 2 criados com sucesso!"
