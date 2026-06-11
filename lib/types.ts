export type JobStatus = "beklemede" | "devam_ediyor" | "tamamlandi" | "gecikti";

export type UserRole = "personnel" | "inspector";

export interface DryDockJob {
  id: string;
  isNo: string;
  gemi: string;
  bolum: string;
  aciklama: string;
  durum: JobStatus;
  sorumlu: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  ilerleme: number;
}

export interface PersonnelJob {
  id: string;
  baslik: string;
  konum: string;
  durum: JobStatus;
  sonGuncelleme: string;
  logSayisi: number;
  fotoSayisi: number;
}
