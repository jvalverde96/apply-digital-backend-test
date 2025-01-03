import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseFilters,
} from '@nestjs/common';
import { ProductsService } from './product.service';
import { Product } from './product.entity';
import { ApiQuery } from '@nestjs/swagger';
import logger from 'src/utils/logger';
import { HttpExceptionFilter } from 'src/utils/error-handler';

@UseFilters(HttpExceptionFilter)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
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
  ) {
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

    logger.info(`Products fetched successfully!`);

    return {
      success: true,
      metadata: {
        page,
        products,
      },
    };
  }

  @Delete(':id')
  async deleteProduct(@Param('id', ParseUUIDPipe) id: string) {
    const updatedProduct = await this.productsService.deleteProduct(id);
    logger.info(`Product with id: ${id} deleted successfully!`);
    return {
      success: true,
      message: `Product with id: ${id} deleted successfully!`,
      metadata: updatedProduct,
    };
  }
}

// {
//   "email": "user@gmail.com",
//   "password": "hello123"
// }
