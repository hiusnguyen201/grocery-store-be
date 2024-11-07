import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

export const queueConfig = BullModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    connection: {
      host: configService.get('redis.host'),
      port: configService.get('redis.port'),
      username: configService.get('redis.username'),
      password: configService.get('redis.password'),
    },
  }),
  inject: [ConfigService],
});
