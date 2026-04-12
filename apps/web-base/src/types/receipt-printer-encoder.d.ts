declare module '@point-of-sale/receipt-printer-encoder' {
    export default class ReceiptPrinterEncoder {
        constructor(options?: { language?: string; imageMode?: string; feedBeforeCut?: number });
        initialize(): this;
        codepage(cp: string): this;
        align(align: 'left' | 'center' | 'right'): this;
        bold(value: boolean): this;
        line(text: string): this;
        barcode(
            value: string,
            symbology: string | number,
            options?: number | { height?: number; width?: number; text?: boolean }
        ): this;
        newline(value?: number): this;
        cut(value?: 'full' | 'partial'): this;
        encode(): Uint8Array;
    }
}
