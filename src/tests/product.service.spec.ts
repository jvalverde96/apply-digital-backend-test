import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../modules/products/product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../modules/products/product.entity';
import { Repository } from 'typeorm';
import { createClient } from 'contentful';

jest.mock('contentful', () => ({
  createClient: jest.fn().mockReturnValue({
    getEntries: jest.fn(),
  }),
}));

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: Repository<Product>;
  let contentfulClient: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );

    contentfulClient = createClient({
      space: process.env.CONTENTFUL_SPACE_ID,
      accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
      environment: process.env.CONTENTFUL_ENVIRONMENT,
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchProducts', () => {
    it('should fetch and insert products successfully', async () => {
      const mockResponse = {
        items: [
          {
            sys: { id: '1', createdAt: '2025-01-01', updatedAt: '2025-01-02' },
            fields: {
              sku: '123',
              name: 'Product 1',
              price: '10.0',
              stock: '100',
            },
          },
        ],
      };

      contentfulClient.getEntries.mockResolvedValue(mockResponse);
      const upsertSpy = jest
        .spyOn(productRepository, 'upsert')
        .mockResolvedValue(undefined);

      await service.fetchProducts();

      expect(contentfulClient.getEntries).toHaveBeenCalledWith({
        content_type: process.env.CONTENTFUL_CONTENT_TYPE,
      });
      expect(upsertSpy).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      contentfulClient.getEntries.mockRejectedValue(new Error('API Error'));

      await service.fetchProducts();
    });
  });

  describe('deleteProduct', () => {
    it('should mark product as deleted', async () => {
      const mockProduct = { id: '1', deleted: false } as Product;
      const updateSpy = jest
        .spyOn(productRepository, 'update')
        .mockResolvedValue(undefined);
      const findSpy = jest
        .spyOn(productRepository, 'findOne')
        .mockResolvedValue(mockProduct);

      const result = await service.deleteProduct('1');

      expect(updateSpy).toHaveBeenCalledWith('1', { deleted: true });
      expect(findSpy).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result.deleted).toBe(true);
    });
  });

  describe('getPaginatedProducts', () => {
    it('should return paginated products', async () => {
      const mockProducts = [{ id: '1', name: 'Product 1' } as Product];
      const findSpy = jest
        .spyOn(productRepository, 'find')
        .mockResolvedValue(mockProducts);

      const result = await service.getPaginatedProducts(1, {
        name: 'Product 1',
      });

      expect(findSpy).toHaveBeenCalledWith({
        where: { name: 'Product 1', deleted: false },
        skip: 0,
        take: 5,
      });
      expect(result).toEqual(mockProducts);
    });
  });
});
