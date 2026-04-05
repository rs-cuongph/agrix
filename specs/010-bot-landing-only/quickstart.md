# Quickstart: Chatbot Rate Limiting by Source

**Branch**: `010-bot-landing-only` | **Date**: 2026-04-05

## Prerequisites

- Backend đang chạy: `npm run backend:dev`
- Frontend đang chạy: `npm run web:dev`
- Chatbot đã enabled trong Admin → Quản lý AI

## Test 1: Landing Page — Giới hạn vẫn hoạt động

1. Mở Landing Page: `http://localhost:3002`
2. Click vào icon chatbot (robot) góc phải dưới
3. Gửi 5 tin nhắn liên tiếp (có thể dùng các gợi ý nhanh)
4. Gửi tin nhắn thứ 6
5. **Expected**: Bot trả lời lỗi "Đã đạt giới hạn ... tin nhắn cho phiên này"
6. Click nút "Cuộc hội thoại mới" (RotateCcw icon)
7. Gửi tin nhắn mới — **Expected**: hoạt động bình thường (session mới)

## Test 2: POS — Không bị giới hạn

1. Mở POS: `http://localhost:3002/pos`
2. Đăng nhập bằng PIN
3. Click vào icon chatbot
4. Gửi 6+ tin nhắn liên tiếp
5. **Expected**: Tất cả đều được xử lý bình thường, không bị chặn
6. Tiếp tục gửi 10+ tin nhắn — vẫn không bị chặn

## Test 3: Admin — Không bị giới hạn (nếu có chatbot)

1. Mở Admin: `http://localhost:3002/admin`
2. Hiện tại chatbot ẩn trên admin (`ChatWrapper` return null)
3. Nếu sau này bật chatbot trên admin, xác nhận source = `admin` được gửi đúng

## Files Modified

| File | Action | Description |
|------|--------|-------------|
| `apps/backend/src/ai/dto/ask.dto.ts` | MODIFY | Thêm field `source` optional |
| `apps/backend/src/ai/chat-session.service.ts` | MODIFY | Bypass limit khi source != 'landing' |
| `apps/web-base/src/lib/chat-context.tsx` | MODIFY | Gửi `source` derived from pathname |
| `apps/web-base/src/app/api/chat/route.ts` | MODIFY | Forward `source` field to backend |
