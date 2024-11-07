import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

export const mailerConfig = MailerModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    transport: {
      host: configService.get('mailer.host'),
      secure: true,
      auth: {
        user: configService.get('mailer.user'),
        pass: configService.get('mailer.pass'),
      },
    },
    defaults: {
      from: `"${configService.get('projectName')}" ${configService.get('mailer.user')}`,
    },
    template: {
      dir: join(__dirname, '../mail/templates'),
      adapter: new EjsAdapter(),
      options: {
        strict: false,
      },
    },
  }),
  inject: [ConfigService],
});
