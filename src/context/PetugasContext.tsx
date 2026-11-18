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

  // Consistent baseline for SSR and client hydration
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

  // Sync state on client mount from localStorage / live session
  useEffect(() => {
    let mounted = true;

    // Check cached session
    const cachedUser = readStoredOfficer();
    if (cachedUser) {
      setOfficerProfileState(cachedUser);
    }

    // Check cached reports
    if (typeof window !== "undefined") {
      try {
        const savedReports = localStorage.getItem("simpanwaste_shared_reports");
        if (savedReports) {
          const parsed = JSON.parse(savedReports);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setReportsState(parsed);
          }
        }

        const savedPickedUp = localStorage.getItem("simpanwaste_picked_up_reports");
        if (savedPickedUp) {
          const parsed = JSON.parse(savedPickedUp);
          if (Array.isArray(parsed)) {
            setPickedUpReportsState(parsed);
          }
        }
      } catch {}
    }

    // Check live auth session from API
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthenticated");
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        if (data.authenticated && data.user) {
          if (data.user.peran === "petugas") {
            const profile: OfficerProfile = {
              name: data.user.nama || data.user.name || defaultOfficer.name,
              username: (data.user.username || defaultOfficer.username).toLowerCase(),
              phone: data.user.no_hp || data.user.phone || defaultOfficer.phone,
              address: data.user.alamat || data.user.address || defaultOfficer.address,
              role: "petugas",
            };
            setOfficerProfileState(profile);
            try {
              localStorage.setItem("simpanwaste_user_session", JSON.stringify(data.user));
              localStorage.setItem("simpanwaste_active_user", profile.username);
            } catch {}
          }
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  // Update reports and persist
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

  // Update pickedUpReports and persist
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

  // Update officer profile
  const setOfficerProfile: React.Dispatch<React.SetStateAction<OfficerProfile>> = useCallback(
    (action) => {
      setOfficerProfileState((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("simpanwaste_user_session");
            const existing = raw ? JSON.parse(raw) : {};
            const merged = {
              ...existing,
              nama: next.name,
              name: next.name,
              username: next.username,
              no_hp: next.phone,
              phone: next.phone,
              alamat: next.address,
              address: next.address,
              peran: "petugas",
            };
            localStorage.setItem("simpanwaste_user_session", JSON.stringify(merged));
            localStorage.setItem("simpanwaste_active_user", next.username);
          } catch {}
        }
        return next;
      });
    },
    []
  );

  // Add tracker stage to a report
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

  // Complete verification & credit citizen balance
  const completeVerification = useCallback(
    (
      reportId: string,
      verifiedItems: NonNullable<Report["verifiedItems"]>,
      totalActualWeight: number,
      totalValue: number
    ) => {
      let targetCitizen = "";
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

      // If citizen balance cache exists, update it
      if (typeof window !== "undefined" && targetCitizen) {
        try {
          const citizenKey =
            targetCitizen.toLowerCase().includes("ayu")
              ? "ayu.lestari"
              : targetCitizen.toLowerCase().includes("budi")
              ? "budi.s"
              : targetCitizen.toLowerCase().includes("siti")
              ? "siti.rahma"
              : "";
          if (citizenKey) {
            const rawBal = localStorage.getItem(`simpanwaste_balance_${citizenKey}`);
            const curBal = rawBal !== null ? Number(rawBal) : 184600;
            const newBal = curBal + totalValue;
            localStorage.setItem(`simpanwaste_balance_${citizenKey}`, String(newBal));
          }
        } catch {}
      }

      notify(`Penimbangan selesai. Saldo ${money(totalValue)} berhasil diverifikasi.`);
    },
    [notify, setReports]
  );

  // Logout handler
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
        setOfficerProfile,
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
