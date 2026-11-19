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
  transactionsSeed,
  WithdrawalRequest,
  withdrawalRequestsSeed,
} from "@/data/wargaSeedData";
import { mapDbReportToUi, mapDbWithdrawalToUi } from "@/lib/utils/reportMapper";

interface WargaContextType {
  citizenProfile: UserProfile;
  setCitizenProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  reports: Report[];
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;
  transactions: typeof transactionsSeed;
  setTransactions: React.Dispatch<React.SetStateAction<typeof transactionsSeed>>;
  withdrawalRequests: WithdrawalRequest[];
  setWithdrawalRequests: React.Dispatch<React.SetStateAction<WithdrawalRequest[]>>;
  categories: typeof categoriesSeed;
  minPickup: number;
  toast: string;
  notify: (text: string) => void;
  user: any;
  handleLogout: () => Promise<void>;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const WargaContext = createContext<WargaContextType | null>(null);

const seedProfiles: Record<string, UserProfile> = {
  "ayu.lestari": {
    name: "Ayu Lestari",
    username: "ayu.lestari",
    phone: "0812 7788 2341",
    address: "Jl. Ki Merogan, Kertapati, Palembang",
  },
  "budi.s": {
    name: "Budi Santoso",
    username: "budi.s",
    phone: "0813 6900 1122",
    address: "Jl. Merdeka No. 24, Bukit Kecil, Palembang",
  },
  "siti.rahma": {
    name: "Siti Rahma",
    username: "siti.rahma",
    phone: "0852 6655 9012",
    address: "Jl. Mayor Zen, Kalidoni, Palembang",
  },
};

function readStoredUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("simpanwaste_user_session");
    if (raw) {
      const u = JSON.parse(raw);
      const username = (u.username || "").toLowerCase();
      const fallback = seedProfiles[username];
      return {
        name: u.nama || u.name || fallback?.name || "Warga SIMPANWASTE",
        username: username || fallback?.username || "warga",
        phone: u.no_hp || u.phone || fallback?.phone || "-",
        address: u.alamat || u.address || fallback?.address || "Palembang",
      };
    }
  } catch {}
  return null;
}

export function WargaProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [citizenProfile, setCitizenProfileState] = useState<UserProfile>({
    name: "",
    username: "",
    phone: "",
    address: "",
  });

  const [balance, setBalanceState] = useState<number>(0);
  const [reports, setReportsState] = useState<Report[]>([]);
  const [transactions, setTransactionsState] = useState<typeof transactionsSeed>([]);
  const [withdrawalRequests, setWithdrawalRequestsState] = useState<WithdrawalRequest[]>([]);

  const [categories, setCategoriesState] = useState(categoriesSeed);
  const [minPickup, setMinPickup] = useState(5);
  const [toast, setToast] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setCitizenProfile: React.Dispatch<React.SetStateAction<UserProfile>> = useCallback(
    (action) => {
      setCitizenProfileState((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        if (typeof window !== "undefined" && next.username) {
          try {
            const currentSession = localStorage.getItem("simpanwaste_user_session");
            const existing = currentSession ? JSON.parse(currentSession) : {};
            const merged = {
              ...existing,
              nama: next.name,
              name: next.name,
              username: next.username,
              no_hp: next.phone,
              phone: next.phone,
              alamat: next.address,
              address: next.address,
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

  const setReports: React.Dispatch<React.SetStateAction<Report[]>> = useCallback(
    (action) => {
      setReportsState((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        if (typeof window !== "undefined" && citizenProfile.username) {
          try {
            localStorage.setItem(
              `simpanwaste_reports_${citizenProfile.username}`,
              JSON.stringify(next)
            );
          } catch {}
        }
        return next;
      });
    },
    [citizenProfile.username]
  );

  const setBalance: React.Dispatch<React.SetStateAction<number>> = useCallback(
    (action) => {
      setBalanceState((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        if (typeof window !== "undefined" && citizenProfile.username) {
          try {
            localStorage.setItem(
              `simpanwaste_balance_${citizenProfile.username}`,
              String(next)
            );
          } catch {}
        }
        return next;
      });
    },
    [citizenProfile.username]
  );

  const setTransactions: React.Dispatch<React.SetStateAction<typeof transactionsSeed>> =
    useCallback(
      (action) => {
        setTransactionsState((prev) => {
          const next = typeof action === "function" ? action(prev) : action;
          if (typeof window !== "undefined" && citizenProfile.username) {
            try {
              localStorage.setItem(
                `simpanwaste_transactions_${citizenProfile.username}`,
                JSON.stringify(next)
              );
            } catch {}
          }
          return next;
        });
      },
      [citizenProfile.username]
    );

  const setWithdrawalRequests: React.Dispatch<React.SetStateAction<WithdrawalRequest[]>> =
    useCallback(
      (action) => {
        setWithdrawalRequestsState((prev) => {
          const next = typeof action === "function" ? action(prev) : action;
          if (typeof window !== "undefined" && citizenProfile.username) {
            try {
              localStorage.setItem(
                `simpanwaste_withdrawals_${citizenProfile.username}`,
                JSON.stringify(next)
              );
            } catch {}
          }
          return next;
        });
      },
      [citizenProfile.username]
    );

  // Fungsi untuk refresh data dari Supabase API secara live
  const refreshData = useCallback(async () => {
    try {
      // 1. Ambil Saldo & Transaksi dari Supabase
      const saldoRes = await fetch("/api/saldo");
      if (saldoRes.ok) {
        const saldoData = await saldoRes.json();
        if (typeof saldoData.saldo === "number") {
          setBalanceState(saldoData.saldo);
        }
        if (Array.isArray(saldoData.transaksi) && saldoData.transaksi.length > 0) {
          const mappedTx = saldoData.transaksi.map((t: any) => ({
            date: new Intl.DateTimeFormat("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(new Date(t.tanggal)),
            type: t.jenis === "setoran" ? "Setoran" : "Penarikan",
            weight: t.penimbangan?.total_berat ? `${t.penimbangan.total_berat} kg` : "-",
            value: Number(t.jumlah),
            balance: Number(t.saldo),
          }));
          setTransactionsState(mappedTx);
        }
      }

      // 2. Ambil Laporan Setoran dari Supabase
      const laporanRes = await fetch("/api/laporan");
      if (laporanRes.ok) {
        const lapData = await laporanRes.json();
        if (Array.isArray(lapData.data) && lapData.data.length > 0) {
          const mappedReports = lapData.data.map(mapDbReportToUi);
          setReportsState(mappedReports);
        }
      }

      // 3. Ambil Permintaan Penarikan dari Supabase
      const penarikanRes = await fetch("/api/penarikan");
      if (penarikanRes.ok) {
        const penData = await penarikanRes.json();
        if (Array.isArray(penData.data) && penData.data.length > 0) {
          const mappedWds = penData.data.map(mapDbWithdrawalToUi);
          setWithdrawalRequestsState(mappedWds);
        }
      }

      // 4. Ambil Batas Pickup Pengaturan Sistem
      const setRes = await fetch("/api/pengaturan");
      if (setRes.ok) {
        const setData = await setRes.json();
        if (setData.batas_minimum_pickup_kg) {
          setMinPickup(Number(setData.batas_minimum_pickup_kg));
        }
      }
    } catch (err) {
      console.warn("Gagal refresh data live Supabase:", err);
    }
  }, []);

  // Sync with server session and populate exact user data
  useEffect(() => {
    let mounted = true;

    // Check localStorage cache first
    const cached = readStoredUser();
    if (cached && cached.username) {
      setCitizenProfileState(cached);
      setIsLoading(false);
    }

    // Call /api/auth/me for live session check
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthenticated");
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        if (data.authenticated && data.user) {
          setUser(data.user);
          const username = (data.user.username || "").toLowerCase();
          const fallback = seedProfiles[username];
          const newProfile: UserProfile = {
            name: data.user.nama || data.user.name || fallback?.name || "Warga SIMPANWASTE",
            username: username || fallback?.username || "warga",
            phone: data.user.no_hp || data.user.phone || fallback?.phone || "-",
            address: data.user.alamat || data.user.address || fallback?.address || "Palembang",
          };

          setCitizenProfileState(newProfile);

          try {
            localStorage.setItem("simpanwaste_user_session", JSON.stringify(data.user));
            localStorage.setItem("simpanwaste_active_user", username);
          } catch {}

          // Panggil sinkronisasi data live
          refreshData();
        }
      })
      .catch(() => {
        if (mounted && !cached?.username) {
          router.push("/login");
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [router, refreshData]);

  const notify = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(""), 2800);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
    } finally {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("simpanwaste_user_session");
          localStorage.removeItem("simpanwaste_active_user");
        } catch {}
      }
      setUser(null);
      setCitizenProfileState({
        name: "",
        username: "",
        phone: "",
        address: "",
      });
      setReportsState([]);
      setBalanceState(0);
      setTransactionsState([]);
      setWithdrawalRequestsState([]);
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <WargaContext.Provider
      value={{
        citizenProfile,
        setCitizenProfile,
        balance,
        setBalance,
        reports,
        setReports,
        transactions,
        setTransactions,
        withdrawalRequests,
        setWithdrawalRequests,
        categories,
        minPickup,
        toast,
        notify,
        user,
        handleLogout,
        isLoading,
        refreshData,
      }}
    >
      {children}
    </WargaContext.Provider>
  );
}

export function useWarga() {
  const context = useContext(WargaContext);
  if (!context) {
    throw new Error("useWarga must be used within a WargaProvider");
  }
  return context;
}
