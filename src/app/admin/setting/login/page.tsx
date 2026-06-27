"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, CheckSquare, Search, Square, X } from "lucide-react";

interface User {
  id: number;
  username: string;
  alias: string;
  level: string;
  active: boolean;
}

const initialUsers: User[] = [
  { id: 1, username: "admin", alias: "Administrator", level: "Superuser", active: true },
  { id: 2, username: "owner", alias: "Owner", level: "Superuser", active: true },
  { id: 3, username: "tester", alias: "tester", level: "Superuser", active: true },
];

export default function SettingLoginPage() {
  const [usersData, setUsersData] = useState<User[]>(initialUsers);
  const [statusFilter, setStatusFilter] = useState("Aktif");
  const [showEntries, setShowEntries] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentEditing, setCurrentEditing] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    alias: "",
    level: "Superuser",
    active: true,
  });

  const filteredUsers = usersData.filter((u) => {
    if (statusFilter === "Aktif" && !u.active) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        u.username.toLowerCase().includes(q) ||
        u.alias.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredUsers.length / showEntries) || 1;
  const paginatedUsers = filteredUsers.slice((page - 1) * showEntries, page * showEntries);

  const handleOpenModal = (user?: User) => {
    if (user) {
      setCurrentEditing(user);
      setFormData({
        username: user.username,
        alias: user.alias,
        level: user.level,
        active: user.active,
      });
    } else {
      setCurrentEditing(null);
      setFormData({ username: "", alias: "", level: "Superuser", active: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (currentEditing) {
      setUsersData((prev) =>
        prev.map((u) => (u.id === currentEditing.id ? { ...u, ...formData } : u))
      );
    } else {
      setUsersData((prev) => [...prev, { id: Date.now(), ...formData }]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = (user: User) => {
    setCurrentEditing(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (currentEditing) {
      setUsersData((prev) => prev.filter((u) => u.id !== currentEditing.id));
    }
    setIsDeleteModalOpen(false);
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
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white min-w-[180px]"
          >
            <option value="Aktif">Aktif</option>
            <option value="Semua">Semua</option>
          </select>
        </div>
      </div>

      {/* Add Button */}
      <button 
        onClick={() => handleOpenModal()}
        className="w-10 h-10 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
      >
        <Plus className="w-5 h-5" />
      </button>

      {/* Entries & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Show</span>
          <input
            type="number"
            value={showEntries}
            onChange={(e) => {
              setShowEntries(Number(e.target.value) || 1);
              setPage(1);
            }}
            className="w-16 px-2 py-1.5 border border-slate-200 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <span>entries</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Search:</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800 text-white text-sm">
              <th className="px-4 py-3 text-left font-semibold w-12">No</th>
              <th className="px-4 py-3 text-left font-semibold">Username</th>
              <th className="px-4 py-3 text-left font-semibold">Alias</th>
              <th className="px-4 py-3 text-left font-semibold">Level</th>
              <th className="px-4 py-3 text-left font-semibold">Aktif</th>
              <th className="px-4 py-3 text-center font-semibold w-24"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user, idx) => (
              <tr
                key={user.id}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-slate-600">
                  {(page - 1) * showEntries + idx + 1}.
                </td>
                <td className="px-4 py-3 text-sm text-slate-800 font-medium">
                  {user.username}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{user.alias}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{user.level}</td>
                <td className="px-4 py-3">
                  {user.active ? (
                    <CheckSquare className="w-5 h-5 text-green-500" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-300" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => handleOpenModal(user)}
                      className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(user)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
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
                  Tidak ada data yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-blue-600">
          Showing {paginatedUsers.length > 0 ? (page - 1) * showEntries + 1 : 0} to{" "}
          {Math.min(page * showEntries, filteredUsers.length)} of {filteredUsers.length} entries
        </p>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
          >
            Previous
          </button>
          <button className="w-8 h-8 bg-blue-600 text-white rounded text-sm font-medium">
            {page}
          </button>
          <button 
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="px-3 py-1 text-sm text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">
                {currentEditing ? "Edit User" : "Tambah User"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Alias</label>
                <input
                  type="text"
                  value={formData.alias}
                  onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                >
                  <option value="Superuser">Superuser</option>
                  <option value="Admin">Admin</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600">Aktif</span>
              </label>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus User?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Apakah Anda yakin ingin menghapus user <strong>{currentEditing?.username}</strong>?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
