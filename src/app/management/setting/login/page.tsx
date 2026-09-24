"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, CheckSquare, Search, Square } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { usePagination } from "@/hooks/usePagination";
import Modal from "@/components/management/Modal";
import Pagination, { PageSizeSelect } from "@/components/management/Pagination";
import { useAdminUser } from "@/components/management/AdminShell";
import { ROLES, ROLE_LABELS, isRole, type Role } from "@/lib/rbac";

interface User {
  id: number;
  username: string;
  alias: string | null;
  role: string;
  active: boolean;
}

type FormState = { username: string; password: string; alias: string; role: Role | ""; active: boolean };

const EMPTY_FORM: FormState = { username: "", password: "", alias: "", role: "staff", active: true };
const inputClass =
  "w-full px-4 py-2 border border-slate-300 rounded-lg text-base pointer-fine:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-100";

export default function SettingLoginPage() {
  const { user: me } = useAdminUser();
  const { data, loading, error, saveError, clearSaveError, createItem, updateItem, deleteItem } = useCrud<User>({
    endpoint: "/api/users",
  });
  const [statusFilter, setStatusFilter] = useState<"aktif" | "semua">("aktif");
  const [searchQuery, setSearchQuery] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [editing, setEditing] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const q = searchQuery.trim().toLowerCase();
  const filteredUsers = data.filter(
    (u) =>
      (statusFilter === "semua" || u.active) &&
      (!q || u.username.toLowerCase().includes(q) || (u.alias ?? "").toLowerCase().includes(q)),
  );
  const pagination = usePagination(filteredUsers, `${statusFilter}|${q}`);
  const editingSelf = editing?.id === me.id;

  const openForm = (user?: User) => {
    clearSaveError();
    setEditing(user ?? null);
    setForm(
      user
        ? {
            username: user.username,
            password: "",
            alias: user.alias ?? "",
            role: isRole(user.role) ? user.role : "",
            active: user.active,
          }
        : EMPTY_FORM,
    );
    setFormOpen(true);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const { password, ...rest } = form;
    const payload = { ...rest, alias: rest.alias.trim() || null, ...(password ? { password } : {}) };
    const created = { ...payload, password };
    const ok = editing ? await updateItem(editing.id, payload) : await createItem(created);
    setIsSubmitting(false);
    if (ok) setFormOpen(false);
  };

  const openDelete = (user: User) => {
    clearSaveError();
    setDeleteTarget(user);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    const ok = await deleteItem(deleteTarget.id);
    setIsSubmitting(false);
    if (ok) setDeleteTarget(null);
  };

  const errorBox = saveError && (
    <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
      {saveError}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Setting Login</h1>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <label htmlFor="user-status" className="block text-sm text-slate-600 mb-1">
            Status
          </label>
          <select
            id="user-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "aktif" | "semua")}
            className="px-4 py-2 border border-slate-300 rounded-lg text-base pointer-fine:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white min-w-[200px]"
          >
            <option value="aktif">Hanya yang aktif</option>
            <option value="semua">Semua</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => openForm()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden />
          Tambah User
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageSizeSelect pagination={pagination} />
        <div className="relative w-full sm:w-72">
          <label htmlFor="user-search" className="sr-only">
            Cari username atau nama lengkap
          </label>
          <input
            id="user-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari username atau nama lengkap"
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-base pointer-fine:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        {loading && !data.length ? (
          <div className="p-8 text-center text-slate-600">Memuat data user...</div>
        ) : error ? (
          <div role="alert" className="p-8 text-center text-red-600">
            {error}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800 text-white text-sm">
                <th className="px-3 sm:px-4 py-3 text-left font-semibold">Username</th>
                <th className="hidden sm:table-cell px-4 py-3 text-left font-semibold">Nama lengkap</th>
                <th className="px-3 sm:px-4 py-3 text-left font-semibold">Level</th>
                <th className="px-3 sm:px-4 py-3 text-center font-semibold">Aktif</th>
                <th className="px-3 sm:px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pagination.pageItems.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-3 sm:px-4 py-3 text-sm text-slate-800 font-medium">
                    <span className="break-all">{user.username}</span>
                    {user.id === me.id && (
                      <span className="ml-2 whitespace-nowrap text-xs font-normal text-slate-500">(Anda)</span>
                    )}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-slate-600">{user.alias}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm text-slate-600">
                    {isRole(user.role) ? ROLE_LABELS[user.role] : `${user.role} (tidak dikenal)`}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-center">
                    {user.active ? (
                      <CheckSquare className="w-5 h-5 text-green-600 mx-auto" aria-label="Aktif" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 mx-auto" aria-label="Nonaktif" />
                    )}
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openForm(user)}
                        className="p-1.5 text-yellow-700 hover:bg-yellow-50 rounded transition-colors"
                        aria-label={`Edit user ${user.username}`}
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" aria-hidden />
                      </button>
                      {user.id !== me.id && (
                        <button
                          type="button"
                          onClick={() => openDelete(user)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          aria-label={`Hapus user ${user.username}`}
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {pagination.pageItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-600 text-sm">
                    Tidak ada user yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Pagination pagination={pagination} />

      <Modal
        open={formOpen}
        title={editing ? "Edit User" : "Tambah User"}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSave}
        onInput={clearSaveError}
        busy={isSubmitting}
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
        {errorBox}
        <div className="space-y-4">
          <div>
            <label htmlFor="user-username" className="block text-sm font-medium text-slate-700 mb-1">
              Username
            </label>
            <input
              id="user-username"
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className={inputClass}
              disabled={isSubmitting}
              required
              minLength={3}
              maxLength={32}
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-describedby="user-username-hint"
            />
            <p id="user-username-hint" className="mt-1 text-xs text-slate-500">
              3 sampai 32 karakter: huruf kecil, angka, titik, garis bawah, atau strip, diawali huruf atau angka.
            </p>
          </div>

          <div>
            <label htmlFor="user-password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              id="user-password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={inputClass}
              disabled={isSubmitting}
              required={!editing}
              minLength={8}
              autoComplete="new-password"
              aria-describedby="user-password-hint"
            />
            <p id="user-password-hint" className="mt-1 text-xs text-slate-500">
              {editing
                ? "Kosongkan kalau tidak ingin mengganti. Password baru minimal 8 karakter dan memuat huruf dan angka, dan user ini akan keluar dari semua perangkat."
                : "Minimal 8 karakter dan memuat huruf dan angka."}
            </p>
          </div>

          <div>
            <label htmlFor="user-alias" className="block text-sm font-medium text-slate-700 mb-1">
              Nama lengkap
            </label>
            <input
              id="user-alias"
              type="text"
              value={form.alias}
              onChange={(e) => setForm({ ...form, alias: e.target.value })}
              className={inputClass}
              disabled={isSubmitting}
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="user-role" className="block text-sm font-medium text-slate-700 mb-1">
              Level
            </label>
            <select
              id="user-role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              className={`${inputClass} bg-white`}
              disabled={isSubmitting || editingSelf}
              required
              aria-describedby={editing && !isRole(editing.role) ? "user-role-hint" : undefined}
            >
              {form.role === "" && <option value="">Pilih level</option>}
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
            {editing && !isRole(editing.role) && (
              <p id="user-role-hint" className="mt-1 text-xs text-amber-700">
                Level lama &quot;{editing.role}&quot; tidak dikenal. Pilih level baru sebelum menyimpan.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              id="user-active"
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              disabled={isSubmitting || editingSelf}
              className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="user-active" className="text-sm font-medium text-slate-700">
              Akun aktif (bisa login)
            </label>
          </div>
          {editingSelf && (
            <p className="text-xs text-slate-500">
              Anda tidak bisa mengubah level atau menonaktifkan akun sendiri. Minta Pemilik atau Super Admin lain.
            </p>
          )}
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Hapus akun?"
        onClose={() => setDeleteTarget(null)}
        busy={isSubmitting}
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              {isSubmitting ? "Menghapus..." : "Hapus permanen"}
            </button>
          </>
        }
      >
        {errorBox}
        <p className="text-sm text-slate-700">
          Akun <span className="font-semibold text-slate-900">{deleteTarget?.username}</span> akan dihapus permanen dan
          langsung keluar dari semua perangkat. Akun yang sudah dihapus tidak bisa dikembalikan. Kalau hanya ingin
          memutus akses sementara, batalkan lalu nonaktifkan lewat tombol Edit.
        </p>
      </Modal>
    </div>
  );
}
