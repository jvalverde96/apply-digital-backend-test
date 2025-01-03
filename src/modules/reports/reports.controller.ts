import { Controller, Get, Query, UseFilters, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ReportsService } from './reports.service';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductProperties } from 'src/constants/constants';
import { HttpExceptionFilter } from 'src/utils/error-handler';

@UseFilters(HttpExceptionFilter)
@Controller('reports')
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('deleted-percentage')
  async getDeletedPercentage() {
    return this.reportsService.getDeletedPercentage();
  }

  @UseGuards(JwtAuthGuard)
  @Get('non-deleted-percentage')
  @ApiQuery({
    name: 'withPrice',
    required: false,
    type: Boolean,
    description:
      'Flag to either include or not the product price on the report',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for custom date range',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for custom date range',
  })
  async getNonDeletedPercentage(
    @Query('withPrice') withPrice?: boolean,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getNonDeletedPercentage(
      withPrice,
      startDate,
      endDate,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('custom-report')
  @ApiQuery({
    name: 'criteria',
    enum: ProductProperties,
    description: 'Filter products by custom property',
    required: true,
    enumName: 'ProductProperties',
  })
  @ApiQuery({
    name: 'value',
    description:
      'Insert the value for the custom property. Note: please consider that the comparison performed on the backend for values is CASE SENSITIVE.',
    required: true,
  })
  async getCustomReport(
    @Query('criteria') criteria: ProductProperties,
    @Query('value') value: string,
  ) {
    return this.reportsService.getCustomReport(criteria, value);
  }
}
