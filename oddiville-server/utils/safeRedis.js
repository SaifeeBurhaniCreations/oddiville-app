module.exports = async function safeRedis(redis, fn) {
  try {
    if (!redis || redis.status !== 'ready') return null;
    return await fn(redis);
  } catch (e) {
    console.error('[Redis safe error]', e.message);
    return null;
  }
};