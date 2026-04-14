import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // 1. Create Hybrid Application (HTTP + Kafka)
  const app = await NestFactory.create(AppModule);

  // 2. Setup Kafka Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      },
      consumer: {
        groupId: 'orchestrator-consumer',
      },
    },
  });

  // 3. Global Pipes & Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 4. Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Abyss Orchestrator API')
    .setDescription('Central Nervous System for AI Flow Execution and Saga Management')
    .setVersion('1.0')
    .addTag('flows')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // 5. Start all services
  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3001);
  
  console.log(`[Abyss] Orchestrator is running on: ${await app.getUrl()}`);
  console.log(`[Abyss] Swagger documentation: ${await app.getUrl()}/docs`);
}
bootstrap();
