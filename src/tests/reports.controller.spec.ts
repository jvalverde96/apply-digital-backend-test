import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from '../modules/reports/reports.controller';
import { ReportsService } from '../modules/reports/reports.service';
// import { JwtAuthGuard } from '../modules/auth/jwt.guard';
import { ProductProperties } from 'src/constants/constants';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../modules/products/product.entity';
import { Repository } from 'typeorm';
// import { ExecutionContext } from '@nestjs/common';

// Mocking the ReportsService
jest.mock('./reports.service');

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        ReportsService,
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get<ReportsService>(ReportsService);
  });

  describe('getCustomReport', () => {
    it('should return custom report for a given criteria and value', async () => {
      // Mocking a Product object with all required fields
      const mockProduct: Product = {
        id: '1',
        contentfulId: 'contentful-id',
        category: 'computer',
        color: 'Black',
        stock: 9,
        currency: 'USD',
        name: 'product 1',
        sku: 'sku-123',
        brand: 'Brand A',
        model: 'Model A',
        price: 100,
        deleted: false,
        createdAt: String(new Date()),
        updatedAt: String(new Date()),
      };

      const mockResponse = { count: 1, products: [mockProduct] };
      jest.spyOn(service, 'getCustomReport').mockResolvedValue(mockResponse);

      const result = await controller.getCustomReport(
        ProductProperties.name,
        'Product A',
      );

      expect(result).toEqual(mockResponse);
      expect(service.getCustomReport).toHaveBeenCalledWith(
        ProductProperties.name,
        'Product A',
      );
    });
  });
});
