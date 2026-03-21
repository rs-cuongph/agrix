import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

async function getFaqs(): Promise<FaqItem[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/public/faq`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function FaqSection() {
  const faqs = await getFaqs();

  if (faqs.length === 0) return null;

  return (
    <section id="faq" className="py-20 px-6 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Câu hỏi thường gặp
          </h2>
          <p className="mt-3 text-gray-500">
            Tìm câu trả lời nhanh cho những thắc mắc phổ biến
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="bg-white border border-gray-200 rounded-xl px-5 data-[state=open]:shadow-sm"
            >
              <AccordionTrigger className="text-sm font-semibold text-gray-800 hover:text-emerald-600 py-4 [&[data-state=open]]:text-emerald-600">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-gray-600 leading-relaxed pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
