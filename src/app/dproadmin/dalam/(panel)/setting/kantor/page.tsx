"use client";

import { useState, type ReactNode } from "react";
import { Pencil, MapPin, Phone, Mail, Globe, Calendar, Building, MessageCircle, type LucideIcon } from "lucide-react";
import { jsonInit, useCrud } from "@/hooks/useCrud";
import Modal from "@/components/management/Modal";

interface KantorSetting {
  id: number;
  companyName: string | null;
  status: string | null;
  motto1: string | null;
  motto2: string | null;
  description: string | null;
  foundedYear: number | null;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  tiktokUrl: string | null;
  aboutUs: string | null;
  googleMapsUrl: string | null;
  statClients: number | null;
  statEvents: number | null;
  statRentalCategories: number | null;
  statMembers: number | null;
  statYears: number | null;
}

type Field = Exclude<keyof KantorSetting, "id">;
type FormState = Record<Field, string>;
type FieldDef = {
  key: Field;
  label: string;
  max: number;
  rows?: number;
  numeric?: boolean;
  inputMode?: "tel" | "email" | "url";
  placeholder?: string;
  hint?: string;
  // Memakai bantuan milik kelompok (ditampilkan sekali di bawah judul kelompok).
  groupHint?: boolean;
};
type Group = { id: string; title: string; hint?: string; fields: FieldDef[] };

const url = (key: Field, label: string, placeholder: string, extra?: Partial<FieldDef>): FieldDef => ({
  key,
  label,
  max: 2000,
  inputMode: "url",
  placeholder,
  ...extra,
});
const stat = (key: Field, label: string): FieldDef => ({ key, label, max: 7, numeric: true, groupHint: true });

const GROUPS: Group[] = [
  {
    id: "identitas",
    title: "Identitas",
    fields: [
      { key: "companyName", label: "Nama perusahaan", max: 200 },
      { key: "foundedYear", label: "Tahun berdiri", max: 4, numeric: true, placeholder: "2016" },
      { key: "status", label: "Status", max: 200, placeholder: "Contoh: Your event partner" },
      { key: "motto1", label: "Motto baris 1 (teks gelap)", max: 200 },
      { key: "motto2", label: "Motto baris 2 (teks biru)", max: 200 },
    ],
  },
  {
    id: "teks",
    title: "Teks website",
    fields: [
      { key: "description", label: "Teks pembuka Hero", max: 1000, rows: 2 },
      { key: "aboutUs", label: "Tentang Kami", max: 5000, rows: 6, hint: "Pisahkan paragraf dengan satu baris kosong." },
    ],
  },
  {
    id: "kontak",
    title: "Kontak",
    fields: [
      { key: "address", label: "Alamat kantor", max: 500, rows: 2 },
      {
        key: "whatsapp",
        label: "Nomor WhatsApp",
        max: 30,
        inputMode: "tel",
        placeholder: "081938938800",
        hint: "Dipakai semua tombol WhatsApp di website, contoh 081938938800.",
      },
      { key: "phone", label: "Nomor telepon", max: 50, inputMode: "tel", placeholder: "081938938800" },
      { key: "email", label: "Email", max: 200, inputMode: "email", placeholder: "nama@gmail.com" },
      url("website", "Website", "https://www.dpro.events"),
    ],
  },
  {
    id: "sosial",
    title: "Media sosial dan peta",
    hint: "Kosongkan kalau tidak punya akun; ikon tidak tampil.",
    fields: [
      url("instagramUrl", "URL Instagram", "https://www.instagram.com/dpro.duction", { groupHint: true }),
      url("youtubeUrl", "URL YouTube", "https://youtube.com/@dproductionzone", { groupHint: true }),
      url("facebookUrl", "URL Facebook", "https://www.facebook.com/namahalaman", { groupHint: true }),
      url("tiktokUrl", "URL TikTok", "https://www.tiktok.com/@namaakun", { groupHint: true }),
      url("googleMapsUrl", "Link embed Google Maps", "https://www.google.com/maps/embed?pb=...", {
        rows: 2,
        hint: "Di Google Maps pilih Bagikan, lalu Sematkan peta, lalu salin alamat di dalam src. Alamatnya diawali https://www.google.com/maps/embed.",
      }),
    ],
  },
  {
    id: "statistik",
    title: "Statistik hero",
    hint: "Kosongkan untuk memakai angka bawaan website.",
    fields: [
      stat("statClients", "Klien"),
      stat("statEvents", "Event"),
      stat("statRentalCategories", "Kategori Rental"),
      stat("statMembers", "Member"),
      stat("statYears", "Tahun Pengalaman"),
    ],
  },
];

const FIELDS = GROUPS.flatMap((group) => group.fields);
const STATS = GROUPS.find((group) => group.id === "statistik")!.fields;

const SAVE_FAILED = "Gagal menyimpan perubahan. Coba lagi.";
const OFFLINE = "Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const inputClass =
  "w-full px-4 py-2 border border-slate-300 rounded-lg text-base pointer-fine:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100 aria-[invalid=true]:border-red-500";

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

// Angka dikirim sebagai number; isian yang bukan angka bulat dikirim apa adanya supaya server membalas pesan yang jelas.
function toPayload(form: FormState) {
  return Object.fromEntries(
    FIELDS.map(({ key, numeric }) => {
      const value = form[key].trim();
      return [key, !value ? null : numeric && /^\d+$/.test(value) ? Number(value) : value];
    }),
  );
}

export default function SettingKantorPage() {
  const { data, loading, error, fetchAll } = useCrud<KantorSetting>({ endpoint: "/api/kantor-settings" });
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const settings = data[0];

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
    setFormError(null);
    setFieldErrors({});
    setForm(Object.fromEntries(FIELDS.map(({ key }) => [key, String(settings[key] ?? "")])) as FormState);
    setFormOpen(true);
  };

  // Tidak lewat updateItem karena pesan per isian ada di issues respons 400, sedangkan updateItem hanya menyimpan
  // pesan gabungannya.
  const handleSave = async () => {
    if (!form) return;
    setIsSubmitting(true);
    const res = await fetch(`/api/kantor-settings/${settings.id}`, jsonInit("PUT", toPayload(form))).catch(() => null);
    const body = (await res?.json().catch(() => null)) as {
      message?: unknown;
      issues?: { path?: unknown[]; message?: unknown }[];
    } | null;
    setIsSubmitting(false);
    // fetchAll memakai request() bersama, yang mengalihkan ke halaman login kalau sesi sudah berakhir (401).
    if (res?.ok || res?.status === 401) {
      if (res.ok) setFormOpen(false);
      return fetchAll();
    }
    const errors: Partial<Record<Field, string>> = {};
    for (const issue of body?.issues ?? []) {
      const key = issue.path?.[0];
      if (typeof key === "string" && key in form && typeof issue.message === "string") {
        errors[key as Field] ??= issue.message;
      }
    }
    setFieldErrors(errors);
    setFormError(!res ? OFFLINE : typeof body?.message === "string" && body.message ? body.message : SAVE_FAILED);
  };

  const renderField = (group: Group, { key, label, max, rows, numeric, inputMode, placeholder, hint, groupHint }: FieldDef) => {
    const id = `kantor-${key}`;
    const fieldError = fieldErrors[key];
    const describedBy = [
      groupHint && `kantor-${group.id}-hint`,
      hint && `${id}-hint`,
      fieldError && `${id}-error`,
    ].filter(Boolean);
    const props = {
      id,
      value: form?.[key] ?? "",
      maxLength: max,
      placeholder,
      disabled: isSubmitting,
      className: inputClass,
      required: key === "companyName",
      "aria-invalid": fieldError ? true : undefined,
      "aria-describedby": describedBy.length ? describedBy.join(" ") : undefined,
      onChange: (e: { target: { value: string } }) => form && setForm({ ...form, [key]: e.target.value }),
    };
    return (
      <div key={key} className={rows ? "sm:col-span-2" : undefined}>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
        {rows ? (
          <textarea {...props} rows={rows} />
        ) : (
          <input {...props} type="text" inputMode={numeric ? "numeric" : inputMode} />
        )}
        {hint && (
          <p id={`${id}-hint`} className="mt-1 text-xs text-slate-600">
            {hint}
          </p>
        )}
        {fieldError && (
          <p id={`${id}-error`} className="mt-1 text-xs font-medium text-red-700">
            {fieldError}
          </p>
        )}
      </div>
    );
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
        </div>
        <Row label="Teks pembuka Hero">{settings.description || empty}</Row>
        <Row icon={Calendar} label="Tahun berdiri">
          {settings.foundedYear ?? empty}
        </Row>
        <Row icon={Building} label="Alamat">
          {settings.address || empty}
        </Row>
        <Row icon={MessageCircle} label="WhatsApp">
          {settings.whatsapp || empty}
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

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <h2 className="px-6 pt-5 font-bold text-slate-800">Statistik hero</h2>
        <div className="divide-y divide-slate-100">
          {STATS.map(({ key, label }) => (
            <Row key={key} label={label}>
              {settings[key] ?? <span className="italic text-slate-500">Angka bawaan website</span>}
            </Row>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
        <h2 className="font-bold text-slate-800">Tentang Kami</h2>
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
        {formError && (
          <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm whitespace-pre-line">
            {formError}
          </div>
        )}
        <p className="mb-4 text-xs text-slate-600">
          Kosongkan yang belum ada. Semua link diisi alamat lengkap yang diawali https://.
        </p>
        <div className="space-y-6">
          {GROUPS.map((group) => (
            <fieldset key={group.id}>
              <legend className="text-base font-semibold text-slate-800">{group.title}</legend>
              {group.hint && (
                <p id={`kantor-${group.id}-hint`} className="mt-1 text-xs text-slate-600">
                  {group.hint}
                </p>
              )}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {group.fields.map((field) => renderField(group, field))}
              </div>
            </fieldset>
          ))}
        </div>
      </Modal>
    </div>
  );
}
