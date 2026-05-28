import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "";

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem("auth_token");
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  verifyFirebase: (firebaseToken: string, role: "tutor" | "guardian", phone: string) =>
    api.post<{ token: string; user: { id: string; name: string; phone: string; role: string } }>(
      "/api/auth/verify-firebase",
      { firebaseToken, role, phone }
    ),
  logout: () => api.post<void>("/api/auth/logout", {}),
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () =>
    api.get<{
      totalStudents: number;
      pendingFees: number;
      monthlyEarnings: number;
      todayClasses: number;
      overdueFees: number;
      presentToday: number;
    }>("/api/dashboard/stats"),
};

// ─── Students ────────────────────────────────────────────────────────────────
export const studentsApi = {
  list: (search?: string) =>
    api.get<import("../types").Student[]>(
      `/api/students${search ? `?search=${encodeURIComponent(search)}` : ""}`
    ),
  get: (id: string) => api.get<import("../types").Student>(`/api/students/${id}`),
};

// ─── Guardians ───────────────────────────────────────────────────────────────
export const guardiansApi = {
  list: () => api.get<import("../types").Guardian[]>("/api/guardians"),
  get: (id: string) => api.get<import("../types").Guardian>(`/api/guardians/${id}`),
};

// ─── Batches ─────────────────────────────────────────────────────────────────
export const batchesApi = {
  list: () => api.get<import("../types").Batch[]>("/api/batches"),
  get: (id: string) => api.get<import("../types").Batch>(`/api/batches/${id}`),
};

// ─── Attendance ──────────────────────────────────────────────────────────────
export const attendanceApi = {
  getSession: (batchId: string, date: string) =>
    api.get<import("../types").AttendanceSession>(
      `/api/attendance/${batchId}?date=${date}`
    ),
  saveSession: (
    batchId: string,
    date: string,
    records: import("../types").AttendanceRecord[]
  ) => api.post<void>("/api/attendance", { batchId, date, records }),
};

// ─── Fees ────────────────────────────────────────────────────────────────────
export const feesApi = {
  list: (status?: string) =>
    api.get<import("../types").Fee[]>(
      `/api/fees${status ? `?status=${status}` : ""}`
    ),
  recordPayment: (feeId: string, amount: number, method: string, note?: string) =>
    api.post<void>("/api/fees/payment", { feeId, amount, method, note }),
};

// ─── Notifications ───────────────────────────────────────────────────────────
export const notificationsApi = {
  list: () => api.get<import("../types").Notification[]>("/api/notifications"),
  markRead: (id: string) => api.patch<void>(`/api/notifications/${id}/read`, {}),
};

// ─── Schedule ────────────────────────────────────────────────────────────────
export const scheduleApi = {
  list: () => api.get<import("../types").ScheduleItem[]>("/api/schedule"),
};
