import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { BlogPost, BlogPostStatus } from './entities/blog-post.entity';
import { BlogCategory } from './entities/blog-category.entity';
import { BlogTag } from './entities/blog-tag.entity';
import { BlogPostProduct } from './entities/blog-post-product.entity';
import { slugify } from '../common/utils/slugify';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly blogRepo: Repository<BlogPost>,
    @InjectRepository(BlogCategory)
    private readonly categoryRepo: Repository<BlogCategory>,
    @InjectRepository(BlogTag)
    private readonly tagRepo: Repository<BlogTag>,
    @InjectRepository(BlogPostProduct)
    private readonly postProductRepo: Repository<BlogPostProduct>,
  ) {}

  // ============ Posts ============

  async findPublished(category?: string, tag?: string, page = 1, limit = 10) {
    const qb = this.blogRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tags', 'tag')
      .where('post.status = :status', { status: BlogPostStatus.PUBLISHED })
      .orderBy('post.publishedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (category) {
      qb.andWhere('category.slug = :category', { category });
    }
    if (tag) {
      qb.andWhere('tag.slug = :tag', { tag });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async findBySlug(slug: string): Promise<any> {
    const post = await this.blogRepo.findOne({
      where: { slug, status: BlogPostStatus.PUBLISHED },
      relations: ['author', 'category', 'tags'],
    });
    if (!post) throw new NotFoundException(`Post "${slug}" not found`);

    // Load linked products
    const linkedProducts = await this.postProductRepo.find({
      where: { blogPostId: post.id },
      relations: ['product'],
      order: { displayOrder: 'ASC' },
    });

    return { ...post, linkedProducts: linkedProducts.map((lp) => lp.product) };
  }

  async findAll() {
    return this.blogRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['author', 'category', 'tags'],
    });
  }

  async findById(id: string) {
    const post = await this.blogRepo.findOne({
      where: { id },
      relations: ['author', 'category', 'tags'],
    });
    if (!post) throw new NotFoundException(`Post ${id} not found`);

    const linkedProducts = await this.postProductRepo.find({
      where: { blogPostId: id },
      relations: ['product'],
      order: { displayOrder: 'ASC' },
    });

    return { ...post, linkedProducts: linkedProducts.map((lp) => lp.product) };
  }

  async create(
    data: Partial<BlogPost> & { tagIds?: string[] },
    authorId: string,
  ): Promise<BlogPost> {
    let slug = data.slug || slugify(data.title || '');
    slug = await this.ensureUniqueSlug(slug);

    let tags: BlogTag[] = [];
    if (data.tagIds?.length) {
      tags = await this.tagRepo.findBy({ id: In(data.tagIds) });
    }

    const post = this.blogRepo.create({
      title: data.title,
      content: data.content || '',
      excerpt: data.excerpt,
      coverImageUrl: data.coverImageUrl,
      status: data.status || BlogPostStatus.DRAFT,
      categoryId: data.categoryId,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      ogImageUrl: data.ogImageUrl,
      slug,
      authorId,
      tags,
    });

    if (post.status === BlogPostStatus.PUBLISHED) {
      post.publishedAt = new Date();
    }

    return this.blogRepo.save(post);
  }

  async update(
    id: string,
    data: Partial<BlogPost> & { tagIds?: string[] },
  ): Promise<BlogPost> {
    const post = await this.blogRepo.findOne({
      where: { id },
      relations: ['tags'],
    });
    if (!post) throw new NotFoundException(`Post ${id} not found`);

    if (data.title !== undefined) post.title = data.title;
    if (data.content !== undefined) post.content = data.content;
    if (data.excerpt !== undefined) post.excerpt = data.excerpt;
    if (data.coverImageUrl !== undefined) post.coverImageUrl = data.coverImageUrl;
    if (data.categoryId !== undefined) post.categoryId = data.categoryId;
    if (data.metaTitle !== undefined) post.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined) post.metaDescription = data.metaDescription;
    if (data.ogImageUrl !== undefined) post.ogImageUrl = data.ogImageUrl;

    if (data.slug) {
      post.slug = await this.ensureUniqueSlug(data.slug, id);
    }

    if (data.status !== undefined) {
      post.status = data.status;
      if (data.status === BlogPostStatus.PUBLISHED && !post.publishedAt) {
        post.publishedAt = new Date();
      }
    }

    if (data.tagIds) {
      post.tags = await this.tagRepo.findBy({ id: In(data.tagIds) });
    }

    return this.blogRepo.save(post);
  }

  async delete(id: string) {
    const result = await this.blogRepo.softDelete(id);
    if (!result.affected) throw new NotFoundException(`Post ${id} not found`);
    return { deleted: true };
  }

  async restore(id: string) {
    await this.blogRepo.restore(id);
    return this.blogRepo.findOne({ where: { id } });
  }

  private async ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
    let candidate = slug;
    let counter = 0;
    while (true) {
      const qb = this.blogRepo
        .createQueryBuilder('post')
        .withDeleted()
        .where('post.slug = :slug', { slug: candidate });
      if (excludeId) {
        qb.andWhere('post.id != :id', { id: excludeId });
      }
      const existing = await qb.getOne();
      if (!existing) return candidate;
      counter++;
      candidate = `${slug}-${counter}`;
    }
  }

  // ============ Categories ============

  async findAllCategories() {
    return this.categoryRepo.find({ order: { name: 'ASC' } });
  }

  async createCategory(data: { name: string; slug?: string; description?: string }) {
    const slug = data.slug || slugify(data.name);
    const category = this.categoryRepo.create({ ...data, slug });
    return this.categoryRepo.save(category);
  }

  async updateCategory(id: string, data: Partial<BlogCategory>) {
    const cat = await this.categoryRepo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException(`Category ${id} not found`);
    Object.assign(cat, data);
    return this.categoryRepo.save(cat);
  }

  async deleteCategory(id: string) {
    // Nullify posts with this category
    await this.blogRepo.update({ categoryId: id }, { categoryId: null as any });
    await this.categoryRepo.delete(id);
    return { deleted: true };
  }

  // ============ Tags ============

  async findAllTags() {
    return this.tagRepo.find({ order: { name: 'ASC' } });
  }

  async createTag(data: { name: string; slug?: string }) {
    const slug = data.slug || slugify(data.name);
    const tag = this.tagRepo.create({ ...data, slug });
    return this.tagRepo.save(tag);
  }

  async updateTag(id: string, data: Partial<BlogTag>) {
    const tag = await this.tagRepo.findOne({ where: { id } });
    if (!tag) throw new NotFoundException(`Tag ${id} not found`);
    Object.assign(tag, data);
    return this.tagRepo.save(tag);
  }

  async deleteTag(id: string) {
    await this.tagRepo.delete(id);
    return { deleted: true };
  }

  // ============ Product linking ============

  async linkProducts(postId: string, productIds: string[]) {
    const existing = await this.postProductRepo.find({ where: { blogPostId: postId } });
    const existingIds = new Set(existing.map((e) => e.productId));
    const newLinks = productIds
      .filter((pid) => !existingIds.has(pid))
      .map((pid, i) =>
        this.postProductRepo.create({
          blogPostId: postId,
          productId: pid,
          displayOrder: existing.length + i,
        }),
      );
    if (newLinks.length) await this.postProductRepo.save(newLinks);
    return this.postProductRepo.find({
      where: { blogPostId: postId },
      relations: ['product'],
      order: { displayOrder: 'ASC' },
    });
  }

  async unlinkProduct(postId: string, productId: string) {
    await this.postProductRepo.delete({ blogPostId: postId, productId });
    return { deleted: true };
  }
}
