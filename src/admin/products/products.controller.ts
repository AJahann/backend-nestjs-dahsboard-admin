import { Controller, Post, Body, Get, Query, UseGuards, Delete, Param, Put } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { SuperAdminJwtGuard } from 'src/auth/guards/super-admin.guard';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('admin/products')
@UseGuards(SuperAdminJwtGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Get()
  async getProducts(@Query('limit') limit: number = 15) {
    return this.productsService.getAllProducts(Number(limit));
  }

  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }

  @Put(':id')
  async updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.updateProduct(id, updateProductDto);
  }
}
