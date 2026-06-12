declare module 'pdfkit' {
  import type { Writable } from 'stream'

  interface PDFDocumentOptions {
    size?: string | [number, number]
    margin?: number
  }

  class PDFDocument {
    constructor(options?: PDFDocumentOptions)
    fontSize(size: number): this
    font(font: string): this
    text(text: string, options?: { align?: string; indent?: number; width?: number }): this
    moveDown(lines?: number): this
    moveTo(x: number, y: number): this
    lineTo(x: number, y: number): this
    stroke(): this
    addPage(): this
    end(): void
    on(event: 'data', callback: (chunk: Buffer) => void): this
    on(event: 'end', callback: () => void): this
    on(event: 'error', callback: (error: Error) => void): this
    on(event: string, callback: (...args: unknown[]) => void): this
    pipe(dest: Writable): this
    y: number
  }

  export default PDFDocument
}