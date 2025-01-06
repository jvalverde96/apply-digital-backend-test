import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { ProductProperties } from 'src/constants/constants';
import { CustomReport } from 'src/types/types';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  // Report 1: Percentage of Deleted Products
  async getDeletedPercentage(): Promise<number> {
    const total = await this.productRepository.count();
    const deleted = await this.productRepository.count({
      where: { deleted: true },
    });
    return (deleted / total) * 100;
  }

  // Report 2: Percentage of Non-Deleted Products with optional filters (price, date range)
  async getNonDeletedPercentage(
    withPrice?: boolean,
    startDate?: string,
    endDate?: string,
  ): Promise<number> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    queryBuilder.where('product.deleted = :deleted', { deleted: false });

    if (withPrice !== undefined) {
      if (withPrice) {
        queryBuilder.andWhere('product.price IS NOT NULL');
      } else {
        queryBuilder.andWhere('product.price IS NULL');
      }
    }

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'product.createdAt BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    }

    const total = await this.productRepository.count();
    const nonDeleted = await queryBuilder.getCount();

    return (nonDeleted / total) * 100;
  }

  // Report 3: Custom Report
  async getCustomReport(
    criteria: ProductProperties,
    value: string,
  ): Promise<CustomReport> {
    const isNumeric = (str: string) => !isNaN(Number(str));

    const products = await this.productRepository.find({
      where: { [criteria]: isNumeric(value) ? Number(value) : value },
    });

    return {
      count: products.length,
      products,
    };
  }
}
