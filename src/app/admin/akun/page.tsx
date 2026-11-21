"use client";

import { useState, useEffect, FormEvent } from "react";
import { Plus, Pencil, Trash2, Check, ShieldAlert } from "lucide-react";
import {
  PageTitle,
  Card,
  Button,
  Badge,
  Field,
  Modal,
  StatusDropdown,
  Pagination,
  usePagination,
} from "@/components/admin/AdminUI";
import { useAdmin, AdminUser } from "@/context/AdminContext";

export default function AdminAkunPage() {
  const { users, addUser, updateUser, deleteUser } = useAdmin();
  const [roleFilter, setRoleFilter] = useState("Semua");
  const [addModal, setAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<{
    originalUsername: string;
    data: AdminUser;
  } | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

  // New user form state
  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState<"Warga" | "Petugas" | "Admin">("Warga");
  const [newErrors, setNewErrors] = useState<Record<string, string>>({});

  // Edit user errors
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const handleCreateUser = (e: FormEvent) => {
    e.preventDefault();
    const cleanName = newName.trim();
    const cleanUsername = newUsername.trim().toLowerCase();
    const cleanPhone = newPhone.trim();

    const errors: Record<string, string> = {};
    if (!cleanName) errors.name = "Nama lengkap wajib diisi.";
    if (!cleanUsername) errors.username = "Username wajib diisi.";
    else if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      errors.username = "Username sudah digunakan.";
    }
    if (!cleanPhone) errors.phone = "Nomor telepon wajib diisi.";

    setNewErrors(errors);
    if (Object.keys(errors).length > 0) return;

    addUser({
      name: cleanName,
      username: cleanUsername,
      phone: cleanPhone,
      role: newRole,
    });

    // Reset & close
    setNewName("");
    setNewUsername("");
    setNewPhone("");
    setNewRole("Warga");
    setNewErrors({});
    setAddModal(false);
  };

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const cleanName = editingUser.data.name.trim();
    const cleanUsername = editingUser.data.username.trim().toLowerCase();
    const cleanPhone = editingUser.data.phone.trim();

    const errors: Record<string, string> = {};
    if (!cleanName) errors.name = "Nama lengkap wajib diisi.";
    if (!cleanUsername) errors.username = "Username wajib diisi.";
    else if (
      users.some(
        (u) =>
          u.username.toLowerCase() === cleanUsername &&
          u.username !== editingUser.originalUsername
      )
    ) {
      errors.username = "Username sudah digunakan oleh akun lain.";
    }
    if (!cleanPhone) errors.phone = "Nomor telepon wajib diisi.";

    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    updateUser(editingUser.originalUsername, {
      ...editingUser.data,
      name: cleanName,
      username: cleanUsername,
      phone: cleanPhone,
    });

    setEditingUser(null);
    setEditErrors({});
  };

  const confirmDelete = () => {
    if (!deletingUser) return;
    deleteUser(deletingUser.username);
    setDeletingUser(null);
  };

  const filteredUsers = users.filter(
    (u) => roleFilter === "Semua" || u.role === roleFilter
  );

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedItems: paginatedUsers,
    resetPage,
  } = usePagination(filteredUsers, 10);

  useEffect(() => {
    resetPage();
  }, [roleFilter, resetPage]);

  return (
    <>
      <PageTitle
        title="Kelola Akun"
        desc="Tambah dan kelola akun Warga, Petugas, serta Administrator SIMPANWASTE."
        action={
          <Button onClick={() => setAddModal(true)}>
            <Plus size={16} /> Tambah akun
          </Button>
        }
      />

      <Card>
        {/* Filter & Subtitle Bar */}
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <StatusDropdown
            value={roleFilter}
            onChange={setRoleFilter}
            options={[
              { value: "Semua", label: "Semua Peran", tone: "slate" },
              { value: "Warga", label: "Warga", tone: "green" },
              { value: "Petugas", label: "Petugas", tone: "amber" },
              { value: "Admin", label: "Admin", tone: "blue" },
            ]}
            className="sm:w-52"
          />
          <p className="text-xs text-slate-400">
            Password akun dienkripsi aman dan tidak ditampilkan
          </p>
        </div>

        {/* Users Table */}
        <div className="table-wrap">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-700">
                <th className="w-[200px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  Nama
                </th>
                <th className="w-[160px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  Username
                </th>
                <th className="w-[160px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  Telepon
                </th>
                <th className="w-[120px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 text-center">
                  Peran
                </th>
                <th className="w-[140px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((u) => (
                <tr
                  key={u.username}
                  className="border-b border-slate-200 transition-colors hover:bg-slate-50/80"
                >
                  <td className="px-4 py-3.5 font-bold text-slate-900 text-sm">
                    {u.name}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 text-sm font-mono">
                    @{u.username}
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 text-sm">
                    {u.phone}
                  </td>
                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                    <Badge
                      tone={
                        u.role === "Admin"
                          ? "blue"
                          : u.role === "Petugas"
                          ? "amber"
                          : "green"
                      }
                    >
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUser({
                            originalUsername: u.username,
                            data: { ...u },
                          });
                          setEditErrors({});
                        }}
                        className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-bold text-green-800 transition hover:bg-green-100 cursor-pointer"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingUser(u)}
                        className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100 cursor-pointer"
                      >
                        <Trash2 size={13} /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">
              Tidak ada akun yang sesuai dengan filter peran.
            </div>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="akun pengguna"
        />
      </Card>

      {/* Modal: Tambah Akun Baru */}
      {addModal && (
        <Modal title="Tambah Akun Baru" onClose={() => setAddModal(false)}>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <Field label="Nama lengkap">
              <input
                required
                className={`input ${newErrors.name ? "border-red-400 ring-2 ring-red-100" : ""}`}
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setNewErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="Contoh: Rahmat Hidayat"
              />
              {newErrors.name && (
                <p className="mt-1 text-xs text-red-600 font-semibold">{newErrors.name}</p>
              )}
            </Field>

            <Field label="Username">
              <input
                required
                className={`input ${newErrors.username ? "border-red-400 ring-2 ring-red-100" : ""}`}
                value={newUsername}
                onChange={(e) => {
                  setNewUsername(e.target.value);
                  setNewErrors((prev) => ({ ...prev, username: "" }));
                }}
                placeholder="Contoh: rahmat.h"
              />
              {newErrors.username && (
                <p className="mt-1 text-xs text-red-600 font-semibold">{newErrors.username}</p>
              )}
            </Field>

            <Field label="Nomor telepon">
              <input
                required
                className={`input ${newErrors.phone ? "border-red-400 ring-2 ring-red-100" : ""}`}
                value={newPhone}
                onChange={(e) => {
                  setNewPhone(e.target.value);
                  setNewErrors((prev) => ({ ...prev, phone: "" }));
                }}
                placeholder="Contoh: 0812 3456 7890"
              />
              {newErrors.phone && (
                <p className="mt-1 text-xs text-red-600 font-semibold">{newErrors.phone}</p>
              )}
            </Field>

            <Field label="Peran">
              <select
                className="input cursor-pointer"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
              >
                <option value="Warga">Warga</option>
                <option value="Petugas">Petugas</option>
                <option value="Admin">Admin</option>
              </select>
            </Field>

            <p className="text-xs text-slate-400">
              Password default untuk akun baru adalah: <code>password123</code>
            </p>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setAddModal(false)}>
                Batal
              </Button>
              <Button type="submit">
                <Check size={16} /> Simpan Akun
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Edit Akun */}
      {editingUser && (
        <Modal title="Edit Akun" onClose={() => setEditingUser(null)}>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <Field label="Nama lengkap">
              <input
                required
                value={editingUser.data.name}
                onChange={(e) => {
                  setEditingUser({
                    ...editingUser,
                    data: { ...editingUser.data, name: e.target.value },
                  });
                  setEditErrors((prev) => ({ ...prev, name: "" }));
                }}
                className={`input ${editErrors.name ? "border-red-400 ring-2 ring-red-100" : ""}`}
              />
              {editErrors.name && (
                <p className="mt-1 text-xs text-red-600 font-semibold">{editErrors.name}</p>
              )}
            </Field>

            <Field label="Username">
              <input
                required
                value={editingUser.data.username}
                onChange={(e) => {
                  setEditingUser({
                    ...editingUser,
                    data: { ...editingUser.data, username: e.target.value },
                  });
                  setEditErrors((prev) => ({ ...prev, username: "" }));
                }}
                className={`input ${editErrors.username ? "border-red-400 ring-2 ring-red-100" : ""}`}
              />
              {editErrors.username && (
                <p className="mt-1 text-xs text-red-600 font-semibold">{editErrors.username}</p>
              )}
            </Field>

            <Field label="Nomor telepon">
              <input
                required
                value={editingUser.data.phone}
                onChange={(e) => {
                  setEditingUser({
                    ...editingUser,
                    data: { ...editingUser.data, phone: e.target.value },
                  });
                  setEditErrors((prev) => ({ ...prev, phone: "" }));
                }}
                className={`input ${editErrors.phone ? "border-red-400 ring-2 ring-red-100" : ""}`}
              />
              {editErrors.phone && (
                <p className="mt-1 text-xs text-red-600 font-semibold">{editErrors.phone}</p>
              )}
            </Field>

            <Field label="Peran">
              <select
                value={editingUser.data.role}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    data: { ...editingUser.data, role: e.target.value as any },
                  })
                }
                className="input cursor-pointer"
              >
                <option value="Warga">Warga</option>
                <option value="Petugas">Petugas</option>
                <option value="Admin">Admin</option>
              </select>
            </Field>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setEditingUser(null)}>
                Batal
              </Button>
              <Button type="submit">
                <Check size={16} /> Simpan Perubahan
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Konfirmasi Hapus Akun */}
      {deletingUser && (
        <Modal title="Hapus Akun?" onClose={() => setDeletingUser(null)}>
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 shrink-0 text-red-700" size={20} />
              <div>
                <p className="text-sm leading-6 text-red-900">
                  Apakah Anda yakin ingin menghapus akun <strong>{deletingUser.name}</strong>?
                  Tindakan ini akan menghapus akses login pengguna tersebut.
                </p>
                <p className="mt-2 text-xs font-bold text-red-700 font-mono">
                  @{deletingUser.username} · {deletingUser.role}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setDeletingUser(null)}>
              Batal
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              <Trash2 size={16} /> Ya, Hapus Akun
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
