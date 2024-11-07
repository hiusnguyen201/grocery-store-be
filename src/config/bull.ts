import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

export const bullConfig = BullModule.forRootAsync({
  useFactory: async (configService: ConfigService) => ({
    connection: {
      host: configService.get('redis.host'),
      port: configService.get<number>('redis.port'),
      username: configService.get('redis.username'),
      password: configService.get('redis.password'),
    },
  }),
  inject: [ConfigService],
});
