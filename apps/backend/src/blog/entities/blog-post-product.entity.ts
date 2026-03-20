import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { BlogPost } from './blog-post.entity';
import { Product } from '../../inventory/entities/product.entity';

@Entity('blog_post_products')
export class BlogPostProduct {
  @PrimaryColumn({ name: 'blog_post_id' })
  blogPostId: string;

  @PrimaryColumn({ name: 'product_id' })
  productId: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @ManyToOne(() => BlogPost, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blog_post_id' })
  blogPost: BlogPost;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
