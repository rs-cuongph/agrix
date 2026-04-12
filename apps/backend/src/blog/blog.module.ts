import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogPost } from './entities/blog-post.entity';
import { BlogCategory } from './entities/blog-category.entity';
import { BlogTag } from './entities/blog-tag.entity';
import { BlogPostProduct } from './entities/blog-post-product.entity';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlogPost,
      BlogCategory,
      BlogTag,
      BlogPostProduct,
    ]),
    StorageModule,
  ],
  controllers: [BlogController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}
