"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, CheckSquare, Search, Square, X } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";

interface User {
  id: number;
  username: string;
  alias: string;
  role: string;
  active: boolean;
}

export default function SettingLoginPage() {
  const { data: usersData, loading, error, createItem, updateItem, deleteItem } = useCrud<User>({ endpoint: '/api/users' });
  const [statusFilter, setStatusFilter] = useState("Aktif");
  const [showEntries, setShowEntries] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentEditing, setCurrentEditing] = useState<User | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "", // Handled separately as it's only required on create/change
    alias: "",
    role: "Superuser",
    active: true,
  });

  const safeData = usersData || [];

  const filteredUsers = safeData.filter((u) => {
    if (statusFilter === "Aktif" && !u.active) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (u.username || "").toLowerCase().includes(q) ||
        (u.alias || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredUsers.length / showEntries) || 1;
  const paginatedUsers = filteredUsers.slice((page - 1) * showEntries, page * showEntries);

  const handleOpenModal = (user?: User) => {
    setFormError("");
    if (user) {
      setCurrentEditing(user);
      setFormData({
        username: user.username,
        password: "", // clear password field
        alias: user.alias || "",
        role: user.role,
        active: user.active ?? true,
      });
    } else {
      setCurrentEditing(null);
      setFormData({ username: "", password: "", alias: "", role: "admin", active: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.username) {
       setFormError("Username wajib diisi");
       return;
    }
    if (!currentEditing && (!formData.password || formData.password.length < 6)) {
       setFormError("Password wajib diisi saat membuat user baru (min 6 karakter)");
       return;
    }

    setIsSubmitting(true);
    setFormError("");

    let success = false;
    if (currentEditing) {
      const payload: any = { ...formData };
      if (!payload.password) {
        delete payload.password;
      }
      success = await updateItem(currentEditing.id, payload);
    } else {
      success = await createItem(formData);
    }

    setIsSubmitting(false);

    if (success) {
      setIsModalOpen(false);
    } else {
      setFormError("Gagal menyimpan data (mungkin username sudah terpakai).");
    }
  };

  const handleDeleteClick = (user: User) => {
    setCurrentEditing(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (currentEditing) {
      setIsSubmitting(true);
      const success = await deleteItem(currentEditing.id);
      setIsSubmitting(false);
      
      if (success) {
        setIsDeleteModalOpen(false);
        setCurrentEditing(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">LOGIN</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-sm text-slate-500 mb-1">Status Aktif</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white min-w-[200px]"
          >
            <option>Aktif</option>
            <option>Semua</option>
          </select>
        </div>
      </div>

      <button onClick={() => handleOpenModal()} className="w-10 h-10 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors mt-6">
         <Plus className="w-5 h-5" />
      </button>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Show</span>
          <input
            type="number"
            value={showEntries}
            onChange={(e) => setShowEntries(Number(e.target.value))}
            className="w-16 px-2 py-1.5 border border-slate-200 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <span>entries</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Search:</span>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        {loading ? (
           <div className="p-8 text-center text-slate-500">Loading users...</div>
        ) : error ? (
           <div className="p-8 text-center text-red-500">Error: {error}</div>
        ) : (
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-slate-800 text-white text-sm">
              <th className="px-4 py-3 text-left font-semibold w-16">No.</th>
              <th className="px-4 py-3 text-left font-semibold">User Name</th>
              <th className="px-4 py-3 text-left font-semibold">Alias User</th>
              <th className="px-4 py-3 text-left font-semibold w-32">Level</th>
              <th className="px-4 py-3 text-center font-semibold w-24">Aktif</th>
              <th className="px-4 py-3 text-center font-semibold w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user, idx) => (
              <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-sm text-slate-600">{(page - 1) * showEntries + idx + 1}.</td>
                <td className="px-4 py-3 text-sm text-slate-800 font-medium">{user.username}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{user.alias}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{user.role}</td>
                <td className="px-4 py-3 text-center">
                  {user.active ? (
                    <CheckSquare className="w-5 h-5 text-green-500 mx-auto" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-300 mx-auto" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => handleOpenModal(user)}
                      className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(user)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-sm">
                  Tidak ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-blue-600">
          Showing {filteredUsers.length > 0 ? (page - 1) * showEntries + 1 : 0} to{" "}
          {Math.min(page * showEntries, filteredUsers.length)} of {filteredUsers.length} entries
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                page === i + 1 ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">
                {currentEditing ? "Edit User" : "Tambah User"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formError && <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm">{formError}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">User Name</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password {currentEditing && "(Kosongkan jika tidak ingin mengubah)"}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="******"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alias User</label>
                <input
                  type="text"
                  value={formData.alias}
                  onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                  disabled={isSubmitting}
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="Superuser">Superuser</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status Aktif</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    disabled={isSubmitting}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm shadow-blue-600/20 transition-colors"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Hapus User?</h2>
              <p className="text-sm text-slate-600 mb-6">
                Apakah Anda yakin ingin menghapus user <span className="font-semibold text-slate-800">{currentEditing?.username}</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm shadow-red-600/20 transition-colors"
                >
                  {isSubmitting ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
