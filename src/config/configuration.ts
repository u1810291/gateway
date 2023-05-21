export default () => ({
  app: {
    hostname: process.env.APP_HOSTNAME || '0.0.0.0',
    port: parseInt(process.env.APP_PORT, 10) || 3000,
    corsOrigin: process.env.APP_CORS_ORIGIN || 'http://localhost:3000',
    environment: process.env.NODE_ENV || 'development',
  } as AppConfig,
  keycloak: {
    authServerUrl: process.env.KEYCLOAK_URL,
    realm: process.env.KEYCLOAK_REALM,
    clientId: process.env.KEYCLOAK_CLIENT_ID,
    secret: process.env.KEYCLOAK_SECRET,
  },
  typesense: {
    host: process.env.TYPESENSE_HOST || 'localhost',
    protocol: process.env.TYPESENSE_PROTOCOL,
    port: parseInt(process.env.TYPESENSE_PORT, 10) || 8108,
    apiKey: process.env.TYPESENSE_API_KEY,
    connectionTimeoutSeconds: parseInt(process.env.TYPESENSE_CONNECTION_TIMEOUT_SECONDS, 10) || 5,
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT,
    release: process.env.SENTRY_RELEASE,
    debug: process.env.SENTRY_DEBUG === 'true',
  } as SentryConfig,
  rmq: {
    login: process.env.RMQ_LOGIN || 'guest',
    password: process.env.RMQ_PASSWORD || 'guest',
    host: process.env.RMQ_HOST || 'localhost',
    port: parseInt(process.env.RMQ_PORT, 10) || 5672,
  } as RMQConfig,
  tms: {
    queue: process.env.TMS_QUEUE || 'tms',
  } as RMQClientConfig,
  wms: {
    queue: process.env.WMS_QUEUE || 'wms',
  } as RMQClientConfig,
  user: {
    queue: process.env.USER_QUEUE || 'user',
  } as RMQClientConfig,
  oms: {
    queue: process.env.OMS_QUEUE || 'oms',
  } as RMQClientConfig,
  geo: {
    queue: process.env.GEO_QUEUE || 'geo',
  } as RMQClientConfig,
  fms: {
    queue: process.env.FMS_QUEUE || 'fms',
  } as RMQClientConfig,
  postman: {
    queue: process.env.POSTMAN_QUEUE || 'postman',
  } as RMQClientConfig,
  matrix: {
    url: process.env.MATRIX_URL || 'http://10.0.1.35:8082',
  } as MatrixConfig,
})

export interface AppConfig {
  hostname: string
  port: number
  corsOrigin: string
  environment: string
}

export type RMQConfig = {
  login: string
  password: string
  host: string
  port: number
}

export interface RMQClientConfig {
  queue: string
}

export interface SentryConfig {
  dsn: string
  environment: string
  release: string
  debug: boolean
}

export interface MatrixConfig {
  url: string
}
