const redis = require('redis');

let client;
let connected = false;

// Função para inicializar Redis
async function initRedis() {
  try {
    console.log(`[REDIS] Conectando em ${process.env.REDIS_HOST || 'redis-cache'}:${process.env.REDIS_PORT || 6379}`);
    
    client = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'redis-cache',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('[REDIS] Max reconnection attempts reached');
            return new Error('Max reconnect attempts');
          }
          return Math.min(retries * 50, 500);
        }
      }
    });

    // Event listeners
    client.on('error', (err) => {
      console.error('[REDIS] ❌ Error:', err.message);
      connected = false;
    });
    client.on('connect', () => {
      console.log('[REDIS] ✓ Conectado!');
      connected = true;
    });
    client.on('reconnecting', () => console.log('[REDIS] 🔄 Reconectando...'));

    // Conectar ao Redis
    await client.connect();
    connected = true;
    console.log('[REDIS] ✓ Cache inicializado e pronto!');
  } catch (err) {
    console.error('[REDIS] ⚠️  Erro ao conectar:', err.message);
    connected = false;
  }
}

// Inicializar na importação
initRedis();

/**
 * Middleware para cachear respostas GET
 * @param {number} ttlSeconds - Tempo de vida do cache em segundos
 */
const cacheMiddleware = (ttlSeconds) => {
  return async (req, res, next) => {
    console.log(`[CACHE] Middleware ativado para: ${req.method} ${req.originalUrl}`);

    // Só cachea GET
    if (req.method !== 'GET') {
      console.log(`[CACHE] ⏭️  Não é GET, pulando...`);
      return next();
    }

    // Não cachea se tiver query string específica (ex: ?bypass=true)
    if (req.query.bypass === 'true') {
      console.log(`[CACHE] ⏭️  Bypass ativado, pulando...`);
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      // Verifica se Redis está conectado
      if (!connected) {
        console.warn(`[CACHE] ⚠️  Redis não conectado, pulando cache`);
        return next();
      }

      console.log(`[CACHE] 🔍 Procurando: ${key}`);

      // Tenta recuperar do cache
      const cached = await client.get(key);
      if (cached) {
        console.log(`[CACHE] ✓ HIT! Retornando do cache`);
        res.set('X-Cache', 'HIT');
        return res.json(JSON.parse(cached));
      }
      
      console.log(`[CACHE] ✗ MISS. Deixando requisição passar...`);
    } catch (err) {
      console.error(`[CACHE] Erro ao acessar cache:`, err.message);
      // Se der erro no Redis, continua normal
    }

    // Intercepta res.json para cachear a resposta
    const originalJson = res.json.bind(res);
    res.json = function(data) {
      try {
        // Só cachea respostas bem-sucedidas (2xx)
        if (res.statusCode >= 200 && res.statusCode < 300 && connected) {
          console.log(`[CACHE] 💾 Salvando no cache por ${ttlSeconds}s: ${key}`);
          client.setEx(key, ttlSeconds, JSON.stringify(data)).catch((err) => {
            console.error('[CACHE] Erro ao setar cache:', err.message);
          });
          res.set('X-Cache', 'MISS');
        } else {
          console.log(`[CACHE] ⏭️  Status ${res.statusCode}, não cachando`);
        }
      } catch (err) {
        console.error('[CACHE] Erro ao processar cache:', err.message);
      }
      return originalJson(data);
    };

    next();
  };
};

/**
 * Limpar cache de uma rota específica
 */
const invalidateCache = async (pattern) => {
  try {
    if (!connected) {
      console.warn('[CACHE] ⚠️  Redis não conectado, não foi possível invalidar');
      return;
    }

    console.log(`[CACHE] 🗑️  Invalidando pattern: ${pattern}`);
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
      console.log(`[CACHE] ✓ ${keys.length} chave(s) deletada(s)`);
    } else {
      console.log(`[CACHE] ℹ️  Nenhuma chave encontrada com pattern: ${pattern}`);
    }
  } catch (err) {
    console.error('[CACHE] Erro ao invalidar:', err.message);
  }
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  redisClient: client
};