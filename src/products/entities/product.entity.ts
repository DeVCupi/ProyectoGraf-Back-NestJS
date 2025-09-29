import { Category } from 'src/categories/entities/category.entity';
import { Subcategory } from 'src/categories/entities/subcategory.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: false })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @Column({ type: 'text', nullable: false })
  details: string;

  @Column({ length: 255, nullable: false })
  price: string;

  @Column({ length: 255, nullable: true})
  discount_percentage: string

  @Column({ length: 255, nullable: false})
  image: string

  @Column({ length: 255, nullable: false})
  color: string

  @Column({nullable: false})
  sold_out: Boolean

  @ManyToOne(() => Category, (cat) => cat.id, {eager: true, nullable: false})
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Subcategory, (sub) => sub.id, {eager: true, nullable: true})
  @JoinColumn({ name: 'subcategory_id' })
  subcategory: Subcategory;
}