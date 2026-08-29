import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3000);
  const frontOrigin = config.get<string>('FRONT_ORIGIN', 'http://localhost:5173');

  app.setGlobalPrefix('api/v1');

  app.enableCors({ origin: frontOrigin.split(','), credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.useGlobalFilters(new ApiExceptionFilter());

  const publicDir = path.resolve(process.cwd(), 'public');
  app.useStaticAssets(publicDir, { index: false, fallthrough: true });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}/api/v1`);
  console.log(`Frontend served from ${publicDir}`);
}
bootstrap();
