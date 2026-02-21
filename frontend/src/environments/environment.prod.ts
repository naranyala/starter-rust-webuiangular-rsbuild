export const environment = {
  production: true,
  logging: {
    enabled: true,
    minLevel: 'warn' as const,
    maxEntries: 1000,
    redactKeys: ['password', 'token', 'secret', 'authorization', 'cookie'],
  },
};
