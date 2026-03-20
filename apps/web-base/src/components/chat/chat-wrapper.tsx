'use client';

import { ChatProvider } from '@/lib/chat-context';
import ChatWidget from './chat-widget';

/**
 * Client wrapper component for ChatProvider + ChatWidget.
 * Used in the root layout (server component can't directly use client context).
 */
export default function ChatWrapper() {
  return (
    <ChatProvider>
      <ChatWidget />
    </ChatProvider>
  );
}
