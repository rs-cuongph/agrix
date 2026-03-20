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

export default async function OrdersPage() {
  let orders: Order[] = [];
  try {
    const res = await apiGet<PaginatedResponse<Order>>("/orders");
    orders = res.data;
  } catch (e) {
    console.error("Orders fetch error:", e);
  }

  return <OrdersClient orders={orders} />;
}
