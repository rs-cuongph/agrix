// POS-specific API client that calls the /api/pos/proxy route

export type PosProduct = {
  id: string;
  sku: string;
  name: string;
  baseSellPrice: number;
  baseUnit: string;
  currentStockBase: number;
  imageUrls: string[] | null;
  barcodeEan13: string | null;
  categoryId?: string | null;
  description?: string;
  units: Array<{
    id: string;
    unitName: string;
    conversionFactor: number;
    sellPrice: number | null;
  }>;
};

export type PosCategory = {
  id: string;
  name: string;
  parentId: string | null;
};

export type PosCustomer = {
  id: string;
  name: string;
  phone: string | null;
  outstandingDebt: number;
};

export type PosOrder = {
  id: string;
  orderCode: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  customerId: string | null;
  customer?: PosCustomer;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "MIXED";
  syncStatus: "SYNCED" | "PENDING";
  createdAt: string;
  items: Array<{
    id: string;
    productId: string;
    product: { name: string };
    quantityBase: number;
    soldUnit: string;
    unitPrice: number;
    lineTotal: number;
  }>;
};

type PosProxyOptions = {
  path: string;
  method?: string;
  body?: unknown;
};

async function posProxyCall<T>(opts: PosProxyOptions): Promise<T> {
  const res = await fetch("/api/pos/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: opts.path, method: opts.method || "GET", body: opts.body }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POS API Error ${res.status}: ${text}`);
  }
  return res.json();
}

async function posProxyGet<T>(path: string): Promise<T> {
  const params = new URLSearchParams({ path });
  const res = await fetch(`/api/pos/proxy?${params}`, { method: "GET" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POS API Error ${res.status}: ${text}`);
  }
  return res.json();
}

// ---- Product APIs ----

export async function searchProducts(query: string, categoryId?: string): Promise<PosProduct[]> {
  const params: Record<string, string> = { search: query, isActive: "true", limit: "50" };
  if (categoryId) params.category = categoryId;
  const queryString = new URLSearchParams(params).toString();
  const data = await posProxyGet<{ data: PosProduct[] } | PosProduct[]>(`/products?${queryString}`);
  return Array.isArray(data) ? data : data.data;
}

export async function getProductByBarcode(barcode: string): Promise<PosProduct | null> {
  try {
    const data = await posProxyGet<{ data: PosProduct[] } | PosProduct[]>(`/products/lookup?barcode=${barcode}`);
    const arr = Array.isArray(data) ? data : data.data;
    return arr.length > 0 ? arr[0] : null;
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<PosCategory[]> {
  return posProxyGet<PosCategory[]>("/categories");
}

// ---- Customer APIs ----

export async function searchCustomers(query: string): Promise<PosCustomer[]> {
  const data = await posProxyGet<{ data: PosCustomer[] } | PosCustomer[]>(`/customers?search=${encodeURIComponent(query)}&limit=10`);
  return Array.isArray(data) ? data : data.data;
}

export async function createCustomer(name: string, phone: string): Promise<PosCustomer> {
  return posProxyCall<PosCustomer>({ path: "/customers", method: "POST", body: { name, phone } });
}

// ---- Order APIs ----

export type CreateOrderPayload = {
  customerId?: string;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "MIXED";
  idempotencyKey: string;
  items: Array<{
    productId: string;
    quantityBase: number;
    soldUnit: string;
    unitPrice: number;
    lineTotal: number;
  }>;
};

export async function submitOrder(payload: CreateOrderPayload): Promise<PosOrder> {
  return posProxyCall<PosOrder>({ path: "/orders", method: "POST", body: payload });
}

export async function getTodayOrders(): Promise<PosOrder[]> {
  const today = new Date().toISOString().slice(0, 10);
  const data = await posProxyGet<{ data: PosOrder[] } | PosOrder[]>(`/orders?date=${today}&limit=100`);
  return Array.isArray(data) ? data : data.data;
}

export async function getOrderHistory(
  search?: string,
  page: number = 1,
  limit: number = 20
): Promise<{ data: PosOrder[]; meta: { total: number; page: number; limit: number } }> {
  const params: Record<string, string> = { page: page.toString(), limit: limit.toString() };
  if (search) params.search = search;
  const queryString = new URLSearchParams(params).toString();
  return posProxyGet<{ data: PosOrder[]; meta: { total: number; page: number; limit: number } }>(`/orders?${queryString}`);
}

export async function getOrderDetail(id: string): Promise<PosOrder> {
  return posProxyGet<PosOrder>(`/orders/${id}`);
}

// ---- Store Settings ----

export type StoreSettings = {
  storeName: string;
  bankBin: string | null;
  bankAccountNo: string | null;
  bankAccountName: string | null;
};

export async function getStoreSettings(): Promise<StoreSettings> {
  return posProxyGet<StoreSettings>("/public/settings");
}
