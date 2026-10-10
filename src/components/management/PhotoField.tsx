"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RequestError, useApiRequest } from "@/hooks/useCrud";

// Foto di form: alamat yang sudah tersimpan, berkas yang baru dipilih dan belum diunggah, atau kosong.
type Photo = string | File | null;
type State = { value: Photo; preview: string | null; error: string | null };

const TYPES = ["image/jpeg", "image/png", "image/webp"];
// Sama dengan MAX_IMAGE_BYTES di src/lib/upload.ts. Berkas itu khusus server, jadi angkanya ditulis ulang di sini.
const MAX_BYTES = 5 * 1024 * 1024;
const UPLOAD_FAILED = "Gambar gagal diunggah. Coba simpan lagi.";

// State foto untuk satu form. Dipegang halaman, bukan PhotoField, supaya pilihan tidak hilang saat drawer ditutup
// sementara (konfirmasi hapus). Berkas yang dipilih baru diunggah saat upload() dipanggil di waktu Simpan. Sebelum itu
// tidak ada yang sampai ke server, jadi mengganti foto, menghapusnya, atau membatalkan form tidak meninggalkan berkas
// di folder unggahan.
export function usePhotoField() {
  const request = useApiRequest();
  const [state, setState] = useState<State>({ value: null, preview: null, error: null });
  // Alamat blob pratinjau yang sedang dipakai. Dilepas begitu fotonya berganti atau halaman ditutup.
  const blob = useRef<string | null>(null);
  // Naik tiap foto berganti, supaya berkas yang masih dibuka untuk form sebelumnya tidak masuk ke form berikutnya.
  const turn = useRef(0);

  const put = useCallback((value: Photo, preview: string | null) => {
    turn.current++;
    if (blob.current) URL.revokeObjectURL(blob.current);
    blob.current = value instanceof File ? preview : null;
    setState({ value, preview, error: null });
  }, []);

  useEffect(
    () => () => {
      if (blob.current) URL.revokeObjectURL(blob.current);
    },
    [],
  );

  // Dipanggil halaman saat form dibuka (alamat foto baris yang diedit, atau null), dan PhotoField saat foto dihapus.
  const set = useCallback((url: string | null) => put(url || null, url || null), [put]);

  // Dipanggil PhotoField saat berkas dipilih atau dilepas. Berkas yang ditolak tidak menggeser foto yang sedang dipakai.
  const choose = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      const reject = (error: string) => setState((current) => ({ ...current, error }));
      if (!TYPES.includes(file.type)) {
        return reject("Format berkas ini belum bisa dipakai. Pilih gambar JPG, PNG, atau WebP.");
      }
      if (file.size > MAX_BYTES) {
        const size = (file.size / 1024 / 1024).toFixed(1).replace(".", ",");
        return reject(`Ukuran berkas ini ${size} MB, sedangkan batasnya 5 MB. Kecilkan dulu gambarnya, lalu pilih lagi.`);
      }
      // Dicoba dibuka dulu, supaya berkas bukan gambar yang hanya berekstensi gambar ditolak sekarang, bukan saat Simpan.
      const mine = ++turn.current;
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => (mine === turn.current ? put(file, url) : URL.revokeObjectURL(url));
      image.onerror = () => {
        URL.revokeObjectURL(url);
        if (mine === turn.current) reject("Berkas ini tidak terbaca sebagai gambar. Pilih gambar JPG, PNG, atau WebP yang lain.");
      };
      image.src = url;
    },
    [put],
  );

  // Dipanggil halaman saat Simpan. Hasilnya alamat foto untuk dikirim bersama isian lain (null kalau tanpa foto), atau
  // false kalau unggahan gagal (pesannya tampil di PhotoField).
  const upload = async (): Promise<string | null | false> => {
    const { value } = state;
    if (!(value instanceof File)) return value;
    setState((current) => ({ ...current, error: null }));
    const body = new FormData();
    body.append("file", value);
    try {
      const result = (await request("/api/uploads", UPLOAD_FAILED, { method: "POST", body })) as { url?: unknown } | null;
      if (typeof result?.url !== "string") throw new RequestError(UPLOAD_FAILED);
      // Alamatnya menggantikan berkas di state. Kalau isian lain lalu ditolak server, Simpan berikutnya tidak mengunggah lagi.
      put(result.url, result.url);
      return result.url;
    } catch (err) {
      const error = err instanceof RequestError ? err.message : UPLOAD_FAILED;
      setState((current) => ({ ...current, error }));
      return false;
    }
  };

  return { ...state, set, choose, upload };
}

type Props = {
  id: string;
  label: string;
  // Hasil usePhotoField() milik form ini.
  photo: ReturnType<typeof usePhotoField>;
  disabled?: boolean;
  // Untuk logo: gambar tampil utuh tanpa dipotong, dan kata "foto" di tombol menjadi "logo".
  logo?: boolean;
  hint?: string;
};

// Area unggah foto untuk drawer: area seret dan tombol pilih selama kosong, pratinjau dengan tombol ganti dan hapus
// sesudah terisi.
export default function PhotoField({ id, label, photo, disabled = false, logo = false, hint }: Props) {
  const { value, preview, error, set, choose } = photo;
  const fileInput = useRef<HTMLInputElement>(null);
  const mainButton = useRef<HTMLButtonElement>(null);
  const [over, setOver] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const noun = logo ? "logo" : "foto";
  const filled = !!value;

  // Berkas yang dilepas di luar area ini dibuka peramban dan isian form hilang, jadi selama area ini tampil perilaku
  // bawaan itu dimatikan. Area ini sendiri baru bisa menerima berkas kalau dragover dicegah.
  useEffect(() => {
    const stop = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes("Files")) e.preventDefault();
    };
    window.addEventListener("dragover", stop);
    window.addEventListener("drop", stop);
    return () => {
      window.removeEventListener("dragover", stop);
      window.removeEventListener("drop", stop);
    };
  }, []);

  // Tombol yang sedang difokus ikut hilang saat foto dipilih atau dihapus. Fokus dipindah ke tombol penggantinya supaya
  // pengguna papan ketik tidak terlempar ke awal dialog.
  useEffect(() => {
    if (document.activeElement === document.body) mainButton.current?.focus();
  }, [filled]);

  const pick = () => fileInput.current?.click();

  return (
    <div
      role="group"
      aria-labelledby={`${id}-label`}
      className={`relative flex flex-col ${filled ? "gap-2.5" : "gap-2"}`}
      onDragOver={(e) => {
        if (!disabled && e.dataTransfer.types.includes("Files")) setOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
      }}
      onDrop={(e) => {
        setOver(false);
        if (!disabled) choose(e.dataTransfer.files[0]);
      }}
    >
      <span id={`${id}-label`} className="adm-label">
        {label}
      </span>
      {filled ? (
        <>
          {failed === preview ? (
            <p className="adm-photo flex items-center justify-center px-4 text-center text-[13px]" data-over={over}>
              Gambar ini tidak bisa ditampilkan.
            </p>
          ) : (
            // Pratinjau bisa berupa alamat blob, jadi tidak lewat pengoptimal gambar Next.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview ?? undefined}
              alt={`Pratinjau ${label.toLowerCase()}`}
              data-over={over}
              onError={() => setFailed(preview)}
              className={logo ? "adm-photo adm-photo--contain" : "adm-photo"}
            />
          )}
          <div className="flex flex-wrap items-center gap-2">
            <button ref={mainButton} type="button" onClick={pick} disabled={disabled} className="adm-btn adm-btn--sm adm-btn--primary">
              {`Unggah ${noun} baru`}
            </button>
            <button type="button" onClick={() => set(null)} disabled={disabled} className="adm-btn adm-btn--sm adm-btn--outline">
              {`Hapus ${noun}`}
            </button>
            <span className="adm-photo__note">JPG, PNG, atau WebP</span>
          </div>
        </>
      ) : (
        <div className="adm-drop" data-over={over}>
          <span className="adm-drop__title">{`Seret ${noun} ke sini`}</span>
          <span id={`${id}-hint`} className="adm-drop__hint">
            {hint ?? (logo ? "JPG, PNG, atau WebP. Latar putih atau bening paling pas." : "JPG, PNG, atau WebP. Foto mendatar paling pas.")}
          </span>
          <button
            ref={mainButton}
            type="button"
            onClick={pick}
            disabled={disabled}
            aria-describedby={`${id}-hint`}
            className="adm-btn adm-btn--sm adm-btn--primary"
          >
            {`Pilih ${noun}`}
          </button>
        </div>
      )}
      {/* Ditaruh sesudah tombol: Modal memfokuskan isian pertama di isi dialog, dan input tersembunyi tidak bisa difokus. */}
      <input
        ref={fileInput}
        type="file"
        accept={TYPES.join(",")}
        hidden
        onChange={(e) => {
          choose(e.target.files?.[0]);
          // Dikosongkan supaya berkas yang sama bisa dipilih lagi setelah ditolak atau dihapus.
          e.target.value = "";
        }}
      />
      <span role="status" className="sr-only">
        {value instanceof File ? `${value.name} dipilih. Gambar diunggah saat Anda menyimpan.` : ""}
      </span>
      {error && (
        <p role="alert" className="adm-alert">
          {error}
        </p>
      )}
    </div>
  );
}
