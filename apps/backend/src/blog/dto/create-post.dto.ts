import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsUUID,
} from 'class-validator';
import { BlogPostStatus } from '../entities/blog-post.entity';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @IsEnum(BlogPostStatus)
  @IsOptional()
  status?: BlogPostStatus;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsString()
  @IsOptional()
  ogImageUrl?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  tagIds?: string[];
}

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @IsEnum(BlogPostStatus)
  @IsOptional()
  status?: BlogPostStatus;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsString()
  @IsOptional()
  ogImageUrl?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  tagIds?: string[];
}
