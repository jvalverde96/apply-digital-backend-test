import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from 'src/modules/auth/jwt.guard';
import { ProductsModule } from 'src/modules/products/product.module';

@Module({
  imports: [ProductsModule],
  controllers: [ReportsController],
  providers: [ReportsService, JwtAuthGuard],
})
export class ReportsModule {}
