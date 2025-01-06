import { Product } from 'src/modules/products/product.entity';

export type ApiResponse<T = unknown> = {
  success: boolean;
  result?: T;
  metadata?: unknown;
  error?: string | { message: string; code?: number };
};

export type CustomReport = {
  count: number;
  products: Product[];
};
