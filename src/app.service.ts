import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { spawn } from 'child_process';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { CloudinaryService } from './cloudinary/cloudinary.service';

@Injectable()
export class AppService {
  constructor(
    private configService: ConfigService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  backupDatabase() {
    const fileName = `${new Date().getTime()}-db`;
    const filePath = `./backup/${fileName}.gzip`;

    if (!existsSync('./backup')) {
      mkdirSync('./backup');
    }

    const child = spawn('mongodump', [
      `--uri="${this.configService.get('mongoUri')}"`,
      `--gzip`,
      `--archive="${filePath}"`,
    ]);

    child.on('exit', async (code, signal) => {
      if (!code && !signal) {
        try {
          const result = await this.cloudinaryService.uploadFile(
            filePath,
            'database',
            fileName,
          );
          if (result) {
            unlinkSync(filePath);
          }
        } catch (err) {
          // Gui message
          console.log(err);
        }
      }
    });
  }
}
