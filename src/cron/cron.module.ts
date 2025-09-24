import { Module } from '@nestjs/common';
import { CategoriesModule } from 'src/categories/categories.module';
import { CronService } from './cron.service';

@Module({
  imports: [CategoriesModule],
  controllers: [],
  providers: [CronService],
})
export class CronModule {}
