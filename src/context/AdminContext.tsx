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

export interface AdminUser {
  name: string;
  username: string;
  phone: string;
  role: "Warga" | "Petugas" | "Admin";
}

export interface Partner {
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

  // Sync from localStorage after client hydration
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedUsers = localStorage.getItem("simpanwaste-users");
      if (storedUsers) {
        const parsed = JSON.parse(storedUsers);
        if (Array.isArray(parsed) && parsed.length) setUsers(parsed);
      } else {
        localStorage.setItem("simpanwaste-users", JSON.stringify(defaultUsers));
      }

      const storedCategories = localStorage.getItem("simpanwaste_categories");
      if (storedCategories) {
        const parsed = JSON.parse(storedCategories);
        if (Array.isArray(parsed) && parsed.length) setCategories(parsed);
      }

      const storedMinPickup = localStorage.getItem("simpanwaste_min_pickup");
      if (storedMinPickup) {
        const parsed = Number(storedMinPickup);
        if (parsed > 0) setMinPickupState(parsed);
      }

      const storedPartners = localStorage.getItem("simpanwaste-partners");
      if (storedPartners) {
        const parsed = JSON.parse(storedPartners);
        if (Array.isArray(parsed) && parsed.length) setPartners(parsed);
      } else {
        localStorage.setItem("simpanwaste-partners", JSON.stringify(defaultPartners));
      }

      const storedDist = localStorage.getItem("simpanwaste-distributions");
      if (storedDist) {
        const parsed = JSON.parse(storedDist);
        if (Array.isArray(parsed) && parsed.length) setDistributions(parsed);
      } else {
        localStorage.setItem("simpanwaste-distributions", JSON.stringify(defaultDistributions));
      }

      const storedReports = localStorage.getItem("simpanwaste_reports");
      if (storedReports) {
        const parsed = JSON.parse(storedReports);
        if (Array.isArray(parsed) && parsed.length) setReports(parsed);
      }

      const storedWd = localStorage.getItem("simpanwaste_withdrawal_requests");
      if (storedWd) {
        const parsed = JSON.parse(storedWd);
        if (Array.isArray(parsed) && parsed.length) setWithdrawalRequests(parsed);
      }

      // Read admin session if available
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
  }, []);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((cur) => (cur === msg ? null : cur));
    }, 3500);
  }, []);

  const addUser = useCallback(
    (newUser: AdminUser) => {
      setUsers((prev) => {
        const updated = [...prev, newUser];
        if (typeof window !== "undefined") {
          localStorage.setItem("simpanwaste-users", JSON.stringify(updated));
        }
        return updated;
      });
      notify(`Akun ${newUser.name} berhasil ditambahkan.`);
    },
    [notify]
  );

  const updateUser = useCallback(
    (originalUsername: string, updatedData: AdminUser) => {
      setUsers((prev) => {
        const updated = prev.map((u) =>
          u.username === originalUsername ? updatedData : u
        );
        if (typeof window !== "undefined") {
          localStorage.setItem("simpanwaste-users", JSON.stringify(updated));
        }
        return updated;
      });
      notify("Perubahan akun berhasil disimpan.");
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
      notify("Akun berhasil dihapus.");
    },
    [notify]
  );

  const addCategory = useCallback(
    (cat: WasteCategoryMaster) => {
      setCategories((prev) => {
        const updated = [...prev, cat];
        if (typeof window !== "undefined") {
          localStorage.setItem("simpanwaste_categories", JSON.stringify(updated));
        }
        return updated;
      });
      notify("Kategori sampah baru berhasil ditambahkan.");
    },
    [notify]
  );

  const updateCategory = useCallback(
    (index: number, cat: WasteCategoryMaster) => {
      setCategories((prev) => {
        const updated = prev.map((item, idx) => (idx === index ? cat : item));
        if (typeof window !== "undefined") {
          localStorage.setItem("simpanwaste_categories", JSON.stringify(updated));
        }
        return updated;
      });
      notify("Kategori sampah berhasil diperbarui.");
    },
    [notify]
  );

  const deleteCategory = useCallback(
    (index: number) => {
      setCategories((prev) => {
        const catName = prev[index]?.name || "Kategori";
        const updated = prev.filter((_, idx) => idx !== index);
        if (typeof window !== "undefined") {
          localStorage.setItem("simpanwaste_categories", JSON.stringify(updated));
        }
        notify(`Kategori ${catName} berhasil dihapus.`);
        return updated;
      });
    },
    [notify]
  );

  const setMinPickup = useCallback(
    (val: number) => {
      setMinPickupState(val);
      if (typeof window !== "undefined") {
        localStorage.setItem("simpanwaste_min_pickup", String(val));
      }
      notify(`Batas minimum pickup disimpan menjadi ${val} kg.`);
    },
    [notify]
  );

  const addPartner = useCallback(
    (partner: Partner) => {
      setPartners((prev) => {
        const updated = [...prev, partner];
        if (typeof window !== "undefined") {
          localStorage.setItem("simpanwaste-partners", JSON.stringify(updated));
        }
        return updated;
      });
      notify(`Mitra ${partner.name} berhasil ditambahkan.`);
    },
    [notify]
  );

  const updatePartner = useCallback(
    (index: number, partner: Partner) => {
      setPartners((prev) => {
        const updated = prev.map((item, idx) => (idx === index ? partner : item));
        if (typeof window !== "undefined") {
          localStorage.setItem("simpanwaste-partners", JSON.stringify(updated));
        }
        return updated;
      });
      notify("Data mitra berhasil diperbarui.");
    },
    [notify]
  );

  const deletePartner = useCallback(
    (index: number) => {
      setPartners((prev) => {
        const name = prev[index]?.name || "Mitra";
        const updated = prev.filter((_, idx) => idx !== index);
        if (typeof window !== "undefined") {
          localStorage.setItem("simpanwaste-partners", JSON.stringify(updated));
        }
        notify(`Mitra ${name} berhasil dihapus.`);
        return updated;
      });
    },
    [notify]
  );

  const addDistribution = useCallback(
    (dist: Omit<DistributionRow, "id">) => {
      setDistributions((prev) => {
        const newId = `DST-${String(prev.length + 1).padStart(3, "0")}`;
        const newRow: DistributionRow = { id: newId, ...dist };
        const updated = [newRow, ...prev];
        if (typeof window !== "undefined") {
          localStorage.setItem("simpanwaste-distributions", JSON.stringify(updated));
        }
        return updated;
      });
      notify("Data distribusi baru berhasil ditambahkan.");
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

  const processWithdrawal = useCallback(
    (id: string, proof: { name: string; type: string; dataUrl: string }) => {
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
      notify("Permintaan berhasil diproses dan bukti transaksi tersimpan.");
    },
    [notify]
  );

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
    } finally {
      if (typeof window !== "undefined") {
        document.cookie = "simpanwaste_role=; path=/; max-age=0";
        document.cookie = "simpanwaste_user_session=; path=/; max-age=0";
        localStorage.removeItem("simpanwaste_user_session");
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
