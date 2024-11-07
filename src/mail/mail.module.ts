import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { BullModule } from '@nestjs/bullmq';
import { mailerConfig } from 'src/config/mailer';

@Module({
  imports: [
    mailerConfig,
    BullModule.registerQueue({
      name: MailService.name,
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
