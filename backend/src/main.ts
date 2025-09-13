import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    logger.log('Starting User Entries Backend Application...');

    const app = await NestFactory.create(AppModule);
    logger.log('NestJS application created successfully');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    logger.log('Global validation pipe configured');

    const port = process.env.PORT || 8080;
    const environment = process.env.NODE_ENV || 'development';

    await app.listen(port, '0.0.0.0');

    logger.log(`🚀 Application successfully started!`);
    logger.log(`🌍 Environment: ${environment}`);
    logger.log(`🔗 Server running on: http://localhost:${port}`);
    logger.log(`📊 Health check: http://localhost:${port}/entries`);
  } catch (error) {
    logger.error('Failed to start application', error.stack);
    process.exit(1);
  }
}

bootstrap();
