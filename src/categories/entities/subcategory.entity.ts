import { Product } from '../../products/entities/product.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Category } from './category.entity';

@Entity()
export class Subcategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Category, (cat) => cat.id, {eager: true})
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => Product, (prod) => prod.subcategory, { cascade: true })
  products: Product[];
}