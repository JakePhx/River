import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TOKENS } from '../../application/tokens';
import { KAFKA_BROKERS } from '../../application/env';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: TOKENS.KAFKA_SERVICE,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'social-app',
            brokers: KAFKA_BROKERS.split(',').map((b) => b.trim()),
            connectionTimeout: 10_000,
            retry: {
              retries: 10,
              initialRetryTime: 300,
            },
            allowAutoTopicCreation: true,
          },
          producer: {
            allowAutoTopicCreation: true,
          },
          consumer: {
            groupId: 'social-app-producer',
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class KafkaModule {}
