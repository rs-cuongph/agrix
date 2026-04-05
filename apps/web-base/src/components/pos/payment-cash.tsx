"use client";

function formatPrice(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

const AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];
const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "⌫"];

type Props = {
  total: number;
  paid: number;
  onChange: (amount: number) => void;
};

export function PaymentCash({ total, paid, onChange }: Props) {
  const change = paid - total;

  const handleDigit = (d: string) => {
    if (d === "⌫") {
      onChange(Math.floor(paid / 10));
      return;
    }
    const suffix = d === "000" ? 1000 : parseInt(d);
    if (d === "000") {
      onChange(paid * 1000);
    } else {
      onChange(paid * 10 + suffix);
    }
  };

  return (
    <div>
      {/* Quick amounts */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {AMOUNTS.map((a) => (
          <button
            key={a}
            onClick={() => onChange(a)}
            className="py-3 rounded-xl border-2 border-gray-100 hover:border-emerald-300 hover:bg-emerald-50 text-lg font-semibold text-gray-700 transition-all"
          >
            {formatPrice(a)}
          </button>
        ))}
      </div>

      {/* Received amount display */}
      <div className="bg-gray-50 rounded-xl px-5 py-3 mb-3 text-right">
        <p className="text-gray-400 text-base mb-1">Khách đưa</p>
        <p className="text-gray-800 font-bold text-3xl">{paid > 0 ? formatPrice(paid) : "—"}</p>
      </div>

      {/* Change */}
      {paid > 0 && (
        <div className={`flex items-center justify-between px-5 py-3 rounded-xl mb-3 ${change >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>
          <span className="text-lg font-semibold text-gray-600">{change >= 0 ? "Tiền thừa" : "Còn thiếu"}</span>
          <span className={`text-2xl font-bold ${change >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {formatPrice(Math.abs(change))}
          </span>
        </div>
      )}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-2">
        {DIGITS.map((d, i) => (
          <button
            key={i}
            onClick={() => handleDigit(d)}
            className="h-16 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-800 font-bold text-2xl transition-all"
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}
