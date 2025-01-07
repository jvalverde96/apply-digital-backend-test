import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { ProductProperties } from 'src/constants/constants';
import { CustomReport } from 'src/types/types';
import { buildInternalServerErrorResponse } from 'src/utils/error-handler';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  // Report 1: Percentage of Deleted Products
  async getDeletedPercentage(): Promise<string> {
    try {
      const total = await this.productRepository.count();
      const deleted = await this.productRepository.count({
        where: { deleted: true },
      });
      return `${(deleted / total) * 100}%`;
    } catch (error) {
      throw buildInternalServerErrorResponse(
        'An error occurred while generating Percentage of Deleted Products report',
        error,
      );
    }
  }

  // Report 2: Percentage of Non-Deleted Products with optional filters (price, date range)
  async getNonDeletedPercentage(
    withPrice?: boolean,
    startDate?: string,
    endDate?: string,
  ): Promise<string> {
    try {
      const queryBuilder = this.productRepository.createQueryBuilder('product');

      // Filter by non-deleted products
      queryBuilder.where('product.deleted = :deleted', { deleted: false });

      // Filter by price
      if (withPrice !== undefined) {
        if (withPrice) {
          queryBuilder.andWhere('product.price IS NOT NULL');
        } else {
          queryBuilder.andWhere('product.price IS NULL');
        }
      }

      // Filter by date range
      if (startDate && endDate) {
        queryBuilder.andWhere(
          'product.createdAt BETWEEN :startDate AND :endDate',
          {
            startDate,
            endDate,
          },
        );
      }

      // Count non-deleted products with the applied filters
      const nonDeleted = await queryBuilder.getCount();

      // Count all products in the table (no filters applied)
      const total = await this.productRepository.count();

      // Calculate and return the percentage
      return `${((nonDeleted / total) * 100).toFixed(2)}%`;
    } catch (error) {
      throw buildInternalServerErrorResponse(
        'An error occurred while generating Percentage of Non Deleted Products report',
        error,
      );
    }
  }

  // Report 3: Custom Report
  async getCustomReport(
    criteria: ProductProperties,
    value: string,
  ): Promise<CustomReport> {
    try {
      const validCriteria = Object.keys(ProductProperties).includes(criteria);
      if (!validCriteria) {
        throw new HttpException(
          `Invalid criteria: ${criteria}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      const isNumeric = (str: string) => !isNaN(Number(str));

      const products = await this.productRepository.find({
        where: { [criteria]: isNumeric(value) ? Number(value) : value },
      });

      return {
        count: products.length,
        products,
      };
    } catch (error) {
      throw buildInternalServerErrorResponse(
        `An error occurred while generating your custom report for ${criteria}: ${value}`,
        error,
      );
    }
  }
}
