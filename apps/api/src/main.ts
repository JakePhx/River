import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from '@/_shared/interface/filters/domain-exception.filter';
import { main } from './_shared/infra/prisma/seed';
import {
  validateAllEnvs,
  KAFKA_BROKERS,
  CLIENT_URL,
} from './_shared/application/env';

async function bootstrap() {
  validateAllEnvs();

  if (process.env.ENVIRONMENT === 'development') {
    await main();
  }

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new DomainExceptionFilter());

  const corsOrigins =
    process.env.ENVIRONMENT === 'development'
      ? Array.from(
          new Set([
            CLIENT_URL,
            'http://localhost:5173',
            'http://127.0.0.1:5173',
          ]),
        )
      : [CLIENT_URL];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'social-app-consumer',
        brokers: KAFKA_BROKERS.split(',').map((b) => b.trim()),
        connectionTimeout: 10_000,
        requestTimeout: 30_000,
        retry: {
          retries: 10,
          initialRetryTime: 300,
          maxRetryTime: 30_000,
        },
      },
      consumer: {
        groupId: 'social-app-consumer-group',
        allowAutoTopicCreation: true,
        sessionTimeout: 30_000,
        heartbeatInterval: 3_000,
      },
      subscribe: {
        fromBeginning: true,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
}

bootstrap();
