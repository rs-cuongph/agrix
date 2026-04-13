'use client';

import React, { useState, useEffect } from 'react';
import { Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { AdminActionButton, AdminIconButton } from '@/components/admin/admin-action-button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Config {
  systemPrompt: string;
  primaryProvider: string;
  hasPrimaryKey: boolean;
  secondaryProvider: string;
  hasSecondaryKey: boolean;
  enabled: boolean;
  maxMessagesPerSession: number;
}

async function adminFetch(path: string, options?: { method?: string; body?: any }) {
  if (!options?.body && !options?.method) {
    // GET
    const res = await fetch(`/api/admin/proxy?path=${encodeURIComponent(path)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Lỗi' }));
      throw new Error(err.message || `Error ${res.status}`);
    }
    return res.json();
  }
  // POST/PUT
  const res = await fetch('/api/admin/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, method: options?.method || 'POST', body: options?.body }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Lỗi' }));
    throw new Error(err.message || `Error ${res.status}`);
  }
  return res.json();
}

export default function ChatbotConfigPanel() {
  const [config, setConfig] = useState<Config | null>(null);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [primaryProvider, setPrimaryProvider] = useState('openai');
  const [primaryApiKey, setPrimaryApiKey] = useState('');
  const [secondaryProvider, setSecondaryProvider] = useState('gemini');
  const [secondaryApiKey, setSecondaryApiKey] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [maxMessages, setMaxMessages] = useState(20);
  const [saving, setSaving] = useState(false);
  const [showPrimaryKey, setShowPrimaryKey] = useState(false);
  const [showSecondaryKey, setShowSecondaryKey] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await adminFetch('/ai/admin/config');
      setConfig(data);
      setSystemPrompt(data.systemPrompt);
      setPrimaryProvider(data.primaryProvider);
      setSecondaryProvider(data.secondaryProvider || 'gemini');
      setEnabled(data.enabled);
      setMaxMessages(data.maxMessagesPerSession);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: any = {
        systemPrompt,
        primaryProvider,
        secondaryProvider,
        enabled,
        maxMessagesPerSession: maxMessages,
      };
      if (primaryApiKey) updates.primaryApiKey = primaryApiKey;
      if (secondaryApiKey) updates.secondaryApiKey = secondaryApiKey;

      await adminFetch('/ai/admin/config', {
        method: 'PUT',
        body: updates,
      });

      toast.success('Đã cập nhật cấu hình');
      setPrimaryApiKey('');
      setSecondaryApiKey('');
      loadConfig();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!config) return <div className="text-center text-gray-400 py-8">Đang tải...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Enable/Disable toggle */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
        <div>
          <h4 className="font-medium">Trạng thái Chatbot</h4>
          <p className="text-sm text-gray-500">Bật/tắt chatbot trên Landing Page</p>
        </div>
        <button
          type="button"
          onClick={() => setEnabled(!enabled)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            enabled ? 'bg-emerald-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              enabled ? 'translate-x-6' : ''
            }`}
          />
        </button>
      </div>

      {/* System Prompt */}
      <div className="p-4 bg-white rounded-lg border">
        <h4 className="font-medium mb-2">System Prompt</h4>
        <p className="text-sm text-gray-500 mb-3">Hướng dẫn AI về giai điệu, phạm vi trả lời</p>
        <Textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={4}
        />
      </div>

      {/* AI Providers */}
      <div className="p-4 bg-white rounded-lg border space-y-4">
        <h4 className="font-medium">AI Providers</h4>

        {/* Primary */}
        <div>
          <label className="text-sm text-gray-600 block mb-1">Provider chính</label>
          <div className="flex gap-2">
            <Select value={primaryProvider} onValueChange={setPrimaryProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="flex-1 relative">
              <Input
                type={showPrimaryKey ? 'text' : 'password'}
                value={primaryApiKey}
                onChange={(e) => setPrimaryApiKey(e.target.value)}
                placeholder={config.hasPrimaryKey ? '••••••• (đã cấu hình)' : 'Nhập API key...'}
                className="pr-10"
              />
              <AdminIconButton
                onClick={() => setShowPrimaryKey(!showPrimaryKey)}
                type="button"
                className="absolute right-1.5 top-1.5"
              >
                {showPrimaryKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </AdminIconButton>
            </div>
          </div>
        </div>

        {/* Secondary */}
        <div>
          <label className="text-sm text-gray-600 block mb-1">Provider phụ (fallback)</label>
          <div className="flex gap-2">
            <Select value={secondaryProvider} onValueChange={setSecondaryProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="flex-1 relative">
              <Input
                type={showSecondaryKey ? 'text' : 'password'}
                value={secondaryApiKey}
                onChange={(e) => setSecondaryApiKey(e.target.value)}
                placeholder={config.hasSecondaryKey ? '••••••• (đã cấu hình)' : 'Nhập API key...'}
                className="pr-10"
              />
              <AdminIconButton
                onClick={() => setShowSecondaryKey(!showSecondaryKey)}
                type="button"
                className="absolute right-1.5 top-1.5"
              >
                {showSecondaryKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </AdminIconButton>
            </div>
          </div>
        </div>
      </div>

      {/* Session Limit */}
      <div className="p-4 bg-white rounded-lg border">
        <h4 className="font-medium mb-2">Giới hạn tin nhắn / phiên</h4>
        <div className="flex items-center gap-4">
          <Slider
            min={5}
            max={100}
            step={5}
            value={[maxMessages]}
            onValueChange={(v) => setMaxMessages(v[0])}
            className="flex-1"
          />
          <span className="text-sm font-medium w-10 text-center">{maxMessages}</span>
        </div>
      </div>

      {/* Save */}
      <AdminActionButton
        onClick={handleSave}
        disabled={saving}
        className="w-fit px-6"
      >
        <Save size={16} />
        {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
      </AdminActionButton>
    </div>
  );
}
