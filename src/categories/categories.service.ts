import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Subcategory } from './entities/subcategory.entity';
import { ScraperService } from '../scraper/scraper.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CategoriesService {
  constructor(
    private scraperService: ScraperService,
    @InjectRepository(Category) private catRepo: Repository<Category>,
    @InjectRepository(Subcategory) private subRepo: Repository<Subcategory>,
    private readonly prodService: ProductsService
  ) {}



  async findAll(): Promise<Category[]> {
    const categories = await this.catRepo.find({relations: ["subcategories"]});
    if (!categories) {
      throw new NotFoundException({
        success: false,
        message: `Categories not found`,
        content: [],
      });
    }
    return categories
  }


  // async updateDbWithScraping(url: string) {
  //   const data = await this.scraperService.scrape(url);
  //   for (const catData of data) {
  //     // find or create category
  //     let category = await this.catRepo.findOne({
  //       where: { title: catData.category },
  //       relations: ['subcategories'],
  //     });
  //     if (!category) {
  //       category = this.catRepo.create({ title: catData.category, subcategories: [] });
  //       await this.catRepo.save(category);
  //     }

  //     // handle subcategories
  //     for (const subName of catData.subcategories) {
  //       const exists = category.subcategories.find((s) => s.name === subName.name);
  //       // console.log(subName)
  //       if (!exists) {
  //         const sub = this.subRepo.create({ name: subName.name, category: category });
  //         await this.subRepo.save(sub);
  //       }
  //     }

  //     for (const product of catData.products) {
  //       const productExists = await this.prodService.findOneByName(product.name);
  //       if (!productExists) {
  //         if("subcategory" in product){
  //           const subcategoryExist = await this.subRepo.findOne({where:{name: product.subcategory}});
  //           if(subcategoryExist){
  //             await this.prodService.create(product, category, subcategoryExist);
  //           }
  //         }else{
  //             await this.prodService.create(product, category)
  //         }
  //       }
  //     }
  //   }
  // }

  async updateDbWithScraping(url: string) {
    // 1. Validar URL básica
    if (!url || typeof url !== 'string') {
      throw new BadRequestException('La URL es obligatoria y debe ser un string');
    }
    try {
      new URL(url);
    } catch {
      throw new BadRequestException('La URL no tiene un formato válido');
    }

    // 2. Obtener datos del scraper
    const data = await this.scraperService.scrape(url);

    if (!Array.isArray(data)) {
      throw new BadRequestException('Los datos scrapeados deben ser un array');
    }

    for (const catData of data) {
      // Validar campos básicos de cada categoría
      if (!catData.category || typeof catData.category !== 'string') {
        throw new BadRequestException('Cada elemento debe tener "category" como string');
      }
      if (!Array.isArray(catData.subcategories)) {
        throw new BadRequestException(
          `La categoría ${catData.category} debe traer un array "subcategories"`,
        );
      }
      if (!Array.isArray(catData.products)) {
        throw new BadRequestException(
          `La categoría ${catData.category} debe traer un array "products"`,
        );
      }

      // find or create category
      let category = await this.catRepo.findOne({
        where: { title: catData.category },
        relations: ['subcategories'],
      });
      if (!category) {
        category = this.catRepo.create({ title: catData.category, subcategories: [] });
        await this.catRepo.save(category);
      }

      // handle subcategories
      for (const subName of catData.subcategories) {
        if (!subName?.name || typeof subName.name !== 'string') {
          throw new BadRequestException(`Subcategoría inválida en ${catData.category}`);
        }
        const exists = category.subcategories.find((s) => s.name === subName.name);
        if (!exists) {
          const sub = this.subRepo.create({ name: subName.name, category });
          await this.subRepo.save(sub);
        }
      }

      // handle products
      for (const product of catData.products) {
        if (!product?.name || typeof product.name !== 'string') {
          throw new BadRequestException(
            `Producto inválido en la categoría ${catData.category}`,
          );
        }

        const productExists = await this.prodService.findOneByName(product.name);
        if (!productExists) {
          if (product.subcategory) {
            // validar que exista subcategoría
            const subcategoryExist = await this.subRepo.findOne({
              where: { name: product.subcategory },
            });
            if (subcategoryExist) {
              await this.prodService.create(product, category, subcategoryExist);
            } else {
              throw new BadRequestException(
                `La subcategoría "${product.subcategory}" no existe para el producto "${product.name}"`,
              );
            }
          } else {
            await this.prodService.create(product, category);
          }
        }
      }
    }
  }

}
