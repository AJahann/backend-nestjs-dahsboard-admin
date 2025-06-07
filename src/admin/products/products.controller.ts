import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';

@Controller('admin/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async createProductWithFile(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Multer.File,
  ) {
    if (file) {
      createProductDto.imgBase64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }
    return this.productsService.createProduct(createProductDto);
  }

  @Get()
  async getProducts(@Query('limit') limit: number = 15) {
    return this.productsService.getAllProducts(Number(limit));
  }
}
