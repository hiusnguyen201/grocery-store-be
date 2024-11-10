import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import config from './config/configuration';
import { databaseConfig } from './config/database';
import { queueConfig } from './config/queue';
import { throttlerConfig } from './config/throttler';
import { scheduleConfig } from './config/schedule';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { PriceHistoriesModule } from './price-histories/price-histories.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [config],
    }),
    // Database
    databaseConfig,
    // Schedules
    scheduleConfig,
    // Queues
    queueConfig,
    // Rate Limit
    throttlerConfig,

    //Modules
    ProductsModule,
    UsersModule,
    AuthModule,
    MailModule,
    CloudinaryModule,
    PriceHistoriesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
