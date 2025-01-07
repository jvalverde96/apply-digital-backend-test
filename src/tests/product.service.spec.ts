import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../modules/products/product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../modules/products/product.entity';
import { Repository } from 'typeorm';
import { createClient } from 'contentful';
import { HttpException, HttpStatus } from '@nestjs/common';

// Mocking the logger module
jest.mock('src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

// Mocking the contentful client to simulate interaction with Contentful
jest.mock('contentful', () => ({
  createClient: jest.fn().mockReturnValue({
    getEntries: jest.fn(),
  }),
}));

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: Repository<Product>;
  let contentfulClient: any;

  // Setup before each test, initializing mock repositories and creating the service instance
  beforeEach(async () => {
    const mockProductRepository = {
      findOne: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository, // Inject the mock repository here
        },
      ],
    }).compile();

    // Getting instances of the service and repositories after compiling the module
    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );

    // Creating a mocked Contentful client instance with predefined credentials
    contentfulClient = createClient({
      space: process.env.CONTENTFUL_SPACE_ID,
      accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
      environment: process.env.CONTENTFUL_ENVIRONMENT,
    });
  });

  // Test to ensure the service is correctly defined
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchProducts', () => {
    // Test to simulate fetching products from Contentful and inserting them into the database
    it('should fetch and insert products successfully', async () => {
      const mockResponse = {
        items: [
          {
            metadata: { tags: [], concepts: [] },
            sys: {
              space: { id: 'spaceId' },
              id: '3YOVKMKAd6LqEmTfQ38GGc',
              type: 'Entry',
              createdAt: '2024-01-23T21:44:52.175Z',
              updatedAt: '2024-01-23T21:44:52.175Z',
              environment: { id: 'envId' },
              publishedVersion: 1,
              revision: 1,
              contentType: { id: 'contentTypeId' },
              locale: 'en-US',
            },
            fields: {
              sku: 'OJ3VPK7C',
              name: 'Samsung HD 450BT',
              brand: 'Samsung',
              model: 'HD 450BT',
              category: 'Headphones',
              color: 'Blue',
              price: 1095.98,
              currency: 'USD',
              stock: 56,
            },
          },
        ],
      };

      // Mocking the Contentful client's getEntries method to return the mock response
      contentfulClient.getEntries.mockResolvedValue(mockResponse);

      // Creating spies on the repository methods to track their usage
      const upsertSpy = jest
        .spyOn(productRepository, 'upsert')
        .mockResolvedValue(undefined);

      const findOneSpy = jest
        .spyOn(productRepository, 'findOne')
        .mockResolvedValue(null); // Mocking the findOne method to return null (indicating no existing product)

      // Calling the service method to fetch products
      await service.fetchProducts();

      // Assertions to verify that the methods were called with the expected arguments
      expect(contentfulClient.getEntries).toHaveBeenCalledWith({
        content_type: process.env.CONTENTFUL_CONTENT_TYPE,
      });
      expect(upsertSpy).toHaveBeenCalled();
      expect(findOneSpy).toHaveBeenCalled();
    });

    // Test to handle errors during product fetching
    it('should handle errors gracefully', async () => {
      // Simulating an error when calling the getEntries method
      contentfulClient.getEntries.mockRejectedValue(
        new HttpException(
          'An error occurred while fetching products.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );

      try {
        // Calling the service method which is expected to throw an error
        await service.fetchProducts();
      } catch (error: any) {
        // Assertions to verify that the error is correctly thrown and contains expected properties
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(
          `An error occurred while fetching products.`,
        );
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('deleteProduct', () => {
    // Test to simulate marking a product as deleted
    it('should mark product as deleted', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';

      const mockProduct = { id: validUuid, deleted: false } as Product;
      const updatedProduct = { id: validUuid, deleted: true } as Product;

      // Mocking the findOne method to return the product and the updated version
      const findSpy = jest
        .spyOn(productRepository, 'findOne')
        .mockResolvedValue(mockProduct);

      jest
        .spyOn(productRepository, 'findOne')
        .mockResolvedValue(updatedProduct);

      const updateSpy = jest
        .spyOn(productRepository, 'update')
        .mockResolvedValue(undefined);

      const result = await service.deleteProduct(validUuid); // Calling the service method with the valid UUID

      // Assertions to verify the correct behavior
      expect(updateSpy).toHaveBeenCalledWith(validUuid, { deleted: true });
      expect(findSpy).toHaveBeenCalledTimes(2); // Verifying findOne was called twice
      expect(result.deleted).toBe(true); // Ensuring the product is marked as deleted
    });

    // Test for handling invalid UUID format
    it('should throw error for invalid UUID', async () => {
      try {
        // Calling deleteProduct with an invalid UUID (non-UUID string)
        await service.deleteProduct('1');
      } catch (error: any) {
        // Assertions to check the error is thrown with correct message and status
        expect(error).toBeInstanceOf(HttpException);
        expect(error.response).toBe(`Invalid UUID: 1. Please try again!`);
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('getPaginatedProducts', () => {
    // Test to simulate fetching paginated products
    it('should return paginated products', async () => {
      const mockProducts = [{ id: '1', name: 'Product 1' } as Product];
      // Mocking the find method to return the paginated products
      const findSpy = jest
        .spyOn(productRepository, 'find')
        .mockResolvedValue(mockProducts);

      // Calling the service method with pagination parameters
      const result = await service.getPaginatedProducts(1, {
        name: 'Product 1',
      });

      // Verifying that the find method was called with expected parameters
      expect(findSpy).toHaveBeenCalledWith({
        where: { name: 'Product 1', deleted: false },
        skip: 0,
        take: 5,
      });
      // Verifying that the result matches the mock products
      expect(result).toEqual(mockProducts);
    });
  });
});
