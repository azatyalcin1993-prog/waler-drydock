import type { DryDockJob, PersonnelJob } from "./types";

export const gemiAdi = "MV Waler Star";
export const tersaneAdi = "İstanbul Tersanesi — Dry Dock 3";

export const inspectorJobs: DryDockJob[] = [
  {
    id: "1",
    isNo: "DD-2026-001",
    gemi: "MV Waler Star",
    bolum: "Gövde — Port Yan",
    aciklama: "Kaynak dikişi kontrolü ve boya hazırlığı",
    durum: "devam_ediyor",
    sorumlu: "Ahmet Yılmaz",
    baslangicTarihi: "2026-05-28",
    bitisTarihi: "2026-06-12",
    ilerleme: 65,
  },
  {
    id: "2",
    isNo: "DD-2026-002",
    gemi: "MV Waler Star",
    bolum: "Pervane & Şaft",
    aciklama: "Pervane sökümü ve ultrasonik muayene",
    durum: "beklemede",
    sorumlu: "Mehmet Kaya",
    baslangicTarihi: "2026-06-10",
    bitisTarihi: "2026-06-18",
    ilerleme: 0,
  },
  {
    id: "3",
    isNo: "DD-2026-003",
    gemi: "MV Waler Star",
    bolum: "Ana Makine",
    aciklama: "Silindir kapak contası değişimi",
    durum: "tamamlandi",
    sorumlu: "Ali Demir",
    baslangicTarihi: "2026-05-20",
    bitisTarihi: "2026-06-05",
    ilerleme: 100,
  },
  {
    id: "4",
    isNo: "DD-2026-004",
    gemi: "MV Waler Star",
    bolum: "Güverte — Kargo Hold",
    aciklama: "Çelik plaka değişimi ve kaynak onarımı",
    durum: "gecikti",
    sorumlu: "Fatma Öztürk",
    baslangicTarihi: "2026-05-15",
    bitisTarihi: "2026-06-01",
    ilerleme: 78,
  },
  {
    id: "5",
    isNo: "DD-2026-005",
    gemi: "MV Waler Star",
    bolum: "Elektrik — Jeneratör",
    aciklama: "Yardımcı jeneratör bakımı ve test",
    durum: "devam_ediyor",
    sorumlu: "Can Arslan",
    baslangicTarihi: "2026-06-01",
    bitisTarihi: "2026-06-15",
    ilerleme: 42,
  },
];

export const personnelJobs: PersonnelJob[] = [
  {
    id: "1",
    baslik: "Gövde kaynak dikişi kontrolü",
    konum: "Gövde — Port Yan / Blok A",
    durum: "devam_ediyor",
    sonGuncelleme: "09.06.2026 14:30",
    logSayisi: 4,
    fotoSayisi: 2,
  },
  {
    id: "2",
    baslik: "Pervane söküm hazırlığı",
    konum: "Kıç Bölüm / Dry Dock",
    durum: "beklemede",
    sonGuncelleme: "08.06.2026 09:15",
    logSayisi: 1,
    fotoSayisi: 0,
  },
  {
    id: "3",
    baslik: "Çelik plaka kaynak onarımı",
    konum: "Güverte — Kargo Hold No.3",
    durum: "gecikti",
    sonGuncelleme: "09.06.2026 11:00",
    logSayisi: 6,
    fotoSayisi: 5,
  },
  {
    id: "4",
    baslik: "Jeneratör yağ filtresi değişimi",
    konum: "Makine Dairesi / Jeneratör 2",
    durum: "devam_ediyor",
    sonGuncelleme: "09.06.2026 16:45",
    logSayisi: 2,
    fotoSayisi: 1,
  },
];

export const statusLabels: Record<string, string> = {
  beklemede: "Beklemede",
  devam_ediyor: "Devam Ediyor",
  tamamlandi: "Tamamlandı",
  gecikti: "Gecikti",
};

export const statusColors: Record<string, string> = {
  beklemede: "bg-slate-100 text-slate-700 ring-slate-200",
  devam_ediyor: "bg-blue-50 text-blue-700 ring-blue-200",
  tamamlandi: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  gecikti: "bg-amber-50 text-amber-700 ring-amber-200",
};
