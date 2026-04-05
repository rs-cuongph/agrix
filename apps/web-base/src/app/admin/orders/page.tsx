import { apiGet, type PaginatedResponse } from "@/lib/api";
import { OrdersClient } from "@/components/admin/orders-client";

type OrderItem = {
  id: string; productId: string; quantityBase: number;
  soldUnit: string; unitPrice: number; lineTotal: number;
};

type Order = {
  id: string; totalAmount: number; paidAmount: number;
  paymentMethod: string; createdAt: string; syncStatus: string;
  customer?: { id: string; name: string; phone?: string };
  items?: OrderItem[];
};

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  let orders: Order[] = [];
  const params = await searchParams;
  const search = params.search || "";
  
  try {
    const url = search ? `/orders?search=${encodeURIComponent(search)}` : "/orders";
    const res = await apiGet<PaginatedResponse<Order>>(url);
    orders = res.data;
  } catch (e) {
    console.error("Orders fetch error:", e);
  }

  return <OrdersClient orders={orders} initialSearch={search} />;
}
