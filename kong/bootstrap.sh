#!/bin/sh
set -e

KONG_ADMIN_URL="http://kong-gateway:8001"

echo "Waiting for Kong Admin API..."
until curl -s $KONG_ADMIN_URL/status -o /dev/null; do
  echo "Kong Admin not ready yet..."
  sleep 2
done

echo "Kong Admin is up, applying configuration..."
sleep 3

#
# Helper functions
#

create_service() {
  name="$1"
  url="$2"
  
  # Verifica se já existe
  exists=$(curl -s "$KONG_ADMIN_URL/services/$name" | grep -c "\"id\"" || true)
  if [ "$exists" -eq 1 ]; then
    echo "✓ Service $name already exists"
    return 0
  fi
  
  echo "Creating service: $name -> $url"
  curl -s -X POST $KONG_ADMIN_URL/services \
    --data "name=$name" \
    --data "url=$url" >/dev/null 2>&1 || true
}

create_route() {
  svc="$1"
  route_name="$2"
  path="$3"
  
  # Verifica se já existe (busca no array data)
  exists=$(curl -s "$KONG_ADMIN_URL/routes" | grep -c "\"name\":\"$route_name\"" || echo "0")
  
  if [ "$exists" -gt 0 ]; then
    echo "✓ Route $route_name already exists"
    return 0
  fi
  
  echo "Creating route: $route_name for $svc at $path"
  
  response=$(curl -s -X POST $KONG_ADMIN_URL/services/$svc/routes \
    --data "name=$route_name" \
    --data "paths[]=$path" \
    --data "methods[]=GET" \
    --data "methods[]=POST" \
    --data "methods[]=PUT" \
    --data "methods[]=DELETE" \
    --data "methods[]=PATCH" \
    --data "strip_path=false")
  
  echo "Response: $response"
}

create_service_plugin() {
  svc="$1"
  plugin="$2"
  shift 2
  
  # Tenta criar, ignora se já existe
  echo "Creating plugin $plugin for $svc"
  curl -s -X POST $KONG_ADMIN_URL/services/$svc/plugins \
    --data "name=$plugin" "$@" 2>/dev/null | grep -q "unique constraint" && echo "✓ Plugin $plugin already exists" || true
}

create_global_plugin() {
  plugin="$1"
  shift 1
  echo "Creating global plugin: $plugin"
  curl -s -X POST $KONG_ADMIN_URL/plugins \
    --data "name=$plugin" "$@" 2>/dev/null | grep -q "unique constraint" && echo "✓ Plugin $plugin already exists" || true
}

create_consumer() {
  username="$1"
  
  # Verifica se já existe
  exists=$(curl -s "$KONG_ADMIN_URL/consumers/$username" | grep -c "\"username\"" || true)
  if [ "$exists" -eq 1 ]; then
    echo "✓ Consumer $username already exists"
    return 0
  fi
  
  echo "Creating consumer: $username"
  curl -s -X POST $KONG_ADMIN_URL/consumers \
    --data "username=$username" >/dev/null 2>&1 || true
}

create_consumer_key_auth() {
  username="$1"
  
  # Verifica se já existe chave
  exists=$(curl -s "$KONG_ADMIN_URL/consumers/$username/key-auth" | grep -c "\"key\"" || true)
  if [ "$exists" -gt 0 ]; then
    echo "✓ API key already exists for $username"
    return 0
  fi
  
  echo "Creating key-auth for consumer: $username"
  curl -s -X POST $KONG_ADMIN_URL/consumers/$username/key-auth >/dev/null 2>&1 || true
}

#
# MICROSERVIÇOS DO PROJETO
#

# users -> porta 3002
create_service "api-usuarios" "http://api-usuarios:3002"
create_route   "api-usuarios" "usuarios-route" "/users"

# products -> porta 3001
create_service "api-produtos" "http://api-produtos:3001"
create_route   "api-produtos" "produtos-route" "/products"

# orders -> porta 3004
create_service "api-pedidos" "http://api-pedidos:3004"
create_route   "api-pedidos" "pedidos-route" "/orders"

# payments -> porta 3003
create_service "api-pagamentos" "http://api-pagamentos:3003"
create_route   "api-pagamentos" "pagamentos-route" "/payments"

#
# Plugins por microserviço (Key-Auth + Rate Limiting + Request Size)
#

echo ""
echo "=== Applying Plugins ==="

for svc in api-usuarios api-produtos api-pedidos api-pagamentos; do
  echo "Configuring $svc..."
  
  # Key-Auth com nome da chave como "apikey"
  create_service_plugin "$svc" "key-auth" \
    --data "config.key_names[]=apikey"
  
  # Rate Limiting
  create_service_plugin "$svc" "rate-limiting" \
    --data "config.minute=100" \
    --data "config.policy=local"
  
  # Request Size Limiting
  create_service_plugin "$svc" "request-size-limiting" \
    --data "config.allowed_payload_size=128" \
    --data "config.size_unit=kilobytes"
done

#
# Global Prometheus Plugin
#
create_global_plugin "prometheus"

#
# Criar Consumidores e suas chaves de API
#
echo ""
echo "=== Creating Consumers ==="

for consumer in frontend-app mobile-app backend-service; do
  create_consumer "$consumer"
  echo "Generating API key for $consumer..."
  create_consumer_key_auth "$consumer"
done

echo ""
echo "✓ Kong bootstrap finished successfully!"
echo ""
echo "=== PRÓXIMOS PASSOS ==="
echo "1. Recupere a chave de API:"
echo "   curl http://localhost:8001/consumers/frontend-app/key-auth"
echo ""
echo "2. Use no Postman com o header:"
echo "   apikey: <SUA_CHAVE_GERADA>"
echo ""
echo "3. Faça a requisição:"
echo "   GET http://localhost:8000/users"
echo ""

echo ""
echo "Kong bootstrap completed!"