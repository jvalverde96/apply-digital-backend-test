import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '../modules/products/product.controller';
import { ProductsService } from '../modules/products/product.service';
import { Product } from '../modules/products/product.entity';
import { v4 as uuidv4 } from 'uuid'; // Import the UUID generator

jest.mock('src/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            getPaginatedProducts: jest.fn(),
            deleteProduct: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProducts', () => {
    it('should return paginated products', async () => {
      const productId = uuidv4(); // Generate a valid UUID
      const mockProducts = [{ id: productId, name: 'Product 1' }] as Product[];
      const mockResponse = {
        success: true,
        metadata: { page: 1, count: 1 },
        result: mockProducts,
      };

      jest
        .spyOn(service, 'getPaginatedProducts')
        .mockResolvedValue(mockProducts);

      const result = await controller.getProducts(1, 'Product 1');

      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteProduct', () => {
    it('should delete the product successfully', async () => {
      const productId = uuidv4(); // Generate a valid UUID
      const mockProduct = { id: productId, deleted: false } as Product; // Initially set 'deleted' to false

      // Mock the service method to simulate the flag change
      jest
        .spyOn(service, 'deleteProduct')
        .mockImplementation(async (id: string) => {
          // Simulate changing the deleted flag to true in the service
          if (id === productId) {
            return { ...mockProduct, deleted: true }; // Set deleted to true when product is "deleted"
          }
          return mockProduct; // For other products, return as is
        });

      // Call the controller method
      const result = await controller.deleteProduct(productId);

      // Debugging: log the result to inspect
      console.log(result); // Check what the result is returning

      // Assertions to match the expected result structure
      expect(result.success).toBe(true);
      expect(result.result.id).toBe(productId);
      expect(result.metadata).toEqual({ id: productId });
      expect(result.result.deleted).toBe(true);
    });
  });
});
