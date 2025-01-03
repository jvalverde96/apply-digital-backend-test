import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '../modules/products/product.controller';
import { ProductsService } from '../modules/products/product.service';
import { Product } from '../modules/products/product.entity';

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
      const mockProducts = [{ id: '1', name: 'Product 1' }] as Product[];
      const mockResponse = {
        success: true,
        metadata: { page: 1, products: mockProducts },
      };

      jest
        .spyOn(service, 'getPaginatedProducts')
        .mockResolvedValue(mockProducts);

      // Instead of passing an object, pass the individual query parameters
      const result = await controller.getProducts(1, 'Product 1'); // Pass name as a string

      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteProduct', () => {
    it('should delete the product successfully', async () => {
      const mockProduct = { id: '1', deleted: true } as Product;
      jest.spyOn(service, 'deleteProduct').mockResolvedValue(mockProduct);

      const result = await controller.deleteProduct('1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Product with id: 1 deleted successfully!');
      expect(result.metadata).toEqual(mockProduct);
    });
  });
});
