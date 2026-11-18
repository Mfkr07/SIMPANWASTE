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
}

const WargaContext = createContext<WargaContextType | null>(null);

// Standard seed accounts profile fallback
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

function getInitialReportsForUser(username: string, fullName: string): Report[] {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(`simpanwaste_reports_${username}`);
      if (saved) return JSON.parse(saved);
    } catch {}
  }

  const normalizedUser = (username || "").toLowerCase();
  const normalizedName = (fullName || "").toLowerCase();

  return initialReports.filter((r) => {
    const c = (r.citizen || "").toLowerCase();
    return c === normalizedName || c === normalizedUser;
  });
}

function getInitialBalanceForUser(username: string): number {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(`simpanwaste_balance_${username}`);
      if (saved !== null && !isNaN(Number(saved))) return Number(saved);
    } catch {}
  }

  if (username === "ayu.lestari") return 184600;
  if (username === "budi.s") return 48000;
  if (username === "siti.rahma") return 62500;
  return 0;
}

function getInitialTransactionsForUser(username: string) {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(`simpanwaste_transactions_${username}`);
      if (saved) return JSON.parse(saved);
    } catch {}
  }

  if (username === "ayu.lestari") return transactionsSeed;
  if (username === "budi.s")
    return [
      { date: "16 Mar 2025", type: "Setoran", weight: "4 kg", value: 11200, balance: 48000 },
      { date: "02 Mar 2025", type: "Setoran", weight: "12 kg", value: 36800, balance: 36800 },
    ];
  if (username === "siti.rahma")
    return [
      { date: "08 Mar 2025", type: "Setoran", weight: "7 kg", value: 14080, balance: 62500 },
    ];
  return [];
}

function getInitialWithdrawalsForUser(username: string): WithdrawalRequest[] {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(`simpanwaste_withdrawals_${username}`);
      if (saved) return JSON.parse(saved);
    } catch {}
  }

  return withdrawalRequestsSeed.filter(
    (w) => (w.citizenId || "").toLowerCase() === (username || "").toLowerCase()
  );
}

export function WargaProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  // Instant synchronous initialization from localStorage (ZERO JEDA / NO FLASH)
  const [citizenProfile, setCitizenProfileState] = useState<UserProfile>(() => {
    const cached = readStoredUser();
    return (
      cached || {
        name: "",
        username: "",
        phone: "",
        address: "",
      }
    );
  });

  const [balance, setBalanceState] = useState<number>(() => {
    const cached = readStoredUser();
    return cached ? getInitialBalanceForUser(cached.username) : 0;
  });

  const [reports, setReportsState] = useState<Report[]>(() => {
    const cached = readStoredUser();
    return cached ? getInitialReportsForUser(cached.username, cached.name) : [];
  });

  const [transactions, setTransactionsState] = useState<typeof transactionsSeed>(() => {
    const cached = readStoredUser();
    return cached ? getInitialTransactionsForUser(cached.username) : [];
  });

  const [withdrawalRequests, setWithdrawalRequestsState] = useState<WithdrawalRequest[]>(() => {
    const cached = readStoredUser();
    return cached ? getInitialWithdrawalsForUser(cached.username) : [];
  });

  const [categories] = useState(categoriesSeed);
  const [minPickup] = useState(5);
  const [toast, setToast] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Wrapper setters that automatically persist to user-scoped localStorage
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

  // Sync with server session and populate exact user data
  useEffect(() => {
    let mounted = true;

    // Check localStorage cache first
    const cached = readStoredUser();
    if (cached && cached.username) {
      if (!citizenProfile.username || citizenProfile.username !== cached.username) {
        setCitizenProfileState(cached);
        setBalanceState(getInitialBalanceForUser(cached.username));
        setReportsState(getInitialReportsForUser(cached.username, cached.name));
        setTransactionsState(getInitialTransactionsForUser(cached.username));
        setWithdrawalRequestsState(getInitialWithdrawalsForUser(cached.username));
      }
      setIsLoading(false);
    }

    // Call /api/auth/me for live session check
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Unauthenticated");
        }
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
          setBalanceState(getInitialBalanceForUser(username));
          setReportsState(getInitialReportsForUser(username, newProfile.name));
          setTransactionsState(getInitialTransactionsForUser(username));
          setWithdrawalRequestsState(getInitialWithdrawalsForUser(username));

          try {
            localStorage.setItem("simpanwaste_user_session", JSON.stringify(data.user));
            localStorage.setItem("simpanwaste_active_user", username);
          } catch {}
        }
      })
      .catch(() => {
        // If not authenticated and no cached profile, redirect to login
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
  }, [router]);

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
      }}
    >
      {children}
    </WargaContext.Provider>
  );
}

export function useWarga() {
  const ctx = useContext(WargaContext);
  if (!ctx) throw new Error("useWarga must be used within a WargaProvider");
  return ctx;
}
