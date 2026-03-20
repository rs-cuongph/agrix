# API Contracts: Professional Blog System

## Public Endpoints (No Auth)

### GET /blog/posts
List published posts with pagination.

**Query**: `?category=slug&tag=slug&page=1&limit=10`
**Response**: `{ items: BlogPost[], total: number, page: number, limit: number }`

### GET /blog/posts/:slug
Get single published post by slug.

**Response**: Full BlogPost with author, category, tags, linked products.

### GET /blog/categories
List all blog categories.

**Response**: `BlogCategory[]`

### GET /blog/tags
List all blog tags.

**Response**: `BlogTag[]`

---

## Admin Endpoints (Auth + Role Guard)

### POST /blog/admin/upload
Upload image to MinIO. Multipart form data.

**Body**: `file` (multipart, max 5MB, JPEG/PNG/WebP/GIF)
**Response**: `{ url: string, key: string }`

### GET /blog/admin/posts
List all posts (including drafts).

**Response**: `BlogPost[]` with author, category.

### POST /blog/admin/posts
Create new post (auto-generates slug, starts as DRAFT).

**Body**: `{ title, content, excerpt?, categoryId?, tagIds?, metaTitle?, metaDescription?, ogImageUrl?, coverImageUrl?, status? }`
**Response**: `BlogPost`

### PUT /blog/admin/posts/:id
Update post (auto-save hits this). Also handles publish/unpublish.

**Body**: Partial `{ title?, content?, excerpt?, categoryId?, tagIds?, metaTitle?, metaDescription?, ogImageUrl?, coverImageUrl?, status? }`
**Response**: `BlogPost`

### DELETE /blog/admin/posts/:id
Soft delete a post.

**Response**: `{ success: true }`

### PUT /blog/admin/posts/:id/restore
Restore a soft-deleted post.

**Response**: `BlogPost`

### POST /blog/admin/posts/:id/products
Link products to a post.

**Body**: `{ productIds: string[] }`
**Response**: `BlogPostProduct[]`

### DELETE /blog/admin/posts/:id/products/:productId
Unlink a product from a post.

**Response**: `{ success: true }`

---

## Blog Category Admin Endpoints

### GET /blog/admin/categories
List all categories.

### POST /blog/admin/categories
Create category. **Body**: `{ name, slug?, description? }`

### PUT /blog/admin/categories/:id
Update category.

### DELETE /blog/admin/categories/:id
Delete category (posts reassigned to null).

---

## Blog Tag Admin Endpoints

### GET /blog/admin/tags
List all tags.

### POST /blog/admin/tags
Create tag. **Body**: `{ name, slug? }`

### PUT /blog/admin/tags/:id
Update tag.

### DELETE /blog/admin/tags/:id
Delete tag (removed from posts).
