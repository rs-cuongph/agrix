import ContactSection from '@/components/landing/contact-section';

interface StoreInfo {
  storeName?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
}

async function getStoreInfo(): Promise<StoreInfo> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/public/settings`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

export default async function ContactSectionWrapper() {
  const storeInfo = await getStoreInfo();
  return <ContactSection storeInfo={storeInfo} />;
}
