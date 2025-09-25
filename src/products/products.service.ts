import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, IsNull, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { Category } from 'src/categories/entities/category.entity';
import { Subcategory } from 'src/categories/entities/subcategory.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // CREATE
  async create(createProductDto: CreateProductDto, category: Category, subcategory?: Subcategory): Promise<Product> {
    try{
      if (!category) {
        throw new BadRequestException('Debes especificar una categoría válida');
      }
  
      if (subcategory && subcategory.category.id !== category.id) {
        throw new BadRequestException(
          'La subcategoría no pertenece a la categoría indicada',
        );
      }

      let params= {...createProductDto, category: category}
      if(subcategory){
        params["subcategory"] = subcategory
      }
      const product = this.productRepository.create(params);
      return await this.productRepository.save(product);
    }catch(err){
      throw new InternalServerErrorException('Error al crear el producto: ' + err.message,)
    }
  }

  async findAll(name?: string): Promise<Product[]> {
    const params: any = {order: { created_at: 'ASC' }, where: {}};
  
    if (name) {
      params.where.name = ILike(`%${name}%`);
    }
  
    const products = await this.productRepository.find(params);
  
    if (products.length === 0) {
      throw new NotFoundException({
        success: false,
        message: `Product(s) with the name "${name}" not found`,
        content: [],
      });
    }

    return products;

  }

  async findAllByCategoryId(categoryId: number, name?: string): Promise<Product[]> {
    return this.findAllByRelation('category', categoryId, name);
  }
  
  async findAllBySubcategoryId(subcategoryId: number, name?: string): Promise<Product[]> {
    return this.findAllByRelation('subcategory', subcategoryId, name);
  }

  private async findAllByRelation(
    relation: 'category' | 'subcategory',
    id: number,
    name?: string,
  ): Promise<Product[]> {
    const where: any = { [relation]: { id } };
  
    if (name) {
      where.name = ILike(`%${name}%`);
    }
  
    const products = await this.productRepository.find({
      where,
      order: { created_at: 'DESC' },
    });
  
    // products nunca será null, pero puede ser []
    if (products.length === 0) {
      throw new NotFoundException({
        success: false,
        message: name
          ? `Product(s) with the name "${name}" not found`
          : `Products with the ${relation}_id ${id} not found`,
        content: [],
      });
    }
  
    return products;
  }

  // FIND ONE
  async findOne(id: number): Promise<Product> {

      const product = await this.productRepository.findOne({ where: { id } });
      if (!product) {
        throw new NotFoundException({
          success: false,
          message: `Product #${id} not found`,
          content: [],
        });
      }
      return product
  }


  async findProductsWithDiscounts(): Promise<Product[]> {
    const products = await this.productRepository.find({ where: { discount_percentage :  Not(IsNull()) }, order: { created_at: 'DESC' }, take: 8 });
    if (!products) {
      throw new NotFoundException({
        success: false,
        message: `Products with discounts not found`,
        content: [],
      });
    }
    return products
  }

  async findNewProducts(limit: number = 12): Promise<Product[]> {
    const products = await this.productRepository.find({ order: { created_at: 'DESC' }, take: limit });
    if (!products) {
      throw new NotFoundException({
        success: false,
        message: `Products not found`,
        content: [],
      });
    }
    return products
  }


  async findOneByName(name: string): Promise<Product> {
    return await this.productRepository.findOne({ where: { name: name } });
  }
}
