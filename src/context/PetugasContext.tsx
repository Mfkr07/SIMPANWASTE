"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import {
  Report,
  UserProfile,
  categoriesSeed,
  initialReports,
  wasteConditions,
  WasteCondition,
  TrackerStage,
  trackerTimestamp,
  money,
} from "@/data/wargaSeedData";
import { getCategoryUuid } from "@/lib/utils/categoryMapping";
import { mapDbReportToUi } from "@/lib/utils/reportMapper";

export interface OfficerProfile {
  name: string;
  username: string;
  phone: string;
  address: string;
  role: "petugas";
}

const defaultOfficer: OfficerProfile = {
  name: "Rizky Pratama",
  username: "rizky.p",
  phone: "0813 7781 2240",
  address: "Jl. Rajawali, Ilir Timur II, Palembang",
  role: "petugas",
};

interface PetugasContextType {
  officerProfile: OfficerProfile;
  setOfficerProfile: React.Dispatch<React.SetStateAction<OfficerProfile>>;
  reports: Report[];
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;
  pickedUpReports: string[];
  setPickedUpReports: React.Dispatch<React.SetStateAction<string[]>>;
  categories: typeof categoriesSeed;
  toast: string;
  notify: (text: string) => void;
  handleLogout: () => Promise<void>;
  addTrackerStage: (reportId: string, stage: TrackerStage) => void;
  completeVerification: (
    reportId: string,
    verifiedItems: any[],
    totalActualWeight: number,
    totalValue: number
  ) => void;
  refreshReports: () => Promise<void>;
}

const PetugasContext = createContext<PetugasContextType | null>(null);

function readStoredOfficer(): OfficerProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("simpanwaste_user_session");
    if (raw) {
      const u = JSON.parse(raw);
      if (u.peran === "petugas" || u.role === "petugas") {
        return {
          name: u.nama || u.name || defaultOfficer.name,
          username: (u.username || defaultOfficer.username).toLowerCase(),
          phone: u.no_hp || u.phone || defaultOfficer.phone,
          address: u.alamat || u.address || defaultOfficer.address,
          role: "petugas",
        };
      }
    }
  } catch {}
  return null;
}

export function PetugasProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [officerProfile, setOfficerProfileState] = useState<OfficerProfile>(defaultOfficer);
  const [reports, setReportsState] = useState<Report[]>(initialReports);
  const [pickedUpReports, setPickedUpReportsState] = useState<string[]>([]);
  const [categories] = useState(categoriesSeed);
  const [toast, setToast] = useState("");

  const notify = useCallback((text: string) => {
    setToast(text);
    const timer = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timer);
  }, []);

  const refreshReports = useCallback(async () => {
    try {
      const res = await fetch("/api/laporan");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.data) && data.data.length > 0) {
          const liveReports = data.data.map(mapDbReportToUi);
          setReportsState(liveReports);
          return;
        }
      }
    } catch (e) {
      console.warn("Gagal fetch laporan Supabase di PetugasContext:", e);
    }
  }, []);

  // Sync state on client mount from localStorage / live session
  useEffect(() => {
    let mounted = true;

    const cachedUser = readStoredOfficer();
    if (cachedUser) {
      setOfficerProfileState(cachedUser);
    }

    // Ambil sesi petugas dari server
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthenticated");
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        if (data.authenticated && data.user) {
          if (data.user.peran === "petugas" || data.user.role === "petugas") {
            setOfficerProfileState({
              name: data.user.nama || data.user.name || defaultOfficer.name,
              username: (data.user.username || defaultOfficer.username).toLowerCase(),
              phone: data.user.no_hp || data.user.phone || defaultOfficer.phone,
              address: data.user.alamat || data.user.address || defaultOfficer.address,
              role: "petugas",
            });
          }
        }
      })
      .catch(() => {});

    // Muat laporan live dari Supabase
    refreshReports();

    return () => {
      mounted = false;
    };
  }, [refreshReports]);

  const setReports: React.Dispatch<React.SetStateAction<Report[]>> = useCallback(
    (action) => {
      setReportsState((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("simpanwaste_shared_reports", JSON.stringify(next));
          } catch {}
        }
        return next;
      });
    },
    []
  );

  const setPickedUpReports: React.Dispatch<React.SetStateAction<string[]>> = useCallback(
    (action) => {
      setPickedUpReportsState((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("simpanwaste_picked_up_reports", JSON.stringify(next));
          } catch {}
        }
        return next;
      });
    },
    []
  );

  const addTrackerStage = useCallback(
    (reportId: string, stage: TrackerStage) => {
      setReports((prev) =>
        prev.map((r) => {
          if (r.id !== reportId) return r;
          const history = r.trackerHistory?.length
            ? r.trackerHistory
            : [{ stage: "Request Terkirim" as TrackerStage, timestamp: r.date }];
          if (history.some((h) => h.stage === stage)) return r;
          return {
            ...r,
            trackerHistory: [...history, { stage, timestamp: trackerTimestamp() }],
          };
        })
      );
    },
    [setReports]
  );

  // Complete verification: call Supabase RPC & credit balance
  const completeVerification = useCallback(
    (
      reportId: string,
      verifiedItems: NonNullable<Report["verifiedItems"]>,
      totalActualWeight: number,
      totalValue: number
    ) => {
      let targetCitizen = "";

      // 1. Kirim penimbangan ke Supabase RPC via API
      const itemsPayload = verifiedItems.map((item) => {
        const idKat = getCategoryUuid(item.category);
        let kondisi: "bersih" | "kotor" | "tercampur_air" = "bersih";
        const cond = (item.verifiedCondition || item.citizenConditions?.[0] || "").toLowerCase();
        if (cond.includes("bersih") || cond.includes("sudah dipilah")) {
          kondisi = "bersih";
        } else if (cond.includes("kotor") || cond.includes("belum")) {
          kondisi = "kotor";
        } else {
          kondisi = "tercampur_air";
        }
        return {
          id_kategori: idKat,
          berat_aktual: Number(item.actualWeight || 1),
          kondisi,
        };
      });

      fetch("/api/penimbangan/proses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_laporan: reportId,
          items: itemsPayload,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            notify(`Penimbangan dicatat ke Supabase! Saldo baru nasabah: ${money(data.data?.saldo_baru ?? totalValue)}`);
            refreshReports();
          } else {
            notify(`Hasil penimbangan disimpan: ${money(totalValue)}`);
          }
        })
        .catch(() => {
          notify(`Penimbangan disimpan secara lokal: ${money(totalValue)}`);
        });

      // 2. Update state lokal untuk tampilan instan
      setReports((prev) =>
        prev.map((item) => {
          if (item.id !== reportId) return item;
          targetCitizen = item.citizen;
          const history = item.trackerHistory?.length
            ? item.trackerHistory
            : [{ stage: "Request Terkirim" as TrackerStage, timestamp: item.date }];
          const completedHistory: NonNullable<Report["trackerHistory"]> = [
            ...history.filter(
              (h) =>
                h.stage !== "Petugas Memverifikasi" &&
                h.stage !== "Poin Saldo Didapatkan"
            ),
            { stage: "Petugas Memverifikasi", timestamp: trackerTimestamp() },
            { stage: "Poin Saldo Didapatkan", timestamp: trackerTimestamp() },
          ];
          return {
            ...item,
            status: "Selesai",
            actual: totalActualWeight,
            value: totalValue,
            verifiedItems,
            trackerHistory: completedHistory,
            weighingPhotoDrafts: undefined,
          };
        })
      );
    },
    [notify, refreshReports, setReports]
  );

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {} finally {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("simpanwaste_user_session");
          localStorage.removeItem("simpanwaste_active_user");
        } catch {}
      }
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <PetugasContext.Provider
      value={{
        officerProfile,
        setOfficerProfile: setOfficerProfileState,
        reports,
        setReports,
        pickedUpReports,
        setPickedUpReports,
        categories,
        toast,
        notify,
        handleLogout,
        addTrackerStage,
        completeVerification,
        refreshReports,
      }}
    >
      {children}
    </PetugasContext.Provider>
  );
}

export function usePetugas() {
  const context = useContext(PetugasContext);
  if (!context) {
    throw new Error("usePetugas must be used within a PetugasProvider");
  }
  return context;
}
