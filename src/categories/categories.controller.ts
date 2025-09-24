import { Controller, Get, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Post('update/db')
  async updateCategories() {
    return await this.categoriesService.updateDbWithScraping('https://impresiones-publicitarias.com');
  }


}
