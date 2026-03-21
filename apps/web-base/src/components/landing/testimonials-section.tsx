import { Star, Quote } from 'lucide-react';

interface TestimonialItem {
  id: string;
  customerName: string;
  content: string;
  rating: number;
  avatarUrl?: string;
}

async function getTestimonials(): Promise<TestimonialItem[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/public/testimonials`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function TestimonialsSection() {
  const items = await getTestimonials();

  if (items.length === 0) return null;

  return (
    <section id="testimonials" className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Khách hàng nói gì?
          </h2>
          <p className="mt-3 text-gray-500 max-w-lg mx-auto">
            Phản hồi từ bà con nông dân và đại lý đối tác
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t) => (
            <div
              key={t.id}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <Quote size={24} className="text-emerald-200 mb-3" />
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                {t.content}
              </p>

              <div className="mt-4 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < t.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-200'
                    }
                  />
                ))}
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
                  {t.customerName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {t.customerName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
