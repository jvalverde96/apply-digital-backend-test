import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import logger from './utils/logger';
import { HttpExceptionFilter } from './utils/error-handler';

async function bootstrap() {
  logger.info('Loading environment variables...');
  dotenv.config();

  logger.info('Creating NEST application...');
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  const config = new DocumentBuilder()
    .setTitle('Product API')
    .setDescription('API to manage products from Contentful')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  logger.info('Server has started successfully!');
}
bootstrap();
