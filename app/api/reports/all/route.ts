import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import PDFDocument from 'pdfkit'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, ships(name), profiles(full_name)')
    .order('created_at', { ascending: false })

  const statusLabels: Record<string, string> = {
    beklemede: 'Beklemede',
    devam_ediyor: 'Devam Ediyor',
    tamamlandi: 'Tamamlandı',
    gecikti: 'Gecikti',
  }

  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  const chunks: Buffer[] = []
  doc.on('data', (chunk: Buffer) => chunks.push(chunk))
  doc.on('end', () => {})

  doc.fontSize(20).font('Helvetica-Bold').text('WALER DRY DOCK', { align: 'center' })
  doc.fontSize(14).font('Helvetica-Bold').text('TÜM İŞLER RAPORU', { align: 'center' })
  doc.moveDown()
  doc.fontSize(10).font('Helvetica').text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, { align: 'right' })
  doc.moveDown()
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()
  doc.moveDown()

  // İstatistikler
  const stats = {
    toplam: jobs?.length ?? 0,
    beklemede: jobs?.filter(j => j.status === 'beklemede').length ?? 0,
    devam_ediyor: jobs?.filter(j => j.status === 'devam_ediyor').length ?? 0,
    tamamlandi: jobs?.filter(j => j.status === 'tamamlandi').length ?? 0,
    gecikti: jobs?.filter(j => j.status === 'gecikti').length ?? 0,
  }

  doc.fontSize(12).font('Helvetica-Bold').text('ÖZET İSTATİSTİKLER')
  doc.moveDown(0.3)
  doc.fontSize(10).font('Helvetica')
  doc.text(`Toplam İş: ${stats.toplam}`, { indent: 15 })
  doc.text(`Beklemede: ${stats.beklemede} | Devam Ediyor: ${stats.devam_ediyor} | Tamamlandı: ${stats.tamamlandi} | Gecikti: ${stats.gecikti}`, { indent: 15 })

  doc.moveDown()
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()
  doc.moveDown()

  if (!jobs || jobs.length === 0) {
    doc.text('Henüz hiçbir iş kaydı bulunmamaktadır.', { align: 'center' })
  } else {
    jobs.forEach((job: any, index: number) => {
      if (index > 0) doc.addPage()

      doc.fontSize(13).font('Helvetica-Bold').text(`İş #${index + 1}: ${job.section}`)
      doc.moveDown(0.3)
      doc.fontSize(10).font('Helvetica')
      doc.text(`İş No: ${job.job_no}`, { indent: 10 })
      doc.text(`Gemi: ${job.ships?.name || '-'}`, { indent: 10 })
      doc.text(`Durum: ${statusLabels[job.status] || job.status} | İlerleme: ${job.progress ?? 0}%`, { indent: 10 })
      doc.text(`Sorumlu: ${job.profiles?.full_name || 'Atanmamış'}`, { indent: 10 })
      doc.text(`Tarih: ${job.start_date || '-'} → ${job.end_date || '-'}`, { indent: 10 })
      if (job.description) doc.text(`Açıklama: ${job.description}`, { indent: 10 })

      doc.moveDown()
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()
      doc.moveDown()
    })
  }

  doc.fontSize(8).font('Helvetica').text('Waler Dry Dock - Tersane Yönetim Sistemi · Otomatik oluşturulmuş rapordur.', { align: 'center' })

  doc.end()

  const pdfBuffer = Buffer.concat(chunks)
  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="tum_isler_raporu_${Date.now()}.pdf"`,
    },
  })
}