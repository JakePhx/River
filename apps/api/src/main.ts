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

  app.enableCors({
    origin: [CLIENT_URL],
    credentials: true,
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'social-app-consumer',
        brokers: KAFKA_BROKERS.split(','),
      },
      consumer: {
        groupId: 'social-app-consumer-group',
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
}

bootstrap();
