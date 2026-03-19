import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogPost, BlogPostStatus } from './entities/blog-post.entity';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly blogRepo: Repository<BlogPost>,
  ) {}

  async findPublished(category?: string, page = 1, limit = 10) {
    const qb = this.blogRepo
      .createQueryBuilder('post')
      .where('post.status = :status', { status: BlogPostStatus.PUBLISHED })
      .orderBy('post.publishedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (category) {
      qb.andWhere('post.category = :category', { category });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async findBySlug(slug: string): Promise<BlogPost> {
    const post = await this.blogRepo.findOne({
      where: { slug, status: BlogPostStatus.PUBLISHED },
      relations: ['author'],
    });
    if (!post) throw new NotFoundException(`Post "${slug}" not found`);
    return post;
  }

  async findAll() {
    return this.blogRepo.find({ order: { createdAt: 'DESC' }, relations: ['author'] });
  }

  async create(data: Partial<BlogPost>, authorId: string): Promise<BlogPost> {
    const slug = data.title
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || '';

    const post = this.blogRepo.create({
      ...data,
      slug,
      authorId,
    });
    return this.blogRepo.save(post);
  }

  async update(id: string, data: Partial<BlogPost>): Promise<BlogPost> {
    if (data.status === BlogPostStatus.PUBLISHED) {
      (data as any).publishedAt = new Date();
    }
    await this.blogRepo.update(id, data);
    const post = await this.blogRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException(`Post ${id} not found`);
    return post;
  }

  async delete(id: string) {
    await this.blogRepo.delete(id);
    return { deleted: true };
  }
}
