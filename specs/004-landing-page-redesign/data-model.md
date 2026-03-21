# Data Model: Landing Page Redesign

## Entity: Product (Updated)

| Field Name      | Type                   | Constraints/Rules                     |
|-----------------|------------------------|---------------------------------------|
| `id`            | UUID                   | Primary Key                           |
| `name`          | String                 | Required                              |
| `baseSellPrice` | Decimal                | Required                              |
| `imageUrls`     | String Array (`text[]`)| Optional (JSON or Array of strings)   |
| `description`   | Text                   | HTML/Markdown content                 |
| `status`        | Enum                   | e.g. ACTIVE, DRAFT                    |

*Note*: Previously, `Product` had a single `image` or `coverImageUrl`. We will replace it with `imageUrls` to support galleries.

## Contracts

### `POST /api/v1/products/admin/upload`
Uploads multiple product images to MinIO and returns public access URLs.

**Request**: `multipart/form-data` with multiple `files` (image/*).
**Response (200 OK)**:
```json
{
  "urls": [
    "http://localhost:9000/agrix-assets/products/uuid1.jpg",
    "http://localhost:9000/agrix-assets/products/uuid2.jpg"
  ]
}
```

### `PUT /api/v1/products/admin/:id`
Admin payload to update product should now accept `imageUrls: string[]`.
