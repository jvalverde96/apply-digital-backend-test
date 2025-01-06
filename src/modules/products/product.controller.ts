import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseFilters,
} from '@nestjs/common';
import { ProductsService } from './product.service';
import { Product } from './product.entity';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import logger from 'src/utils/logger';
import { HttpExceptionFilter } from 'src/utils/error-handler';
import { ApiResponse } from 'src/types/types';

@UseFilters(HttpExceptionFilter)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Fetch paginated products.',
    description:
      'Retrieves a list of products from the database with pagination support. You can filter the products by various parameters like SKU, name, brand, category, etc., and specify the page number for the results.',
  })
  @ApiQuery({
    name: 'page',
    required: true,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'sku',
    required: false,
    type: String,
    description: 'Filter by SKU',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter by product name',
  })
  @ApiQuery({
    name: 'brand',
    required: false,
    type: String,
    description: 'Filter by brand',
  })
  @ApiQuery({
    name: 'model',
    required: false,
    type: String,
    description: 'Filter by model',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'color',
    required: false,
    type: String,
    description: 'Filter by color',
  })
  @ApiQuery({
    name: 'price',
    required: false,
    type: Number,
    description: 'Filter by price',
  })
  @ApiQuery({
    name: 'currency',
    required: false,
    type: String,
    description: 'Filter by currency',
  })
  @ApiQuery({
    name: 'stock',
    required: false,
    type: Number,
    description: 'Filter by stock quantity',
  })
  async getProducts(
    @Query('page') page: number = 1,
    @Query('sku') sku?: string,
    @Query('name') name?: string,
    @Query('brand') brand?: string,
    @Query('model') model?: string,
    @Query('category') category?: string,
    @Query('color') color?: string,
    @Query('price') price?: number,
    @Query('currency') currency?: string,
    @Query('stock') stock?: number,
  ): Promise<ApiResponse<Product[]>> {
    const filters: Partial<Product> = {
      sku,
      name,
      brand,
      model,
      category,
      color,
      price,
      currency,
      stock,
    };

    const products = await this.productsService.getPaginatedProducts(
      page,
      filters,
    );

    return {
      success: true,
      result: products,
      metadata: {
        page,
        count: products.length,
      },
      error: null,
    };
  }

  @Post(':id')
  @ApiOperation({
    summary: 'Simulate product deletion.',
    description:
      'Sets the "deleted" flag to true for a specific product, effectively marking it as deleted without actually removing it from the database. This is useful for soft deletion where the data is kept for future reference.',
  })
  async deleteProduct(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<Product>> {
    const updatedProduct = await this.productsService.deleteProduct(id);
    logger.info(`Product with id: ${id} deleted successfully!`);

    return {
      success: true,
      result: updatedProduct,
      metadata: {
        id,
      },
      error: null,
    };
  }

  @Delete('/all')
  @ApiOperation({
    summary: 'Delete all products from the database.',
    description:
      'Permanently removes all product entries from the database, ensuring that no records remain. Use this operation with caution as it cannot be undone.',
  })
  async deleteAllProducts(): Promise<ApiResponse<string>> {
    await this.productsService.deleteAllProducts();
    return {
      success: true,
      result: 'All products have been deleted successfully.',
      metadata: null,
      error: null,
    };
  }

  @Post('/sync')
  @ApiOperation({
    summary: 'Force product synchronization with Contentful.',
    description:
      'Triggers a manual sync with the Contentful API to fetch the latest products data. This operation updates the product table with the most current information from Contentful, ensuring the database is up-to-date.',
  })
  async syncProducts(): Promise<ApiResponse<Product[]>> {
    const products = await this.productsService.fetchProducts();
    return {
      success: true,
      result: products,
      metadata: null,
      error: null,
    };
  }
}
