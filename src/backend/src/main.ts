import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new ConfigService();
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    transformOptions: {
      exposeDefaultValues: true,
    },
  }))
  app.enableCors()

  await app.listen(config.httpPort);
}
bootstrap();
