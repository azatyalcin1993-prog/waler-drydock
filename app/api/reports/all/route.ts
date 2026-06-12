import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { JobWithRelations } from '@/lib/types'

export const runtime = 'nodejs'

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export async function GET() {
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

  const statusColors: Record<string, string> = {
    beklemede: '#6b7280',
    devam_ediyor: '#3b82f6',
    tamamlandi: '#10b981',
    gecikti: '#f59e0b',
  }

  const stats = {
    toplam: jobs?.length ?? 0,
    beklemede: jobs?.filter(j => j.status === 'beklemede').length ?? 0,
    devam_ediyor: jobs?.filter(j => j.status === 'devam_ediyor').length ?? 0,
    tamamlandi: jobs?.filter(j => j.status === 'tamamlandi').length ?? 0,
    gecikti: jobs?.filter(j => j.status === 'gecikti').length ?? 0,
  }

  let jobsHtml = ''
  if (!jobs || jobs.length === 0) {
    jobsHtml = '<p style="text-align:center;color:#9ca3af;">Henüz hiçbir iş kaydı bulunmamaktadır.</p>'
  } else {
    ;(jobs as JobWithRelations[]).forEach((job, index) => {
      const progress = job.progress ?? 0
      const statusColor = statusColors[job.status] || '#6b7280'
      const description = job.description ? escapeHtml(job.description) : ''
      jobsHtml += `
        <div style="border:1px solid #e5e7eb;border-radius:8px;padding:15px;margin-bottom:15px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <strong style="font-size:16px;">İş #${index + 1}: ${escapeHtml(job.section)}</strong>
            <span style="background:${statusColor};color:white;padding:4px 12px;border-radius:12px;font-size:12px;">${statusLabels[job.status] || job.status}</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:14px;">
            <div><span style="color:#6b7280;">İş No:</span> ${escapeHtml(job.job_no)}</div>
            <div><span style="color:#6b7280;">Gemi:</span> ${escapeHtml(job.ships?.name || '-')}</div>
            <div><span style="color:#6b7280;">Sorumlu:</span> ${escapeHtml(job.profiles?.full_name || 'Atanmamış')}</div>
            <div><span style="color:#6b7280;">Tarih:</span> ${escapeHtml(job.start_date || '-')} → ${escapeHtml(job.end_date || '-')}</div>
            <div><span style="color:#6b7280;">İlerleme:</span> %${progress}</div>
            ${description ? `<div style="grid-column:span 2;"><span style="color:#6b7280;">Açıklama:</span> ${description}</div>` : ''}
          </div>
          <div style="background:#e5e7eb;height:8px;border-radius:4px;margin-top:10px;">
            <div style="background:${statusColor};height:100%;width:${progress}%;border-radius:4px;"></div>
          </div>
        </div>
      `
    })
  }

  const html = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="utf-8">
      <title>Waler Dry Dock - Tüm İşler Raporu</title>
      <style>
        @media print { body { margin: 20px; } }
      </style>
    </head>
    <body style="font-family:Arial,sans-serif;margin:40px;color:#333;">
      <div style="text-align:center;margin-bottom:30px;border-bottom:2px solid #1e40af;padding-bottom:20px;">
        <h1 style="color:#1e40af;margin:0;">⚓ WALER DRY DOCK</h1>
        <h2 style="color:#374151;margin:10px 0 0 0;">TÜM İŞLER RAPORU</h2>
        <p style="color:#6b7280;margin-top:10px;">Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}</p>
      </div>
      
      <div style="background:#f3f4f6;padding:20px;border-radius:8px;margin-bottom:30px;">
        <h3 style="margin:0 0 15px 0;color:#374151;">ÖZET İSTATİSTİKLER</h3>
        <div style="display:flex;gap:30px;flex-wrap:wrap;">
          <div><div style="font-size:12px;color:#6b7280;">Toplam İş</div><div style="font-size:28px;font-weight:bold;">${stats.toplam}</div></div>
          <div><div style="font-size:12px;color:#6b7280;">Beklemede</div><div style="font-size:28px;font-weight:bold;color:#6b7280;">${stats.beklemede}</div></div>
          <div><div style="font-size:12px;color:#6b7280;">Devam Ediyor</div><div style="font-size:28px;font-weight:bold;color:#3b82f6;">${stats.devam_ediyor}</div></div>
          <div><div style="font-size:12px;color:#6b7280;">Tamamlandı</div><div style="font-size:28px;font-weight:bold;color:#10b981;">${stats.tamamlandi}</div></div>
          <div><div style="font-size:12px;color:#6b7280;">Gecikti</div><div style="font-size:28px;font-weight:bold;color:#f59e0b;">${stats.gecikti}</div></div>
        </div>
      </div>

      <h3 style="color:#374151;border-bottom:1px solid #e5e7eb;padding-bottom:10px;">İŞ LİSTESİ</h3>
      ${jobsHtml}

      <div style="margin-top:40px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:20px;">
        Waler Dry Dock - Tersane Yönetim Sistemi · Otomatik oluşturulmuş rapordur.
      </div>
    </body>
    </html>
  `

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}