// main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalValidationPipe } from './global-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Implements class validation for all api's
  app.useGlobalPipes(new GlobalValidationPipe());

  const options = new DocumentBuilder()
    .setTitle('Your API Documentation')
    .setDescription('API Documentation for your Nest.js app')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'api-key',
        description: 'The secret key to the api',
        in: 'header',
      },
      'api-key',
    )
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  app.enableCors();
  await app.listen(3000);
}
bootstrap();
