"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  Report,
  UserProfile,
  categoriesSeed,
  initialReports,
  transactionsSeed,
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
  categories: typeof categoriesSeed;
  minPickup: number;
  toast: string;
  notify: (text: string) => void;
  user: any;
  handleLogout: () => Promise<void>;
}

const WargaContext = createContext<WargaContextType | null>(null);

export function WargaProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [citizenProfile, setCitizenProfile] = useState<UserProfile>({
    name: "Ayu Lestari",
    username: "ayu.lestari",
    phone: "0812 7788 2341",
    address: "Jl. Ki Merogan, Kertapati, Palembang",
  });

  const [balance, setBalance] = useState<number>(184600);
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [transactions, setTransactions] = useState(transactionsSeed);
  const [categories] = useState(categoriesSeed);
  const [minPickup] = useState(5);
  const [toast, setToast] = useState("");
  const [user, setUser] = useState<any>(null);

  // Sync with real authenticated session if available
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
          setCitizenProfile((prev) => ({
            ...prev,
            name: data.user.nama || prev.name,
            username: data.user.username || prev.username,
            phone: data.user.no_hp || prev.phone,
            address: data.user.alamat || prev.address,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const notify = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(""), 2800);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
    } finally {
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
        categories,
        minPickup,
        toast,
        notify,
        user,
        handleLogout,
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

