import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get("")
  findAll(@Query('name') name?: string) {
    return this.productsService.findAll(name);
  }

  @Get("/category/:category_id")
  findAllByCategoryId(@Param('category_id', ParseIntPipe) categoryId: number, @Query('name') name?: string) {
    return this.productsService.findAllByCategoryId(categoryId, name);
  }

  @Get("/subcategory/:subcategory_id")
  findAllBySubcategoryId(@Param('subcategory_id', ParseIntPipe) subcategoryId: number, @Query('name') name?: string) {
    return this.productsService.findAllBySubcategoryId(subcategoryId, name);
  }

  @Get("/discounts")
  findProductsWithDiscounts() {
    return this.productsService.findProductsWithDiscounts();
  }

  @Get("/new")
  findNewProducts() {
    return this.productsService.findNewProducts();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

}
