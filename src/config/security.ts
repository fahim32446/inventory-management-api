// security.ts

export const bearerAuthScheme = {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
} as const;
