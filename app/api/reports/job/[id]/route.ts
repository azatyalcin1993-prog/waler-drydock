import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import PDFDocument from 'pdfkit'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // İş detayı
  const { data: job } = await supabase
    .from('jobs')
    .select('*, ships(name), profiles(full_name)')
    .eq('id', id)
    .single()

  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  // Fotoğraflar
  const { data: photos } = await supabase
    .from('job_photos')
    .select('*')
    .eq('job_id', id)
    .order('created_at', { ascending: false })

  // Loglar
  const { data: logs } = await supabase
    .from('job_logs')
    .select('*, profiles(full_name)')
    .eq('job_id', id)
    .order('created_at', { ascending: false })

  const statusLabels: Record<string, string> = {
    beklemede: 'Beklemede',
    devam_ediyor: 'Devam Ediyor',
    tamamlandi: 'Tamamlandı',
    gecikti: 'Gecikti',
  }

  // PDF oluştur
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  const chunks: Buffer[] = []
  doc.on('data', (chunk: Buffer) => chunks.push(chunk))
  doc.on('end', () => {})

  // Başlık
  doc.fontSize(20).font('Helvetica-Bold').text('WALER DRY DOCK', { align: 'center' })
  doc.fontSize(14).font('Helvetica-Bold').text('TERSANE İŞ RAPORU', { align: 'center' })
  doc.moveDown()
  doc.fontSize(10).font('Helvetica').text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, { align: 'right' })
  doc.moveDown()
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()
  doc.moveDown()

  // İş Bilgileri
  doc.fontSize(14).font('Helvetica-Bold').text('İŞ BİLGİLERİ')
  doc.moveDown(0.5)
  doc.fontSize(11).font('Helvetica')

  const row = (label: string, value: string) => {
    doc.text(`${label}: ${value || '-'}`, { indent: 15 })
  }

  row('İş No', job.job_no)
  row('Bölüm / Konum', job.section)
  row('Açıklama', job.description)
  row('Gemi', job.ships?.name || '-')
  row('Durum', statusLabels[job.status] || job.status)
  row('İlerleme', `${job.progress ?? 0}%`)
  row('Sorumlu', job.profiles?.full_name || 'Atanmamış')
  row('Başlangıç', job.start_date || '-')
  row('Bitiş', job.end_date || '-')
  row('Oluşturulma', new Date(job.created_at).toLocaleDateString('tr-TR'))

  doc.moveDown()
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()
  doc.moveDown()

  // Fotoğraflar
  if (photos && photos.length > 0) {
    doc.fontSize(14).font('Helvetica-Bold').text('FOTOĞRAFLAR')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
    photos.forEach((photo: any) => {
      doc.text(`📷 ${photo.file_name} - ${new Date(photo.created_at).toLocaleDateString('tr-TR')}`, { indent: 15 })
    })
    doc.moveDown()
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()
    doc.moveDown()
  }

  // İşlem Geçmişi
  if (logs && logs.length > 0) {
    doc.fontSize(14).font('Helvetica-Bold').text('İŞLEM GEÇMİŞİ')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica')
    logs.forEach((log: any) => {
      const name = log.profiles?.full_name || 'Bilinmeyen'
      const date = new Date(log.created_at).toLocaleString('tr-TR')
      doc.text(`[${date}] ${name}: ${log.content}`, { indent: 15 })
    })
  }

  doc.moveDown(2)
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()
  doc.moveDown(0.5)
  doc.fontSize(8).font('Helvetica').text('Waler Dry Dock - Tersane Yönetim Sistemi · Otomatik oluşturulmuş rapordur.', { align: 'center' })

  doc.end()

  const pdfBuffer = Buffer.concat(chunks)
  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="is_raporu_${job.job_no || id}.pdf"`,
    },
  })
}