"use client";

import { useState, FormEvent } from "react";
import {
  Truck,
  Building2,
  Recycle,
  Plus,
  Pencil,
  Trash2,
  Check,
} from "lucide-react";
import {
  PageTitle,
  Card,
  Button,
  Field,
  Modal,
  StatCard,
  Pagination,
  usePagination,
} from "@/components/admin/AdminUI";
import {
  useAdmin,
  DistributionRow,
} from "@/context/AdminContext";

export default function AdminDistribusiPage() {
  const {
    distributions,
    addDistribution,
    updateDistribution,
    deleteDistribution,
    partners,
    categories,
  } = useAdmin();

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedItems: paginatedDistributions,
  } = usePagination(distributions, 10);

  const [addModal, setAddModal] = useState(false);
  const [editingRow, setEditingRow] = useState<DistributionRow | null>(null);
  const [deletingRow, setDeletingRow] = useState<DistributionRow | null>(null);

  // New distribution form state
  const [newPartner, setNewPartner] = useState(
    partners[0]?.name || "PT Sriwijaya Daur Ulang"
  );
  const [newCategory, setNewCategory] = useState(
    categories[0]?.name || "Botol Plastik PET"
  );
  const [newWeight, setNewWeight] = useState<number>(100);
  const [newDate, setNewDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalWeight = distributions.reduce((sum, d) => sum + d.weight, 0);
  const activePartnersCount = new Set(distributions.map((d) => d.partner)).size;

  const categoryTotals = distributions.reduce<Record<string, number>>((acc, d) => {
    acc[d.category] = (acc[d.category] || 0) + d.weight;
    return acc;
  }, {});

  const topCategoryEntry = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!newPartner || !newCategory || newWeight <= 0 || !newDate) {
      setErrors({ form: "Lengkapi seluruh isian dengan benar." });
      return;
    }

    addDistribution({
      date: newDate,
      partner: newPartner,
      category: newCategory,
      weight: newWeight,
    });

    setAddModal(false);
    setErrors({});
  };

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;

    if (!editingRow.partner || !editingRow.category || editingRow.weight <= 0 || !editingRow.date) {
      setErrors({ edit: "Lengkapi seluruh data distribusi." });
      return;
    }

    updateDistribution(editingRow.id, {
      date: editingRow.date,
      partner: editingRow.partner,
      category: editingRow.category,
      weight: editingRow.weight,
    });

    setEditingRow(null);
    setErrors({});
  };

  const confirmDelete = () => {
    if (!deletingRow) return;
    deleteDistribution(deletingRow.id);
    setDeletingRow(null);
  };

  return (
    <>
      <PageTitle
        title="Distribusi ke Mitra"
        desc="Kelola pencatatan dan penyaluran sampah terpilah ke mitra pengepul & pabrik daur ulang."
        action={
          <Button onClick={() => setAddModal(true)}>
            <Plus size={16} /> Tambah Distribusi
          </Button>
        }
      />

      {/* Aggregate Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Tersalurkan"
          value={`${totalWeight.toLocaleString("id-ID")} kg`}
          detail={`${distributions.length} kali pengiriman`}
          icon={Truck}
        />
        <StatCard
          label="Mitra Aktif"
          value={`${activePartnersCount} Mitra`}
          detail="Rekanan industri terverifikasi"
          icon={Building2}
          tone="blue"
        />
        <StatCard
          label="Kategori Terbanyak"
          value={topCategoryEntry ? topCategoryEntry[0] : "—"}
          detail={`${(topCategoryEntry ? topCategoryEntry[1] : 0).toLocaleString(
            "id-ID"
          )} kg tersalurkan`}
          icon={Recycle}
          tone="amber"
        />
      </div>

      {/* Data Table */}
      <Card className="mt-6">
        <div className="table-wrap">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-700">
                <th className="w-[140px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  Tanggal
                </th>
                <th className="w-[240px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  Mitra Pengepul
                </th>
                <th className="w-[200px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  Kategori
                </th>
                <th className="w-[130px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 text-center">
                  Berat (kg)
                </th>
                <th className="w-[140px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedDistributions.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-slate-200 transition-colors hover:bg-slate-50/80"
                >
                  <td className="px-4 py-3.5 text-slate-600 text-sm whitespace-nowrap">
                    {r.date}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900 text-sm">
                    {r.partner}
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 text-sm">
                    {r.category}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900 text-sm text-center whitespace-nowrap">
                    {r.weight.toLocaleString("id-ID")} kg
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRow({ ...r });
                          setErrors({});
                        }}
                        className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-bold text-green-800 transition hover:bg-green-100 cursor-pointer"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingRow(r)}
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

          {distributions.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">
              Belum ada riwayat pencatatan distribusi sampah ke mitra.
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
          itemLabel="catatan distribusi"
        />
      </Card>

      {/* Modal: Tambah Distribusi */}
      {addModal && (
        <Modal title="Tambah Data Distribusi" onClose={() => setAddModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Mitra Pengepul">
              <select
                className="input cursor-pointer"
                value={newPartner}
                onChange={(e) => setNewPartner(e.target.value)}
              >
                {partners.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Kategori Sampah">
              <select
                className="input cursor-pointer"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Berat Distribusi (kg)">
              <input
                required
                type="number"
                min="0.1"
                step="0.1"
                className="input font-bold"
                value={newWeight}
                onChange={(e) => setNewWeight(Number(e.target.value) || 0)}
              />
            </Field>

            <Field label="Tanggal Distribusi">
              <input
                required
                type="date"
                className="input"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </Field>

            {errors.form && (
              <p className="text-xs text-red-600 font-semibold">{errors.form}</p>
            )}

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setAddModal(false)}>
                Batal
              </Button>
              <Button type="submit">
                <Check size={16} /> Simpan Distribusi
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Edit Distribusi */}
      {editingRow && (
        <Modal title="Edit Data Distribusi" onClose={() => setEditingRow(null)}>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <Field label="Mitra Pengepul">
              <select
                className="input cursor-pointer"
                value={editingRow.partner}
                onChange={(e) =>
                  setEditingRow({ ...editingRow, partner: e.target.value })
                }
              >
                {partners.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Kategori Sampah">
              <select
                className="input cursor-pointer"
                value={editingRow.category}
                onChange={(e) =>
                  setEditingRow({ ...editingRow, category: e.target.value })
                }
              >
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Berat Distribusi (kg)">
              <input
                required
                type="number"
                min="0.1"
                step="0.1"
                className="input font-bold"
                value={editingRow.weight}
                onChange={(e) =>
                  setEditingRow({
                    ...editingRow,
                    weight: Number(e.target.value) || 0,
                  })
                }
              />
            </Field>

            <Field label="Tanggal Distribusi">
              <input
                required
                type="date"
                className="input"
                value={editingRow.date}
                onChange={(e) =>
                  setEditingRow({ ...editingRow, date: e.target.value })
                }
              />
            </Field>

            {errors.edit && (
              <p className="text-xs text-red-600 font-semibold">{errors.edit}</p>
            )}

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setEditingRow(null)}>
                Batal
              </Button>
              <Button type="submit">
                <Check size={16} /> Simpan Perubahan
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Hapus Distribusi */}
      {deletingRow && (
        <Modal title="Hapus Data Distribusi?" onClose={() => setDeletingRow(null)}>
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm font-bold text-red-900">
              {deletingRow.partner} · {deletingRow.category}
            </p>
            <p className="mt-1 text-xs text-red-700">
              Pencatatan distribusi sebesar {deletingRow.weight} kg pada {deletingRow.date} akan dihapus dari sistem.
            </p>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setDeletingRow(null)}>
              Batal
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              <Trash2 size={16} /> Ya, Hapus
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
