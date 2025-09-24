import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class CronService {
  constructor(private categoryService: CategoriesService) {}

  // Every night at 2am
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleCron() {
    const url = 'https://impresiones-publicitarias.com';
    await this.categoryService.updateDbWithScraping(url);
    console.log('Categorías actualizadas');
  }
}
