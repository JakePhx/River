import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from '@/_shared/interface/filters/domain-exception.filter';
import { main } from './_shared/infra/prisma/seed';

async function bootstrap() {
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
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'social-app-consumer',
        brokers: ['localhost:9092'],
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
