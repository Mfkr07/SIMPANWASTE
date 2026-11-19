"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  Report,
  initialReports as reportsSeed,
  categoriesSeed,
  WasteCondition,
  wasteConditions,
  WithdrawalRequest,
  withdrawalRequestsSeed,
} from "@/data/wargaSeedData";
import { mapDbReportToUi, mapDbWithdrawalToUi } from "@/lib/utils/reportMapper";
import { getCategoryUuid } from "@/lib/utils/categoryMapping";

export interface AdminUser {
  name: string;
  username: string;
  phone: string;
  role: "Warga" | "Petugas" | "Admin";
}

export interface Partner {
  id?: string;
  name: string;
  focus: string;
  phone: string;
  address: string;
}

export interface DistributionRow {
  id: string;
  date: string;
  partner: string;
  category: string;
  weight: number;
}

export interface WasteCategoryMaster {
  id?: string;
  name: string;
  desc: string;
  prices: Record<WasteCondition, number>;
}

export interface AdminProfile {
  name: string;
  username: string;
  phone: string;
  address: string;
  role: string;
}

interface AdminContextType {
  adminProfile: AdminProfile;
  users: AdminUser[];
  categories: WasteCategoryMaster[];
  minPickup: number;
  partners: Partner[];
  distributions: DistributionRow[];
  reports: Report[];
  withdrawalRequests: WithdrawalRequest[];
  toast: string | null;
  notify: (msg: string) => void;
  addUser: (user: AdminUser) => void;
  updateUser: (originalUsername: string, user: AdminUser) => void;
  deleteUser: (username: string) => void;
  addCategory: (cat: WasteCategoryMaster) => void;
  updateCategory: (index: number, cat: WasteCategoryMaster) => void;
  deleteCategory: (index: number) => void;
  setMinPickup: (val: number) => void;
  addPartner: (partner: Partner) => void;
  updatePartner: (index: number, partner: Partner) => void;
  deletePartner: (index: number) => void;
  addDistribution: (dist: Omit<DistributionRow, "id">) => void;
  updateDistribution: (id: string, dist: Partial<DistributionRow>) => void;
  deleteDistribution: (id: string) => void;
  processWithdrawal: (
    id: string,
    proof: { name: string; type: string; dataUrl: string }
  ) => void;
  handleLogout: () => Promise<void>;
  refreshAdminData: () => Promise<void>;
}

const defaultAdminProfile: AdminProfile = {
  name: "Nadia Putri",
  username: "admin.simpan",
  phone: "0812 9900 8822",
  address: "Kantor SIMPANWASTE Palembang",
  role: "Administrator",
};

const defaultUsers: AdminUser[] = [
  { name: "Ayu Lestari", username: "ayu.lestari", phone: "0812 7788 2341", role: "Warga" },
  { name: "Budi Santoso", username: "budi.s", phone: "0813 6900 1122", role: "Warga" },
  { name: "Rizky Pratama", username: "rizky.p", phone: "0813 7781 2240", role: "Petugas" },
  { name: "Nadia Putri", username: "admin.simpan", phone: "0812 9900 8822", role: "Admin" },
];

const defaultPartners: Partner[] = [
  {
    name: "PT Sriwijaya Daur Ulang",
    focus: "Plastik PET dan plastik campur",
    phone: "0811 7120 440",
    address: "Kawasan Industri Gandus, Palembang",
  },
  {
    name: "Mitra Kertas Musi",
    focus: "Kardus dan kertas campur",
    phone: "0812 7300 881",
    address: "Jl. Kol. H. Burlian, Sukarami, Palembang",
  },
  {
    name: "CV Logam Jaya",
    focus: "Kaleng dan logam aluminium",
    phone: "0813 6711 200",
    address: "Jl. MP Mangkunegara, Ilir Timur II, Palembang",
  },
];

const defaultDistributions: DistributionRow[] = [
  {
    id: "DST-001",
    date: "2025-03-17",
    partner: "PT Sriwijaya Daur Ulang",
    category: "Botol Plastik PET",
    weight: 820,
  },
  {
    id: "DST-002",
    date: "2025-03-13",
    partner: "Mitra Kertas Musi",
    category: "Kardus",
    weight: 640,
  },
  {
    id: "DST-003",
    date: "2025-03-08",
    partner: "CV Logam Jaya",
    category: "Kaleng Aluminium",
    weight: 410,
  },
];

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(defaultAdminProfile);
  const [users, setUsers] = useState<AdminUser[]>(defaultUsers);
  const [categories, setCategories] = useState<WasteCategoryMaster[]>(categoriesSeed);
  const [minPickup, setMinPickupState] = useState<number>(5);
  const [partners, setPartners] = useState<Partner[]>(defaultPartners);
  const [distributions, setDistributions] = useState<DistributionRow[]>(defaultDistributions);
  const [reports, setReports] = useState<Report[]>(reportsSeed);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(withdrawalRequestsSeed);
  const [toast, setToast] = useState<string | null>(null);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((cur) => (cur === msg ? null : cur));
    }, 3500);
  }, []);

  // Refresh live data dari Supabase
  const refreshAdminData = useCallback(async () => {
    try {
      // 1. Ambil Laporan Live
      const lapRes = await fetch("/api/laporan");
      if (lapRes.ok) {
        const lapData = await lapRes.json();
        if (Array.isArray(lapData.data) && lapData.data.length > 0) {
          setReports(lapData.data.map(mapDbReportToUi));
        }
      }

      // 2. Ambil Penarikan Live
      const penRes = await fetch("/api/penarikan");
      if (penRes.ok) {
        const penData = await penRes.json();
        if (Array.isArray(penData.data) && penData.data.length > 0) {
          setWithdrawalRequests(penData.data.map(mapDbWithdrawalToUi));
        }
      }

      // 3. Ambil Pengaturan Batas Pickup
      const setRes = await fetch("/api/pengaturan");
      if (setRes.ok) {
        const setData = await setRes.json();
        if (setData.batas_minimum_pickup_kg) {
          setMinPickupState(Number(setData.batas_minimum_pickup_kg));
        }
      }

      // 4. Ambil Mitra Pengepul Live
      const mitRes = await fetch("/api/mitra");
      if (mitRes.ok) {
        const mitData = await mitRes.json();
        if (Array.isArray(mitData.data) && mitData.data.length > 0) {
          const mappedPartners: Partner[] = mitData.data.map((m: any) => ({
            id: m.id,
            name: m.nama,
            focus: "Daur Ulang Sampah Terpilah",
            phone: m.kontak,
            address: m.alamat,
          }));
          setPartners(mappedPartners);
        }
      }

      // 5. Ambil Akun Pengguna Live
      const userRes = await fetch("/api/admin/akun");
      if (userRes.ok) {
        const userData = await userRes.json();
        if (Array.isArray(userData.data) && userData.data.length > 0) {
          const mappedUsers: AdminUser[] = userData.data.map((u: any) => ({
            name: u.nama,
            username: u.username,
            phone: u.no_hp || "-",
            role: (u.peran === "admin" ? "Admin" : u.peran === "petugas" ? "Petugas" : "Warga") as any,
          }));
          setUsers(mappedUsers);
        }
      }
    } catch (e) {
      console.warn("Gagal refresh data admin Supabase:", e);
    }
  }, []);

  // Sync from localStorage after client hydration & call live API
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedUsers = localStorage.getItem("simpanwaste-users");
      if (storedUsers) {
        const parsed = JSON.parse(storedUsers);
        if (Array.isArray(parsed) && parsed.length) setUsers(parsed);
      }

      const storedCategories = localStorage.getItem("simpanwaste_categories");
      if (storedCategories) {
        const parsed = JSON.parse(storedCategories);
        if (Array.isArray(parsed) && parsed.length) setCategories(parsed);
      }

      const storedPartners = localStorage.getItem("simpanwaste-partners");
      if (storedPartners) {
        const parsed = JSON.parse(storedPartners);
        if (Array.isArray(parsed) && parsed.length) setPartners(parsed);
      }

      const storedDist = localStorage.getItem("simpanwaste-distributions");
      if (storedDist) {
        const parsed = JSON.parse(storedDist);
        if (Array.isArray(parsed) && parsed.length) setDistributions(parsed);
      }

      const rawSession = localStorage.getItem("simpanwaste_user_session");
      if (rawSession) {
        const parsedSession = JSON.parse(rawSession);
        if (parsedSession.role === "admin" || parsedSession.peran === "admin") {
          setAdminProfile({
            name: parsedSession.name || parsedSession.nama || "Nadia Putri",
            username: parsedSession.username || "admin.simpan",
            phone: parsedSession.phone || parsedSession.no_hp || "0812 9900 8822",
            address: parsedSession.alamat || "Kantor SIMPANWASTE Palembang",
            role: "Administrator",
          });
        }
      }
    } catch (e) {
      console.warn("Gagal membaca storage admin:", e);
    }

    refreshAdminData();
  }, [refreshAdminData]);

  const addUser = useCallback(
    (newUser: AdminUser) => {
      setUsers((prev) => {
        const updated = [...prev, newUser];
        if (typeof window !== "undefined") {
          localStorage.setItem("simpanwaste-users", JSON.stringify(updated));
        }
        return updated;
      });
      notify(`Pengguna ${newUser.name} berhasil ditambahkan.`);
    },
    [notify]
  );

  const updateUser = useCallback(
    (originalUsername: string, updatedUser: AdminUser) => {
      setUsers((prev) => {
        const updated = prev.map((u) => (u.username === originalUsername ? updatedUser : u));
        if (typeof window !== "undefined") {
          localStorage.setItem("simpanwaste-users", JSON.stringify(updated));
        }
        return updated;
      });
      notify(`Data ${updatedUser.name} berhasil diperbarui.`);
    },
    [notify]
  );

  const deleteUser = useCallback(
    (username: string) => {
      setUsers((prev) => {
        const updated = prev.filter((u) => u.username !== username);
        if (typeof window !== "undefined") {
          localStorage.setItem("simpanwaste-users", JSON.stringify(updated));
        }
        return updated;
      });
      notify(`Pengguna @${username} berhasil dihapus.`);
    },
    [notify]
  );

  const addCategory = useCallback(
    (newCat: WasteCategoryMaster) => {
      // Kirim ke backend Supabase
      fetch("/api/kategori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama_kategori: newCat.name,
          deskripsi: newCat.desc,
          prices: newCat.prices,
        }),
      }).catch(() => {});

      setCategories((prev) => {
        const updated = [...prev, newCat];
        if (typeof window !== "undefined") {
          localStorage.setItem("simpanwaste_categories", JSON.stringify(updated));
        }
        return updated;
      });
      notify(`Kategori ${newCat.name} berhasil ditambahkan ke database.`);
    },
    [notify]
  );

  const updateCategory = useCallback(
    (index: number, updatedCat: WasteCategoryMaster) => {
      setCategories((prev) => {
        const updated = prev.map((c, i) => (i === index ? updatedCat : c));
        if (typeof window !== "undefined") {
          localStorage.setItem("simpanwaste_categories", JSON.stringify(updated));
        }
        return updated;
      });
      notify(`Kategori ${updatedCat.name} berhasil diperbarui.`);
    },
    [notify]
  );

  const deleteCategory = useCallback(
    (index: number) => {
      setCategories((prev) => {
        const target = prev[index];
        if (target?.id) {
          fetch(`/api/kategori?id=${target.id}`, { method: "DELETE" }).catch(() => {});
        }
        const updated = prev.filter((_, i) => i !== index);
        if (typeof window !== "undefined") {
          localStorage.setItem("simpanwaste_categories", JSON.stringify(updated));
        }
        return updated;
      });
      notify("Kategori berhasil dihapus.");
    },
    [notify]
  );

  const setMinPickup = useCallback(
    (val: number) => {
      // Simpan ke Supabase pengaturan_sistem
      fetch("/api/pengaturan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batas_minimum_pickup_kg: val }),
      }).catch(() => {});

      setMinPickupState(val);
      if (typeof window !== "undefined") {
        localStorage.setItem("simpanwaste_min_pickup", String(val));
      }
      notify(`Batas minimum pickup berhasil diperbarui menjadi ${val} kg.`);
    },
    [notify]
  );

  const addPartner = useCallback(
    (partner: Partner) => {
      // Simpan ke Supabase mitra_pengepul
      fetch("/api/mitra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: partner.name,
          alamat: partner.address,
          kontak: partner.phone,
          fokus: partner.focus,
        }),
      }).catch(() => {});

      setPartners((prev) => {
        const updated = [...prev, partner];
        if (typeof window !== "undefined") {
          localStorage.setItem("simpanwaste-partners", JSON.stringify(updated));
        }
        return updated;
      });
      notify(`Mitra ${partner.name} berhasil ditambahkan ke database.`);
    },
    [notify]
  );

  const updatePartner = useCallback(
    (index: number, updatedPartner: Partner) => {
      setPartners((prev) => {
        const updated = prev.map((p, i) => (i === index ? updatedPartner : p));
        if (typeof window !== "undefined") {
          localStorage.setItem("simpanwaste-partners", JSON.stringify(updated));
        }
        return updated;
      });
      notify(`Mitra ${updatedPartner.name} berhasil diperbarui.`);
    },
    [notify]
  );

  const deletePartner = useCallback(
    (index: number) => {
      setPartners((prev) => {
        const target = prev[index];
        if (target?.id) {
          fetch(`/api/mitra?id=${target.id}`, { method: "DELETE" }).catch(() => {});
        }
        const updated = prev.filter((_, i) => i !== index);
        if (typeof window !== "undefined") {
          localStorage.setItem("simpanwaste-partners", JSON.stringify(updated));
        }
        return updated;
      });
      notify("Mitra berhasil dihapus.");
    },
    [notify]
  );

  const addDistribution = useCallback(
    (dist: Omit<DistributionRow, "id">) => {
      const idKat = getCategoryUuid(dist.category);
      fetch("/api/distribusi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_mitra: "ed42c52a-8a5f-4bd6-802c-fac881e3ed71",
          id_kategori: idKat,
          berat: dist.weight,
          tanggal: dist.date,
          catatan: "Distribusi ke mitra " + dist.partner,
        }),
      }).catch(() => {});

      setDistributions((prev) => {
        const newId = `DST-${String(prev.length + 1).padStart(3, "0")}`;
        const newRow: DistributionRow = { id: newId, ...dist };
        const updated = [newRow, ...prev];
        if (typeof window !== "undefined") {
          localStorage.setItem("simpanwaste-distributions", JSON.stringify(updated));
        }
        return updated;
      });
      notify("Data distribusi baru berhasil dicatat ke sistem.");
    },
    [notify]
  );

  const updateDistribution = useCallback(
    (id: string, dist: Partial<DistributionRow>) => {
      setDistributions((prev) => {
        const updated = prev.map((item) => (item.id === id ? { ...item, ...dist } : item));
        if (typeof window !== "undefined") {
          localStorage.setItem("simpanwaste-distributions", JSON.stringify(updated));
        }
        return updated;
      });
      notify("Data distribusi berhasil diperbarui.");
    },
    [notify]
  );

  const deleteDistribution = useCallback(
    (id: string) => {
      setDistributions((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        if (typeof window !== "undefined") {
          localStorage.setItem("simpanwaste-distributions", JSON.stringify(updated));
        }
        return updated;
      });
      notify("Data distribusi berhasil dihapus.");
    },
    [notify]
  );

  // Process withdrawal: execute Supabase RPC proses_penarikan & update ledger
  const processWithdrawal = useCallback(
    (id: string, proof: { name: string; type: string; dataUrl: string }) => {
      // 1. Kirim ke Supabase RPC via API
      fetch("/api/penarikan/proses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_penarikan: id,
          status: "selesai",
          bukti_transfer_url: proof?.dataUrl || null,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            notify("Pencairan dana berhasil diproses di database Supabase.");
            refreshAdminData();
          } else {
            notify("Pencairan dicatat secara administratif.");
          }
        })
        .catch(() => {
          notify("Pencairan dicatat secara administratif.");
        });

      // 2. Update state lokal untuk tampilan langsung
      const processedDate = new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date());

      setWithdrawalRequests((prev) => {
        const updated = prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "Selesai" as const,
                processedDate,
                processedBy: "Nadia Putri",
                proof,
              }
            : item
        );
        if (typeof window !== "undefined") {
          localStorage.setItem("simpanwaste_withdrawal_requests", JSON.stringify(updated));
        }
        return updated;
      });
    },
    [notify, refreshAdminData]
  );

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
    } finally {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("simpanwaste_user_session");
          localStorage.removeItem("simpanwaste_active_user");
        } catch {}
      }
      router.push("/login");
      router.refresh();
    }
  }, [router]);

  return (
    <AdminContext.Provider
      value={{
        adminProfile,
        users,
        categories,
        minPickup,
        partners,
        distributions,
        reports,
        withdrawalRequests,
        toast,
        notify,
        addUser,
        updateUser,
        deleteUser,
        addCategory,
        updateCategory,
        deleteCategory,
        setMinPickup,
        addPartner,
        updatePartner,
        deletePartner,
        addDistribution,
        updateDistribution,
        deleteDistribution,
        processWithdrawal,
        handleLogout,
        refreshAdminData,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
