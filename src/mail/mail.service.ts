import { Injectable } from '@nestjs/common';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  private async sendAsync(
    featureName: string,
    sendMailOptions: ISendMailOptions,
  ): Promise<void> {
    await this.mailerService.sendMail(sendMailOptions).catch((err) => {
      console.log(err);
    });
  }

  async sendPassword(email: string, password: string): Promise<void> {
    const FEATURE_NAME = 'SEND_PASSWORD';

    await this.sendAsync(FEATURE_NAME, {
      to: email,
      subject: 'Send password for you ✔',
      template: 'send-password',
      context: {
        password,
      },
    });
  }

  async sendWelcome(email: string, senderName: string): Promise<void> {
    const FEATURE_NAME = 'SEND_WELCOME';

    await this.sendAsync(FEATURE_NAME, {
      to: email,
      subject: `Welcome to ${senderName} ✔`,
      template: 'send-welcome',
    });
  }
}
