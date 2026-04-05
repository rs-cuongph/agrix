import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/entities/user.entity';
import { BlogService } from './blog.service';
import { StorageService } from '../storage/storage.service';
import { v4 as uuidv4 } from 'uuid';
import { CreatePostDto, UpdatePostDto } from './dto/create-post.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';
import { CreateTagDto, UpdateTagDto } from './dto/create-tag.dto';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

@Controller('blog')
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly storageService: StorageService,
  ) {}

  // ============ Public endpoints ============

  @Get('posts')
  async getPublished(
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.blogService.findPublished(category, tag, +page, +limit);
  }

  @Get('posts/:slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  @Get('categories')
  async getCategories() {
    return this.blogService.findAllCategories();
  }

  @Get('tags')
  async getTags() {
    return this.blogService.findAllTags();
  }

  // ============ Admin: Upload ============

  @Post('admin/upload')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    if (!ALLOWED_MIMES.includes(file.mimetype))
      throw new BadRequestException('File type not allowed. Allowed: JPEG, PNG, WebP, GIF');
    if (file.size > MAX_SIZE)
      throw new BadRequestException('File too large. Maximum 5MB');

    const ext = file.originalname.split('.').pop() || 'jpg';
    const key = `blog/${uuidv4()}.${ext}`;
    return this.storageService.uploadFile(key, file.buffer, file.mimetype);
  }

  // ============ Admin: Posts ============

  @Get('admin/posts')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async adminList() {
    return this.blogService.findAll();
  }

  @Get('admin/posts/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async adminGetById(@Param('id') id: string) {
    return this.blogService.findById(id);
  }

  @Post('admin/posts')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() body: CreatePostDto, @Req() req: any) {
    return this.blogService.create(body, req.user.id);
  }

  @Put('admin/posts/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() body: UpdatePostDto) {
    return this.blogService.update(id, body);
  }

  @Delete('admin/posts/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.blogService.delete(id);
  }

  @Put('admin/posts/:id/restore')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async restore(@Param('id') id: string) {
    return this.blogService.restore(id);
  }

  // ============ Admin: Product linking ============

  @Post('admin/posts/:id/products')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async linkProducts(@Param('id') id: string, @Body() body: { productIds: string[] }) {
    return this.blogService.linkProducts(id, body.productIds);
  }

  @Delete('admin/posts/:id/products/:productId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async unlinkProduct(@Param('id') id: string, @Param('productId') productId: string) {
    return this.blogService.unlinkProduct(id, productId);
  }

  // ============ Admin: Categories ============

  @Get('admin/categories')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async adminCategories() {
    return this.blogService.findAllCategories();
  }

  @Post('admin/categories')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async createCategory(@Body() body: CreateCategoryDto) {
    return this.blogService.createCategory(body);
  }

  @Put('admin/categories/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateCategory(@Param('id') id: string, @Body() body: UpdateCategoryDto) {
    return this.blogService.updateCategory(id, body);
  }

  @Delete('admin/categories/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteCategory(@Param('id') id: string) {
    return this.blogService.deleteCategory(id);
  }

  // ============ Admin: Tags ============

  @Get('admin/tags')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async adminTags() {
    return this.blogService.findAllTags();
  }

  @Post('admin/tags')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async createTag(@Body() body: CreateTagDto) {
    return this.blogService.createTag(body);
  }

  @Put('admin/tags/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateTag(@Param('id') id: string, @Body() body: UpdateTagDto) {
    return this.blogService.updateTag(id, body);
  }

  @Delete('admin/tags/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteTag(@Param('id') id: string) {
    return this.blogService.deleteTag(id);
  }
}
