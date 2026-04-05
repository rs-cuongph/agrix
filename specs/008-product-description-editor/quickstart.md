# Quickstart: Rich Text Editor Validation

Follow these steps to manually verify the rich-text product description feature across the Admin, POS, and Landing endpoints.

## 1. Verify Admin Entry
- Open the Admin dashboard and navigate to `Quản lý Hàng Hóa` -> `Danh mục thực đơn` (or Products section).
- Edit an existing product.
- Look at the "Mô tả sản phẩm" field and verify it is a rich text editor instead of a plain textarea.
- Format the text with **Bold**, *Italic*, and a bulleted list.
- Click `Lưu` (Save).
- Reload the page and ensure the formatting remains intact instead of plain HTML tags.

## 2. Verify POS Display
- Open the POS interface (`/pos`).
- Search for the product you just edited.
- Click the Info `(i)` button on the product card to open the Details Modal.
- Scroll to "Thông tin bổ sung".
- Verify that the text renders the **Bold**, *Italic*, and lists correctly, rather than showing raw tags like `<b>`.

## 3. Verify Landing Page Display
- Navigate to the consumer-facing Landing Page product view.
- Open the same product.
- Verify that the description section renders the HTML correctly.
- *Security Check*: Try inserting `<script>alert('XSS')</script>` in the admin using browser devtools or raw API (since Tiptap usually strips scripts natively) and ensure the script does not execute on the frontend.
