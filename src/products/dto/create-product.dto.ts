// src/products/dto/create-product.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  details: string;

  @IsString()
  price: string;

  @IsString()
  @IsOptional()
  discount_percentage: string;

  @IsString()
  image: string;

  @IsString()
  color: string;
}
