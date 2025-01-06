import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { createClient } from 'contentful';
import { Cron } from '@nestjs/schedule';
import logger from 'src/utils/logger';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async fetchProducts(): Promise<Product[]> {
    const client = createClient({
      space: process.env.CONTENTFUL_SPACE_ID,
      accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
      environment: process.env.CONTENTFUL_ENVIRONMENT,
    });

    logger.info('Fetching products from Contentful API.');

    const response = await client.getEntries({
      content_type: process.env.CONTENTFUL_CONTENT_TYPE,
    });

    logger.info('Parsing objects to sql rows.');

    const products = await Promise.all(
      response.items.map(async (item) => {
        const contentfulId = String(item.sys.id);
        const deleted =
          (
            await this.productRepository.findOne({
              where: { contentfulId },
            })
          )?.deleted || false;

        const product: Partial<Product> = {
          contentfulId,
          sku: String(item.fields.sku),
          name: String(item.fields.name),
          brand: String(item.fields.brand),
          model: String(item.fields.model),
          category: String(item.fields.category),
          color: String(item.fields.color),
          price: parseFloat(String(item.fields.price)),
          currency: String(item.fields.currency),
          stock: parseInt(String(item.fields.stock)),
          createdAt: String(item.sys.createdAt),
          updatedAt: String(item.sys.updatedAt),
          deleted,
        };
        return product;
      }),
    );

    logger.info('Inserting rows in product table.');

    for (const product of products) {
      await this.productRepository.upsert(product, ['contentfulId']);
    }

    logger.info(`Products fetched successfully!`);

    const allProducts = await this.productRepository.find();
    return allProducts;
  }

  async deleteProduct(id: string): Promise<Product> {
    await this.productRepository.update(id, { deleted: true });
    logger.info(`Deleted flag set to true for product with id ${id}.`);
    const updatedProduct = await this.productRepository.findOne({
      where: { id },
    });
    return updatedProduct;
  }

  async deleteAllProducts(): Promise<void> {
    await this.productRepository.clear();
    logger.info('All products have been deleted successfully.');
  }

  async getPaginatedProducts(
    page: number,
    filters: Partial<Product>,
  ): Promise<Product[]> {
    const take = 5;
    const skip = (page - 1) * take;

    return this.productRepository.find({
      where: { ...filters, deleted: false },
      skip,
      take,
    });
  }

  @Cron('0 * * * *')
  async handleCron() {
    logger.info('Cron job started: Syncing products...');
    await this.fetchProducts();
    logger.info('Cron job completed: Products synced successfully!');
  }
}
