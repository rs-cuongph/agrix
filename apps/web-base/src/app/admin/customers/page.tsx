import { apiGet } from "@/lib/api";
import { CustomersClient } from "@/components/admin/customers-client";

type Customer = {
  id: string; name: string; phone: string; address: string; outstandingDebt: number;
};

export default async function CustomersPage() {
  let customers: Customer[] = [];
  try {
    customers = await apiGet<Customer[]>("/customers");
  } catch (e) {
    console.error("Customers fetch error:", e);
  }

  return <CustomersClient customers={customers} />;
}
