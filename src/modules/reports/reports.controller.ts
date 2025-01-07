import { Controller, Get, Query, UseFilters, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ReportsService } from './reports.service';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductProperties } from 'src/constants/constants';
import { HttpExceptionFilter } from 'src/utils/error-handler';
import { ApiResponse, CustomReport } from 'src/types/types';

@UseFilters(HttpExceptionFilter)
@Controller('reports')
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Percentage of deleted products.',
    description:
      'Retrieve the percentage of products marked as deleted within the system. This provides insights into the deletion status of the product inventory.',
  })
  @Get('deleted-percentage')
  async getDeletedPercentage(): Promise<ApiResponse<number>> {
    const percentage = await this.reportsService.getDeletedPercentage();
    return {
      success: true,
      result: percentage,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('non-deleted-percentage')
  @ApiOperation({
    summary: 'Percentage of non-deleted products.',
    description:
      'Retrieve the percentage of products that are not marked as deleted, offering insights into the active status of the product inventory.',
  })
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
  ): Promise<ApiResponse<number>> {
    const percentage = await this.reportsService.getNonDeletedPercentage(
      withPrice,
      startDate,
      endDate,
    );
    return {
      success: true,
      result: percentage,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('custom-report')
  @ApiOperation({
    summary: 'Custom product report.',
    description:
      'Generate a custom report by filtering products based on a specified property. The report includes the number of products that meet the criteria, along with a detailed list of these products.',
  })
  @ApiOperation({
    summary: 'custom report.',
    description:
      'Get a particular report by specific property returning number of products that satisfies criteria and the list of prodicts',
  })
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
  ): Promise<ApiResponse<CustomReport>> {
    const report = await this.reportsService.getCustomReport(criteria, value);
    return {
      success: true,
      result: report,
      metadata: {
        reportCriteria: criteria,
        value,
      },
    };
  }
}
