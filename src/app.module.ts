import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScraperModule } from './scraper/scraper.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CronModule } from './cron/cron.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'graf_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ScraperModule, CategoriesModule, ProductsModule, CronModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
