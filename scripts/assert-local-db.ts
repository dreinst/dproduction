export function assertLocalDatabase() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL belum diisi. Isi di .env.local (contoh di .env.example).')

  const host = new URL(url).hostname
  if (!['localhost', '127.0.0.1'].includes(host) && process.env.ALLOW_REMOTE_SEED !== '1') {
    throw new Error(
      `Seed ditolak: host database "${host}" bukan localhost atau 127.0.0.1. ` +
        'Kalau memang sengaja mengisi database jarak jauh, jalankan ulang dengan ALLOW_REMOTE_SEED=1.',
    )
  }
}
