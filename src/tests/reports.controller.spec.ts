import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from '../modules/reports/reports.controller';
import { ReportsService } from '../modules/reports/reports.service';
import { ProductProperties } from 'src/constants/constants';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../modules/products/product.entity';
import { CustomReport } from 'src/types/types';

// Mock the ReportsService
jest.mock('../modules/reports/reports.service');

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: ReportsService;
  let mockProductRepository;

  beforeEach(async () => {
    // Mock the repository to simulate find behavior
    mockProductRepository = {
      find: jest.fn(), // Mock the 'find' method
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        ReportsService,
        {
          provide: getRepositoryToken(Product), // Ensure the Product repository is mocked correctly
          useValue: mockProductRepository, // Use the mock repository here
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get<ReportsService>(ReportsService);
  });

  describe('getCustomReport', () => {
    it('should return custom report for a given criteria and value', async () => {
      // Mocking a Product object with all required fields to simulate the product data
      const mockProduct: Product = {
        id: '1',
        contentfulId: 'contentful-id',
        category: 'computer',
        color: 'Black',
        stock: 9,
        currency: 'USD',
        name: 'Product A',
        sku: 'sku-123',
        brand: 'Brand A',
        model: 'Model A',
        price: 100,
        deleted: false,
        createdAt: String(new Date()),
        updatedAt: String(new Date()),
      };

      // Adjust the mock response to match the expected CustomReport type
      const mockCustomReport: CustomReport = {
        count: 1, // Number of products returned in the report
        products: [mockProduct], // The list of products returned
      };

      // Mock the repository's find method to return the mock product
      mockProductRepository.find.mockResolvedValue([mockProduct]);

      // Mock the service method to return the expected CustomReport
      jest
        .spyOn(service, 'getCustomReport')
        .mockResolvedValue(mockCustomReport);

      // Call the controller's getCustomReport method with specific criteria and value
      const result = await controller.getCustomReport(
        ProductProperties.name, // The criteria, such as 'name'
        'Product A', // The value to filter the report (e.g., 'Product A')
      );

      // Assertions to ensure the correct response structure and content
      expect(result).toEqual({
        success: true,
        result: mockCustomReport, // Result should match the mockCustomReport structure
        metadata: {
          reportCriteria: ProductProperties.name, // The criteria used for the report
          value: 'Product A', // The value used for filtering the report
        },
      });

      // Ensure the service method was called with the correct arguments
      expect(service.getCustomReport).toHaveBeenCalledWith(
        ProductProperties.name,
        'Product A',
      );
    });
  });
});
