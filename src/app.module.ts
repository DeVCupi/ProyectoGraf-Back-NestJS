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
      host: '127.0.0.1',
      port: 3306,
      username: 'diagralc_graf',
      password: 'Y@B-;f&C7Kc)45687srty66',
      database: 'diagralc_graf_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    
    ScraperModule, CategoriesModule, ProductsModule, CronModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
