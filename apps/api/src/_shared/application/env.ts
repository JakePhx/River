export const ENVIRONMENT = process.env.ENVIRONMENT || '';
export const DATABASE_URL = process.env.DATABASE_URL || '';
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || '';
export const KAFKA_BROKERS = process.env.KAFKA_BROKERS || '';
export const CLIENT_URL = process.env.CLIENT_URL || '';
export const KAFKAJS_NO_PARTITIONER_WARNING =
  process.env.KAFKAJS_NO_PARTITIONER_WARNING || '';

export const validateAllEnvs = () => {
  if (!ENVIRONMENT) {
    throw new Error('ENVIRONMENT is not set');
  }
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  if (!JWT_ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET is not set');
  }
  if (!KAFKA_BROKERS) {
    throw new Error('KAFKA_BROKERS is not set');
  }
  if (!CLIENT_URL) {
    throw new Error('CLIENT_URL is not set');
  }
};
