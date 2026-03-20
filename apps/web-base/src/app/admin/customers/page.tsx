import { apiGet } from "@/lib/api";
import { Users } from "lucide-react";

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

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
        <Users className="w-6 h-6" /> Khách hàng
      </h1>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-semibold">Tên</th>
              <th className="text-left px-4 py-3 font-semibold">SĐT</th>
              <th className="text-left px-4 py-3 font-semibold">Địa chỉ</th>
              <th className="text-right px-4 py-3 font-semibold">Công nợ</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.address}</td>
                <td className={`px-4 py-3 text-right font-semibold ${c.outstandingDebt > 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {c.outstandingDebt?.toLocaleString()}đ
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Chưa có khách hàng</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
