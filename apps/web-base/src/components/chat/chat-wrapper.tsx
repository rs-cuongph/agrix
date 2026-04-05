'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChatProvider } from '@/lib/chat-context';
import ChatWidget from './chat-widget';

/**
 * Client wrapper for ChatProvider + ChatWidget.
 * Only renders on non-admin pages AND when chatbot is enabled in config.
 */
export default function ChatWrapper() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState<boolean | null>(null);

  let statusPromise: Promise<boolean> | null = null;

  useEffect(() => {
    if (!statusPromise) {
      statusPromise = fetch('/api/chat/status')
        .then((res) => res.json())
        .then((data) => data.enabled)
        .catch(() => false);
    }
    statusPromise.then(setEnabled);
  }, []);

  // Don't render chat widget on admin or POS pages
  if (pathname.startsWith('/admin') || pathname.startsWith('/pos/login')) {
    return null;
  }

  // Wait for config or hide if disabled
  if (!enabled) {
    return null;
  }

  return (
    <ChatProvider>
      <ChatWidget />
    </ChatProvider>
  );
}
