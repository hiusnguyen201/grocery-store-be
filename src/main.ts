import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { abortOnError: false });

  // Set Prefix
  app.setGlobalPrefix('api/v1');

  // Enable Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  // Cors
  app.enableCors();

  await app.listen(app.get(ConfigService).get<number>('port'));
}
bootstrap();
