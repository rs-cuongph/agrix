import { apiGet } from "@/lib/api";
import { CategoriesClient } from "@/components/admin/categories-client";

type Category = {
  id: string;
  name: string;
  description?: string;
};

export default async function CategoriesPage() {
  let categories: Category[] = [];
  try {
    categories = await apiGet<Category[]>("/categories");
  } catch (e) {
    console.error("Categories fetch error:", e);
  }

  return <CategoriesClient categories={categories} />;
}
