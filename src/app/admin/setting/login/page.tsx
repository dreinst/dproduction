"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, CheckSquare, Search } from "lucide-react";

const usersData = [
  { id: 1, username: "admin", alias: "administratror", level: "Superuser", active: true },
  { id: 2, username: "owner", alias: "Owner", level: "Superuser", active: true },
  { id: 3, username: "tester", alias: "tester", level: "Superuser", active: true },
];

export default function SettingLoginPage() {
  const [statusFilter, setStatusFilter] = useState("Aktif");
  const [showEntries, setShowEntries] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");

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
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white min-w-[180px]"
          >
            <option value="Aktif">Aktif</option>
            <option value="Semua">Semua</option>
          </select>
        </div>
      </div>

      {/* Add Button */}
      <button className="w-10 h-10 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors">
        <Plus className="w-5 h-5" />
      </button>

      {/* Entries & Search */}
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
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            {filteredUsers.map((user, idx) => (
              <tr
                key={user.id}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-slate-600">{idx + 1}.</td>
                <td className="px-4 py-3 text-sm text-slate-800 font-medium">
                  {user.username}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{user.alias}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{user.level}</td>
                <td className="px-4 py-3">
                  <CheckSquare className="w-5 h-5 text-green-500" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-blue-600">
          Showing 1 to {filteredUsers.length} of {filteredUsers.length} entries
        </p>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1 text-sm text-slate-400 hover:text-slate-600 transition-colors">
            Previous
          </button>
          <button className="w-8 h-8 bg-blue-600 text-white rounded text-sm font-medium">
            1
          </button>
          <button className="px-3 py-1 text-sm text-slate-400 hover:text-slate-600 transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
