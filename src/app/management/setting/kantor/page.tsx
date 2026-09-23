"use client";

import { useState, type ReactNode } from "react";
import { Pencil, MapPin, Phone, Mail, Globe, Calendar, Building, type LucideIcon } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import Modal from "@/components/management/Modal";

interface KantorSetting {
  id: number;
  companyName: string | null;
  status: string | null;
  motto1: string | null;
  motto2: string | null;
  description: string | null;
  foundedDate: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  tiktokUrl: string | null;
  aboutUs: string | null;
  googleMapsUrl: string | null;
}

type Field = Exclude<keyof KantorSetting, "id">;
type FormState = Record<Field, string>;

const FIELDS: { key: Field; label: string; max: number; rows?: number; date?: boolean; inputMode?: "tel" | "email" | "url"; placeholder?: string }[] = [
  { key: "companyName", label: "Nama perusahaan", max: 200 },
  { key: "status", label: "Status", max: 200, placeholder: "Contoh: Your event partner" },
  { key: "motto1", label: "Motto baris 1 (teks gelap)", max: 200 },
  { key: "motto2", label: "Motto baris 2 (teks biru)", max: 200 },
  { key: "description", label: "Deskripsi motto", max: 1000, rows: 2 },
  { key: "foundedDate", label: "Tanggal berdiri", max: 10, date: true },
  { key: "phone", label: "Nomor telepon", max: 50, inputMode: "tel", placeholder: "081938938800" },
  { key: "email", label: "Email", max: 200, inputMode: "email", placeholder: "nama@gmail.com" },
  { key: "website", label: "Website", max: 2000, inputMode: "url", placeholder: "https://dpro.events" },
  { key: "facebookUrl", label: "URL Facebook", max: 2000, inputMode: "url", placeholder: "https://www.facebook.com/namahalaman" },
  { key: "instagramUrl", label: "URL Instagram", max: 2000, inputMode: "url", placeholder: "https://www.instagram.com/dpro.duction" },
  { key: "youtubeUrl", label: "URL YouTube", max: 2000, inputMode: "url", placeholder: "https://youtube.com/@dproductionzone" },
  { key: "tiktokUrl", label: "URL TikTok", max: 2000, inputMode: "url", placeholder: "https://www.tiktok.com/@namaakun" },
  { key: "googleMapsUrl", label: "URL embed Google Maps", max: 2000, inputMode: "url", placeholder: "https://www.google.com/maps/embed?pb=..." },
  { key: "address", label: "Alamat kantor", max: 500, rows: 2 },
  { key: "aboutUs", label: "Tentang kami", max: 5000, rows: 6 },
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const inputClass =
  "w-full px-4 py-2 border border-slate-300 rounded-lg text-base pointer-fine:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-100";

function isIsoDate(value: string) {
  const time = Date.parse(`${value}T00:00:00Z`);
  return ISO_DATE.test(value) && !isNaN(time) && new Date(time).toISOString().startsWith(value);
}

// Tanggal disimpan TTTT-BB-HH tanpa jam, jadi ditampilkan dalam UTC supaya tidak bergeser sehari di zona waktu lain.
function formatTanggal(value: string | null) {
  if (!value || !isIsoDate(value)) return value ?? "";
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("id-ID", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const empty = <span className="italic text-slate-500">Belum diisi</span>;

function link(value: string | null, href = value) {
  if (!value) return empty;
  if (!href) return value;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
      {value}
    </a>
  );
}

const webLink = (value: string | null) => link(value, value && /^https:\/\//i.test(value) ? value : null);

function Row({ icon: Icon, label, children }: { icon?: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-start sm:gap-4">
      <span className="flex shrink-0 items-center gap-2 text-sm font-medium text-slate-500 sm:w-40">
        {Icon && <Icon className="w-4 h-4" aria-hidden />}
        {label}
      </span>
      <span className="min-w-0 text-sm text-slate-700 break-words">{children}</span>
    </div>
  );
}

export default function SettingKantorPage() {
  const { data, loading, error, saveError, clearSaveError, updateItem } = useCrud<KantorSetting>({
    endpoint: "/api/kantor-settings",
  });
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const settings = data[0];
  const legacyDate = settings?.foundedDate && !isIsoDate(settings.foundedDate) ? settings.foundedDate : null;

  if (loading && !settings) return <div className="p-8 text-center text-slate-600">Memuat setting kantor...</div>;
  if (error) {
    return (
      <div role="alert" className="p-8 text-center text-red-600">
        {error}
      </div>
    );
  }
  if (!settings) return <div className="p-8 text-center text-slate-600">Data setting kantor tidak ditemukan.</div>;

  const openForm = () => {
    clearSaveError();
    setForm(
      Object.fromEntries(
        FIELDS.map(({ key }) => [key, key === "foundedDate" && legacyDate ? "" : (settings[key] ?? "")]),
      ) as FormState,
    );
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form) return;
    setIsSubmitting(true);
    const payload: Partial<Record<Field, string | null>> = Object.fromEntries(
      FIELDS.map(({ key }) => [key, form[key].trim() || null]),
    );
    // Tanggal lama yang tidak dikenali tidak dikirim ulang, jadi tetap tersimpan kalau field dibiarkan kosong.
    if (legacyDate && !payload.foundedDate) delete payload.foundedDate;
    const ok = await updateItem(settings.id, payload);
    setIsSubmitting(false);
    if (ok) setFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Setting Kantor</h1>
        <button
          type="button"
          onClick={openForm}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <Pencil className="w-4 h-4" aria-hidden />
          Edit Setting
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="font-bold text-slate-800 text-lg break-words">{settings.companyName || empty}</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        <Row label="Status">{settings.status || empty}</Row>
        <div className="px-6 py-4">
          <span className="text-slate-500 text-sm font-medium mb-2 block">Motto</span>
          {settings.motto1 || settings.motto2 ? (
            <>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 break-words">{settings.motto1}</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 break-words">{settings.motto2}</p>
            </>
          ) : (
            <p className="text-sm">{empty}</p>
          )}
          {settings.description && <p className="text-slate-600 mt-2 text-sm break-words">{settings.description}</p>}
        </div>
        <Row icon={Calendar} label="Tanggal berdiri">
          {formatTanggal(settings.foundedDate) || empty}
        </Row>
        <Row icon={Building} label="Alamat">
          {settings.address || empty}
        </Row>
        <Row icon={Phone} label="Telepon">
          {settings.phone || empty}
        </Row>
        <Row icon={Mail} label="Email">
          {link(settings.email, settings.email && EMAIL.test(settings.email) ? `mailto:${settings.email}` : null)}
        </Row>
        <Row icon={Globe} label="Website">
          {webLink(settings.website)}
        </Row>
        <Row icon={MapPin} label="Google Maps">
          {webLink(settings.googleMapsUrl)}
        </Row>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <h2 className="px-6 pt-5 font-bold text-slate-800">Media sosial</h2>
        <div className="divide-y divide-slate-100">
          <Row label="Facebook">{webLink(settings.facebookUrl)}</Row>
          <Row label="Instagram">{webLink(settings.instagramUrl)}</Row>
          <Row label="YouTube">{webLink(settings.youtubeUrl)}</Row>
          <Row label="TikTok">{webLink(settings.tiktokUrl)}</Row>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
        <h2 className="font-bold text-slate-800">Tentang kami</h2>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap break-words">
          {settings.aboutUs || empty}
        </p>
      </div>

      <Modal
        open={formOpen && !!form}
        title="Edit Setting Kantor"
        onClose={() => setFormOpen(false)}
        onSubmit={handleSave}
        busy={isSubmitting}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
          </>
        }
      >
        {saveError && (
          <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm whitespace-pre-line">
            {saveError}
          </div>
        )}
        <p className="mb-4 text-xs text-slate-500">
          Kosongkan yang belum ada. Semua link diisi alamat lengkap yang diawali https://.
        </p>
        {form && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FIELDS.map(({ key, label, max, rows, date, inputMode, placeholder }) => {
              const id = `kantor-${key}`;
              const props = {
                id,
                value: form[key],
                maxLength: max,
                placeholder,
                disabled: isSubmitting,
                className: inputClass,
                required: key === "companyName",
              };
              const onChange = (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value });
              return (
                <div key={key} className={rows ? "sm:col-span-2" : undefined}>
                  <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
                    {label}
                  </label>
                  {rows ? (
                    <textarea {...props} rows={rows} onChange={onChange} />
                  ) : (
                    <input
                      {...props}
                      type={date ? "date" : "text"}
                      inputMode={inputMode}
                      onChange={onChange}
                      aria-describedby={date && legacyDate ? `${id}-hint` : undefined}
                    />
                  )}
                  {date && legacyDate && (
                    <p id={`${id}-hint`} className="mt-1 text-xs text-amber-800">
                      Tanggal tersimpan &quot;{legacyDate}&quot; tidak dikenali. Pilih tanggal baru, atau biarkan kosong
                      supaya tanggal lama tetap tersimpan.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
}
