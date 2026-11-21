"use client";

import { useState, FormEvent } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Building2,
  Check,
  Phone,
  MapPin,
  Scale,
} from "lucide-react";
import {
  PageTitle,
  Card,
  Button,
  Field,
  Modal,
  Pagination,
  usePagination,
} from "@/components/admin/AdminUI";
import {
  useAdmin,
  WasteCategoryMaster,
  Partner,
} from "@/context/AdminContext";
import { wasteConditions, WasteCondition, money } from "@/data/wargaSeedData";

export default function AdminMasterPage() {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    minPickup,
    setMinPickup,
    partners,
    addPartner,
    updatePartner,
    deletePartner,
  } = useAdmin();

  const {
    currentPage: catPage,
    setCurrentPage: setCatPage,
    pageSize: catPageSize,
    setPageSize: setCatPageSize,
    totalPages: catTotalPages,
    totalItems: catTotalItems,
    paginatedItems: paginatedCategories,
  } = usePagination(categories, 10);

  const [activeTab, setActiveTab] = useState<
    "Kategori Sampah" | "Batas Minimum Pickup" | "Mitra Pengepul"
  >("Kategori Sampah");

  // Minimum pickup state
  const [tempMinPickup, setTempMinPickup] = useState(minPickup);

  // Category Modals
  const [addCatModal, setAddCatModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{
    index: number;
    data: WasteCategoryMaster;
  } | null>(null);
  const [deletingCatIndex, setDeletingCatIndex] = useState<number | null>(null);

  // New category form state
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatPrices, setNewCatPrices] = useState<Record<WasteCondition, number>>({
    "Sudah dipilah": 3000,
    "Sudah dibersihkan": 3000,
    "Tidak mudah didaur ulang": 1500,
    "Belum dipilah dan dibersihkan": 1500,
  });

  // Partner Modals
  const [addPartnerModal, setAddPartnerModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<{
    index: number;
    data: Partner;
  } | null>(null);
  const [deletingPartnerIndex, setDeletingPartnerIndex] = useState<number | null>(null);

  const [newPartnerName, setNewPartnerName] = useState("");
  const [newPartnerFocus, setNewPartnerFocus] = useState("");
  const [newPartnerPhone, setNewPartnerPhone] = useState("");
  const [newPartnerAddress, setNewPartnerAddress] = useState("");

  const handleAddCategory = (e: FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    addCategory({
      name: newCatName.trim(),
      desc: newCatDesc.trim(),
      prices: newCatPrices,
    });

    setNewCatName("");
    setNewCatDesc("");
    setAddCatModal(false);
  };

  const handleSaveEditCategory = (e: FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    updateCategory(editingCategory.index, {
      ...editingCategory.data,
      name: editingCategory.data.name.trim(),
      desc: editingCategory.data.desc.trim(),
    });

    setEditingCategory(null);
  };

  const handleAddPartner = (e: FormEvent) => {
    e.preventDefault();
    if (!newPartnerName.trim()) return;

    addPartner({
      name: newPartnerName.trim(),
      focus: newPartnerFocus.trim(),
      phone: newPartnerPhone.trim(),
      address: newPartnerAddress.trim(),
    });

    setNewPartnerName("");
    setNewPartnerFocus("");
    setNewPartnerPhone("");
    setNewPartnerAddress("");
    setAddPartnerModal(false);
  };

  const handleSaveEditPartner = (e: FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;

    updatePartner(editingPartner.index, {
      ...editingPartner.data,
      name: editingPartner.data.name.trim(),
      focus: editingPartner.data.focus.trim(),
    });

    setEditingPartner(null);
  };

  return (
    <>
      <PageTitle
        title="Data Master"
        desc="Kelola parameter kategori sampah, penetapan harga kondisi, batas pickup, dan rekanan mitra."
      />

      {/* Tabs Bar */}
      <div className="mb-6 flex overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
        {(["Kategori Sampah", "Batas Minimum Pickup", "Mitra Pengepul"] as const).map(
          (tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-bold transition cursor-pointer ${
                activeTab === tab
                  ? "bg-green-700 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {tab}
            </button>
          )
        )}
      </div>

      {/* TAB 1: Kategori Sampah */}
      {activeTab === "Kategori Sampah" && (
        <Card>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg">
                Katalog Kategori & Harga Master
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Nilai berlaku otomatis pada penimbangan dan estimasi laporan baru.
              </p>
            </div>
            <Button onClick={() => setAddCatModal(true)}>
              <Plus size={16} /> Tambah Kategori
            </Button>
          </div>

          <div className="table-wrap">
            <table className="w-full min-w-[1000px] border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-700">
                  <th className="w-[180px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                    Kategori
                  </th>
                  <th className="w-[220px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                    Deskripsi
                  </th>
                  {wasteConditions.map((condition) => (
                    <th
                      key={condition}
                      className="w-[140px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 text-center"
                    >
                      {condition}
                    </th>
                  ))}
                  <th className="w-[140px] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.map((c, i) => {
                  const originalIndex = (catPage - 1) * catPageSize + i;
                  return (
                    <tr
                      key={`${c.name}-${originalIndex}`}
                      className="border-b border-slate-200 transition-colors hover:bg-slate-50/80"
                    >
                      <td className="px-4 py-3.5 font-bold text-slate-900 text-sm">
                        {c.name}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 text-xs">
                        {c.desc}
                      </td>
                      {wasteConditions.map((condition) => (
                        <td
                          key={condition}
                          className="px-4 py-3.5 text-center font-semibold text-slate-800 text-sm whitespace-nowrap"
                        >
                          {money(c.prices?.[condition] || 0)}
                        </td>
                      ))}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingCategory({ index: originalIndex, data: { ...c } })
                            }
                            className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-bold text-green-800 transition hover:bg-green-100 cursor-pointer"
                          >
                            <Pencil size={13} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingCatIndex(originalIndex)}
                            className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100 cursor-pointer"
                          >
                            <Trash2 size={13} /> Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={catPage}
            totalPages={catTotalPages}
            totalItems={catTotalItems}
            pageSize={catPageSize}
            onPageChange={setCatPage}
            onPageSizeChange={setCatPageSize}
            itemLabel="kategori sampah"
          />
        </Card>
      )}

      {/* TAB 2: Batas Minimum Pickup */}
      {activeTab === "Batas Minimum Pickup" && (
        <Card className="max-w-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-green-700 border border-green-200">
              <Scale size={20} />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg">
                Konfigurasi Penjemputan (Pickup)
              </h2>
              <p className="text-xs text-slate-500">
                Ambang batas minimum sampah untuk layanan penjemputan warga.
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            Metode <strong>Penjemputan (Pickup)</strong> hanya dapat dipilih warga jika estimasi berat total penyetoran sama dengan atau melebihi batas ini. Laporan di bawah batas ini disarankan melalui metode <strong>Drop-off</strong> langsung ke bank sampah.
          </p>

          <div className="mt-6 max-w-sm">
            <Field label="Minimum Pickup (Kilogram)" hint="Bawaan: 5 kg">
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={tempMinPickup}
                  onChange={(e) => setTempMinPickup(Number(e.target.value) || 1)}
                  className="input font-bold text-lg pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  kg
                </span>
              </div>
            </Field>
          </div>

          <Button
            onClick={() => setMinPickup(tempMinPickup)}
            className="mt-6"
          >
            <Check size={16} /> Simpan Konfigurasi
          </Button>
        </Card>
      )}

      {/* TAB 3: Mitra Pengepul */}
      {activeTab === "Mitra Pengepul" && (
        <Card>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg">
                Daftar Mitra Pengepul & Pengolah
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Perusahaan rekanan penerima distribusi sampah daur ulang terpilah.
              </p>
            </div>
            <Button onClick={() => setAddPartnerModal(true)}>
              <Plus size={16} /> Tambah Mitra
            </Button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {partners.map((m, idx) => (
              <div
                key={m.name}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-green-50 text-green-700">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{m.name}</h3>
                      <p className="text-[11px] text-green-700 font-semibold">{m.focus}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                    <p className="flex items-center gap-1.5">
                      <Phone size={13} className="text-slate-400" /> {m.phone || "0812-xxxx-xxxx"}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">{m.address || "Kota Palembang"}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-3">
                  <Button
                    variant="secondary"
                    className="min-h-8 flex-1 px-3 text-xs"
                    onClick={() => setEditingPartner({ index: idx, data: { ...m } })}
                  >
                    <Pencil size={13} /> Edit
                  </Button>
                  <Button
                    variant="danger"
                    className="min-h-8 px-3 text-xs"
                    onClick={() => setDeletingPartnerIndex(idx)}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modal: Tambah Kategori */}
      {addCatModal && (
        <Modal title="Tambah Kategori Sampah" onClose={() => setAddCatModal(false)}>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <Field label="Nama kategori">
              <input
                required
                className="input"
                placeholder="Contoh: Kaleng Seng"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
              />
            </Field>

            <Field label="Deskripsi">
              <textarea
                required
                className="input min-h-20 resize-none"
                placeholder="Keterangan jenis sampah dan kriteria..."
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              {wasteConditions.map((condition) => (
                <Field key={condition} label={`Harga ${condition} / kg`}>
                  <input
                    required
                    type="number"
                    min="0"
                    step="100"
                    className="input"
                    value={newCatPrices[condition]}
                    onChange={(e) =>
                      setNewCatPrices({
                        ...newCatPrices,
                        [condition]: Number(e.target.value) || 0,
                      })
                    }
                  />
                </Field>
              ))}
            </div>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setAddCatModal(false)}>
                Batal
              </Button>
              <Button type="submit">
                <Check size={16} /> Simpan Kategori
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Edit Kategori */}
      {editingCategory && (
        <Modal title="Edit Kategori Sampah" onClose={() => setEditingCategory(null)}>
          <form onSubmit={handleSaveEditCategory} className="space-y-4">
            <Field label="Nama kategori">
              <input
                required
                className="input"
                value={editingCategory.data.name}
                onChange={(e) =>
                  setEditingCategory({
                    ...editingCategory,
                    data: { ...editingCategory.data, name: e.target.value },
                  })
                }
              />
            </Field>

            <Field label="Deskripsi">
              <textarea
                required
                className="input min-h-20 resize-none"
                value={editingCategory.data.desc}
                onChange={(e) =>
                  setEditingCategory({
                    ...editingCategory,
                    data: { ...editingCategory.data, desc: e.target.value },
                  })
                }
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              {wasteConditions.map((condition) => (
                <Field key={condition} label={`Harga ${condition} / kg`}>
                  <input
                    required
                    type="number"
                    min="0"
                    step="100"
                    className="input"
                    value={editingCategory.data.prices?.[condition] || 0}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        data: {
                          ...editingCategory.data,
                          prices: {
                            ...editingCategory.data.prices,
                            [condition]: Number(e.target.value) || 0,
                          },
                        },
                      })
                    }
                  />
                </Field>
              ))}
            </div>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setEditingCategory(null)}>
                Batal
              </Button>
              <Button type="submit">
                <Check size={16} /> Simpan Perubahan
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Hapus Kategori */}
      {deletingCatIndex !== null && categories[deletingCatIndex] && (
        <Modal title="Hapus Kategori Sampah" onClose={() => setDeletingCatIndex(null)}>
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm font-bold text-red-900">
              {categories[deletingCatIndex].name}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-red-700">
              Kategori ini akan dihapus dari katalog master dan tidak tersedia untuk laporan baru.
            </p>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setDeletingCatIndex(null)}>
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                deleteCategory(deletingCatIndex);
                setDeletingCatIndex(null);
              }}
            >
              <Trash2 size={16} /> Ya, Hapus
            </Button>
          </div>
        </Modal>
      )}

      {/* Modal: Tambah Mitra */}
      {addPartnerModal && (
        <Modal title="Tambah Mitra Pengepul" onClose={() => setAddPartnerModal(false)}>
          <form onSubmit={handleAddPartner} className="space-y-4">
            <Field label="Nama Perusahaan Mitra">
              <input
                required
                className="input"
                placeholder="Contoh: PT Kreasi Daur Ulang"
                value={newPartnerName}
                onChange={(e) => setNewPartnerName(e.target.value)}
              />
            </Field>

            <Field label="Fokus / Spesialisasi Sampah">
              <input
                required
                className="input"
                placeholder="Contoh: Plastik HDPE & PET"
                value={newPartnerFocus}
                onChange={(e) => setNewPartnerFocus(e.target.value)}
              />
            </Field>

            <Field label="Nomor Telepon">
              <input
                className="input"
                placeholder="Contoh: 0812 7890 1234"
                value={newPartnerPhone}
                onChange={(e) => setNewPartnerPhone(e.target.value)}
              />
            </Field>

            <Field label="Alamat Kantor / Pabrik">
              <input
                className="input"
                placeholder="Contoh: Jl. Mayor Zen No. 12, Kalidoni"
                value={newPartnerAddress}
                onChange={(e) => setNewPartnerAddress(e.target.value)}
              />
            </Field>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setAddPartnerModal(false)}>
                Batal
              </Button>
              <Button type="submit">
                <Check size={16} /> Simpan Mitra
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Edit Mitra */}
      {editingPartner && (
        <Modal title="Edit Data Mitra" onClose={() => setEditingPartner(null)}>
          <form onSubmit={handleSaveEditPartner} className="space-y-4">
            <Field label="Nama Perusahaan Mitra">
              <input
                required
                className="input"
                value={editingPartner.data.name}
                onChange={(e) =>
                  setEditingPartner({
                    ...editingPartner,
                    data: { ...editingPartner.data, name: e.target.value },
                  })
                }
              />
            </Field>

            <Field label="Fokus / Spesialisasi Sampah">
              <input
                required
                className="input"
                value={editingPartner.data.focus}
                onChange={(e) =>
                  setEditingPartner({
                    ...editingPartner,
                    data: { ...editingPartner.data, focus: e.target.value },
                  })
                }
              />
            </Field>

            <Field label="Nomor Telepon">
              <input
                className="input"
                value={editingPartner.data.phone}
                onChange={(e) =>
                  setEditingPartner({
                    ...editingPartner,
                    data: { ...editingPartner.data, phone: e.target.value },
                  })
                }
              />
            </Field>

            <Field label="Alamat">
              <input
                className="input"
                value={editingPartner.data.address}
                onChange={(e) =>
                  setEditingPartner({
                    ...editingPartner,
                    data: { ...editingPartner.data, address: e.target.value },
                  })
                }
              />
            </Field>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setEditingPartner(null)}>
                Batal
              </Button>
              <Button type="submit">
                <Check size={16} /> Simpan Perubahan
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Hapus Mitra */}
      {deletingPartnerIndex !== null && partners[deletingPartnerIndex] && (
        <Modal title="Hapus Mitra?" onClose={() => setDeletingPartnerIndex(null)}>
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm font-bold text-red-900">
              {partners[deletingPartnerIndex].name}
            </p>
            <p className="mt-1 text-xs text-red-700">
              Data mitra akan dihapus dari daftar rekanan pengolah SIMPANWASTE.
            </p>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setDeletingPartnerIndex(null)}>
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                deletePartner(deletingPartnerIndex);
                setDeletingPartnerIndex(null);
              }}
            >
              <Trash2 size={16} /> Ya, Hapus
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
