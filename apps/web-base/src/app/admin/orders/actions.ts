"use server";

import { revalidatePath } from "next/cache";
import { apiDelete } from "@/lib/api";

export async function deleteOrderAction(id: string) {
  try {
    await apiDelete(`/orders/${id}`);
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error: any) {
    console.error("Delete order action failed:", error.message);
    return { success: false, error: error.message };
  }
}
