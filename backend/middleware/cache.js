// backend/middleware/cache.js
import apicache from 'apicache';

const cache = apicache.options({
  headerBlacklist: ['authorization'],
  statusCodes: { exclude: [401, 403, 500] },
  appendKey: (req, res) => req.originalUrl
}).middleware;

export const cacheRoute = (duration, group = 'addresses') =>
  cache(duration, (_req, _res) => group);
export const clearCacheGroup = (group = 'addresses') =>
  apicache.clear(group);