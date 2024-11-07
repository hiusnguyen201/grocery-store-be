import { Injectable } from '@nestjs/common';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    @InjectQueue(MailService.name) private readonly mailQueue: Queue,
  ) {}

  private async sendAsync(
    jobName: string,
    sendMailOptions: ISendMailOptions,
  ): Promise<void> {
    const job = await this.mailQueue.add(jobName, sendMailOptions);
    this.mailerService
      .sendMail(sendMailOptions)
      .then(async (_) => {
        await job.remove();
      })
      .catch((err) => {
        // Send error
        console.log(err);
      });
  }

  async sendPassword(email: string, password: string): Promise<void> {
    const JOB_NAME = 'SEND_PASSWORD';
    return await this.sendAsync(JOB_NAME, {
      to: email,
      subject: 'Send password for you ✔',
      template: 'send-password',
      context: {
        password,
      },
    });
  }

  async sendWelcome(email: string, senderName: string): Promise<void> {
    const JOB_NAME = 'SEND_WELCOME';
    return await this.sendAsync(JOB_NAME, {
      to: email,
      subject: `Welcome to ${senderName} ✔`,
      template: 'send-welcome',
    });
  }
}
