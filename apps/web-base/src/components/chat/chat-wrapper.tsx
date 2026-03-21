'use client';

import { usePathname } from 'next/navigation';
import { ChatProvider } from '@/lib/chat-context';
import ChatWidget from './chat-widget';

/**
 * Client wrapper for ChatProvider + ChatWidget.
 * Only renders on non-admin pages (landing page, products, blog, etc).
 */
export default function ChatWrapper() {
  const pathname = usePathname();

  // Don't render chat widget on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <ChatProvider>
      <ChatWidget />
    </ChatProvider>
  );
}
