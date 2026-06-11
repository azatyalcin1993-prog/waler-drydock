declare module 'pdfkit' {
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
    on(event: string, callback: (...args: any[]) => void): this
    pipe(dest: any): this
    y: number
  }

  export default PDFDocument
}