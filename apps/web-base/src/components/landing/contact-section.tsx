'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Send, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface StoreInfo {
  storeName?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
}

export default function ContactSection({ storeInfo }: { storeInfo: StoreInfo }) {
  const [form, setForm] = useState({
    customerName: '',
    phoneNumber: '',
    email: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Gửi thất bại');
      }
      setSuccess(true);
      setForm({ customerName: '', phoneNumber: '', email: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Liên hệ với chúng tôi
          </h2>
          <p className="mt-3 text-gray-500 max-w-lg mx-auto">
            Luôn sẵn sàng hỗ trợ và tư vấn cho bạn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Store Info */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">
              {storeInfo.storeName || 'Agrix'}
            </h3>

            <div className="space-y-4">
              {storeInfo.address && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Địa chỉ</p>
                    <p className="text-sm text-gray-500">{storeInfo.address}</p>
                  </div>
                </div>
              )}
              {storeInfo.phoneNumber && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <Phone size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Điện thoại</p>
                    <p className="text-sm text-gray-500">{storeInfo.phoneNumber}</p>
                  </div>
                </div>
              )}
              {storeInfo.email && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <Mail size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-sm text-gray-500">{storeInfo.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100">
            {success ? (
              <div className="text-center py-8">
                <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900">Gửi thành công!</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSuccess(false)}
                >
                  Gửi tin nhắn khác
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Họ và tên *
                  </label>
                  <Input
                    required
                    maxLength={255}
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Số điện thoại *
                  </label>
                  <Input
                    required
                    type="tel"
                    maxLength={11}
                    pattern="0[0-9]{9,10}"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    placeholder="0912345678"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    maxLength={255}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Lời nhắn *
                  </label>
                  <Textarea
                    required
                    maxLength={2000}
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tôi muốn tư vấn về..."
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  {submitting ? (
                    'Đang gửi...'
                  ) : (
                    <>
                      <Send size={16} className="mr-2" />
                      Gửi liên hệ
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
