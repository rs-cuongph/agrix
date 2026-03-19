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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/entities/user.entity';
import { BlogService } from './blog.service';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // Public endpoints (no auth)
  @Get('posts')
  async getPublished(
    @Query('category') category?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.blogService.findPublished(category, +page, +limit);
  }

  @Get('posts/:slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  // Admin endpoints (auth required)
  @Get('admin/posts')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async adminList() {
    return this.blogService.findAll();
  }

  @Post('admin/posts')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() body: any, @Req() req: any) {
    return this.blogService.create(body, req.user.id);
  }

  @Put('admin/posts/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() body: any) {
    return this.blogService.update(id, body);
  }

  @Delete('admin/posts/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.blogService.delete(id);
  }
}
