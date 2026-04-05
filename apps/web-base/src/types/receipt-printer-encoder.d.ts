declare module '@point-of-sale/receipt-printer-encoder' {
    export default class ReceiptPrinterEncoder {
        constructor(options?: { language?: string; imageMode?: string; feedBeforeCut?: number });
        initialize(): this;
        codepage(cp: string): this;
        align(align: 'left' | 'center' | 'right'): this;
        bold(value: boolean): this;
        line(text: string): this;
        encode(): Uint8Array;
    }
}
