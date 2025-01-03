import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['contentfulId'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  contentfulId: string;

  @Column({ nullable: true })
  sku: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true, type: 'decimal' })
  price: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  stock: number;

  @Column({ nullable: true })
  createdAt: string;

  @Column({ nullable: true })
  updatedAt: string;

  @Column({ default: false })
  deleted: boolean;
}
