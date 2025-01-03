import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './modules/products/product.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportsModule } from './modules/reports/reports.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'db',
      port: +process.env.POSTGRES_PORT || 5432,
      username: process.env.POSTGRES_USER || 'admin',
      password: process.env.POSTGRES_PASSWORD || 'welcome123',
      database: process.env.POSTGRES_DB || 'products_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    ProductsModule,
    ReportsModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
