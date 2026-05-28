import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { User } from "@/types";

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";
const PIN_KEY = "auth_pin";
const PIN_PHONE_KEY = "auth_pin_phone";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  completeAuth: (
    firebaseToken: string,
    role: "tutor" | "guardian",
    phone: string
  ) => Promise<void>;
  setupPin: (pin: string) => Promise<void>;
  verifyPin: (phone: string, pin: string) => Promise<boolean>;
  hasPinForPhone: (phone: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isLoading: true,
  completeAuth: async () => {},
  setupPin: async () => {},
  verifyPin: async () => false,
  hasPinForPhone: async () => false,
  logout: async () => {},
});

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "";

function roleHome(role: "tutor" | "guardian"): string {
  return role === "guardian" ? "/(parent)" : "/(tabs)";
}

async function callVerifyFirebase(
  firebaseToken: string,
  role: "tutor" | "guardian",
  phone: string
): Promise<{ token: string; user: User }> {
  const res = await fetch(`${BASE_URL}/api/auth/verify-firebase`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firebaseToken, role, phone }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Auth failed" }));
    throw new Error(err.message || "Authentication failed");
  }

  return res.json();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await AsyncStorage.multiGet([
          AUTH_TOKEN_KEY,
          AUTH_USER_KEY,
        ]);
        const tok = storedToken[1];
        const usr = storedUser[1];
        if (tok && usr) {
          const parsedUser: User = JSON.parse(usr);
          setToken(tok);
          setUser(parsedUser);
          setIsLoading(false);
          router.replace(roleHome(parsedUser.role) as any);
        } else {
          setIsLoading(false);
          router.replace("/auth/phone");
        }
      } catch {
        setIsLoading(false);
        router.replace("/auth/phone");
      }
    })();
  }, []);

  const completeAuth = useCallback(
    async (
      firebaseToken: string,
      role: "tutor" | "guardian",
      phone: string
    ) => {
      const { token: sessionToken, user: sessionUser } =
        await callVerifyFirebase(firebaseToken, role, phone);

      await AsyncStorage.multiSet([
        [AUTH_TOKEN_KEY, sessionToken],
        [AUTH_USER_KEY, JSON.stringify(sessionUser)],
      ]);
      setToken(sessionToken);
      setUser(sessionUser);
    },
    []
  );

  const setupPin = useCallback(async (pin: string) => {
    const storedUser = await AsyncStorage.getItem(AUTH_USER_KEY);
    if (!storedUser) return;
    const u: User = JSON.parse(storedUser);
    await AsyncStorage.multiSet([
      [PIN_PHONE_KEY, u.phone],
      [PIN_KEY, pin],
    ]);
  }, []);

  const hasPinForPhone = useCallback(
    async (phone: string): Promise<boolean> => {
      const [[, pinPhone], [, pin]] = await AsyncStorage.multiGet([
        PIN_PHONE_KEY,
        PIN_KEY,
      ]);
      return pinPhone === phone && !!pin;
    },
    []
  );

  const verifyPin = useCallback(
    async (phone: string, pin: string): Promise<boolean> => {
      const [[, storedPhone], [, storedPin], [, storedToken], [, storedUser]] =
        await AsyncStorage.multiGet([
          PIN_PHONE_KEY,
          PIN_KEY,
          AUTH_TOKEN_KEY,
          AUTH_USER_KEY,
        ]);

      if (storedPhone !== phone || storedPin !== pin) return false;
      if (!storedToken || !storedUser) return false;

      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      return true;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).catch(() => {});
    } finally {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
      setToken(null);
      setUser(null);
      router.replace("/auth/phone");
    }
  }, [router, token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        completeAuth,
        setupPin,
        verifyPin,
        hasPinForPhone,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
