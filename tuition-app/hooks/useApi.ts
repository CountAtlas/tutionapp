/**
 * Centralised React Query hooks for all backend API calls.
 * All hooks read the auth token from AuthContext automatically.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "";

// ─── Generic fetcher ─────────────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  token: string | null,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ─── Types (mirrored from backend seed shapes) ────────────────────────────────
export interface ApiStudent {
  id: string;
  name: string;
  grade: string;
  feeStatus: "paid" | "pending" | "overdue";
  feeAmount: number;
  feePaid: number;
  attendancePercent: number;
  guardianName: string;
  guardianPhone: string;
  batchIds: string[];
  guardianId?: string;
}

export interface ApiBatch {
  id: string;
  name: string;
  subject: string;
  grade: string;
  schedule: string;
  time: string;
  days: string[];
  studentCount: number;
  teacherName?: string;
}

export interface ApiAttendanceSession {
  id: string;
  batchId: string;
  batchName: string;
  date: string;
  records: ApiAttendanceRecord[];
}

export interface ApiAttendanceRecord {
  studentId: string;
  studentName: string;
  status: "present" | "absent" | "late" | "unmarked";
}

export interface ApiFee {
  id: string;
  studentId: string;
  studentName: string;
  guardianPhone: string;
  month: string;
  amount: number;
  paid: number;
  status: "paid" | "pending" | "overdue";
  dueDate: string;
  paidDate?: string | null;
}

export interface ApiGuardian {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  students: { id: string; name: string; grade: string }[];
}

export interface ApiNotification {
  id: string;
  studentId?: string;
  studentName?: string;
  title: string;
  body: string;
  type: "fee" | "attendance" | "general" | "reminder";
  isRead: boolean;
  createdAt: string | Date;
}

export interface ApiScheduleSlot {
  id: string;
  batchId: string;
  batchName: string;
  subject: string;
  time: string;
  day: string;
  studentCount: number;
  room?: string;
  childNames?: string[];
}

export interface ApiDashboardStats {
  totalStudents: number;
  pendingFees: number;
  monthlyEarnings: number;
  todayClasses: number;
  overdueFees: number;
  presentToday: number;
}

export interface ApiParentChildBatch {
  id: string;
  name: string;
  subject: string;
  schedule: string;
  time: string;
  attendancePercent: number;
}

export interface ApiParentChild {
  id: string;
  name: string;
  grade: string;
  feeStatus: "paid" | "pending" | "overdue";
  feeAmount: number;
  feePaid: number;
  attendancePercent: number;
  batchIds: string[];
  batches?: ApiParentChildBatch[];
  todayClass?: { batchName: string; subject: string; time: string } | null;
}

export interface ApiAnnouncement {
  id: string;
  title: string;
  body: string;
  type: "test" | "holiday" | "general" | "reminder";
  date: string;
  batchIds: string[];
}

// ─── Tutor hooks ──────────────────────────────────────────────────────────────

export function useDashboardStats() {
  const { token } = useAuth();
  return useQuery<ApiDashboardStats>({
    queryKey: ["dashboard", "stats"],
    queryFn: () => apiFetch("/api/dashboard/stats", token),
    staleTime: 30_000,
  });
}

export function useStudents(search?: string) {
  const { token } = useAuth();
  const params = search ? `?search=${encodeURIComponent(search)}` : "";
  return useQuery<ApiStudent[]>({
    queryKey: ["students", search ?? ""],
    queryFn: () => apiFetch(`/api/students${params}`, token),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useStudent(id: string) {
  const { token } = useAuth();
  return useQuery<ApiStudent>({
    queryKey: ["students", id],
    queryFn: () => apiFetch(`/api/students/${id}`, token),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useBatches() {
  const { token } = useAuth();
  return useQuery<ApiBatch[]>({
    queryKey: ["batches"],
    queryFn: () => apiFetch("/api/batches", token),
    staleTime: 60_000,
  });
}

export function useBatch(id: string) {
  const { token } = useAuth();
  return useQuery<ApiBatch>({
    queryKey: ["batches", id],
    queryFn: () => apiFetch(`/api/batches/${id}`, token),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useAttendance(batchId: string, date?: string) {
  const { token } = useAuth();
  const params = date ? `?date=${date}` : "";
  return useQuery<ApiAttendanceSession>({
    queryKey: ["attendance", batchId, date ?? "today"],
    queryFn: () => apiFetch(`/api/attendance/${batchId}${params}`, token),
    enabled: !!batchId,
    staleTime: 10_000,
  });
}

export function useFees(status?: string) {
  const { token } = useAuth();
  const params = status ? `?status=${status}` : "";
  return useQuery<ApiFee[]>({
    queryKey: ["fees", status ?? "all"],
    queryFn: () => apiFetch(`/api/fees${params}`, token),
    staleTime: 30_000,
  });
}

export function useGuardians() {
  const { token } = useAuth();
  return useQuery<ApiGuardian[]>({
    queryKey: ["guardians"],
    queryFn: () => apiFetch("/api/guardians", token),
    staleTime: 60_000,
  });
}

export function useGuardian(id: string) {
  const { token } = useAuth();
  return useQuery<ApiGuardian>({
    queryKey: ["guardians", id],
    queryFn: () => apiFetch(`/api/guardians/${id}`, token),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useNotifications() {
  const { token } = useAuth();
  return useQuery<ApiNotification[]>({
    queryKey: ["notifications"],
    queryFn: () => apiFetch("/api/notifications", token),
    staleTime: 15_000,
  });
}

export function useSchedule(day?: string) {
  const { token } = useAuth();
  const params = day ? `?day=${day}` : "";
  return useQuery<ApiScheduleSlot[]>({
    queryKey: ["schedule", day ?? "all"],
    queryFn: () => apiFetch(`/api/schedule${params}`, token),
    staleTime: 60_000,
  });
}

// ─── Parent hooks ──────────────────────────────────────────────────────────────

export function useParentChildren() {
  const { token } = useAuth();
  return useQuery<ApiParentChild[]>({
    queryKey: ["parent", "children"],
    queryFn: () => apiFetch("/api/parent/children", token),
    staleTime: 30_000,
  });
}

export function useParentFees() {
  const { token } = useAuth();
  return useQuery<ApiFee[]>({
    queryKey: ["parent", "fees"],
    queryFn: () => apiFetch("/api/parent/fees", token),
    staleTime: 30_000,
  });
}

export function useParentSchedule(day?: string) {
  const { token } = useAuth();
  const params = day ? `?day=${day}` : "";
  return useQuery<ApiScheduleSlot[]>({
    queryKey: ["parent", "schedule", day ?? "all"],
    queryFn: () => apiFetch(`/api/parent/schedule${params}`, token),
    staleTime: 60_000,
  });
}

export function useParentAnnouncements() {
  const { token } = useAuth();
  return useQuery<ApiAnnouncement[]>({
    queryKey: ["parent", "announcements"],
    queryFn: () => apiFetch("/api/parent/announcements", token),
    staleTime: 60_000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useSubmitAttendance() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      batchId: string;
      date: string;
      records: ApiAttendanceRecord[];
    }) =>
      apiFetch<{ ok: boolean; saved: number }>("/api/attendance", token, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["attendance", vars.batchId] });
      qc.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
}

export function useRecordPayment() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      feeId: string;
      amount: number;
      method: string;
      note?: string;
    }) =>
      apiFetch<{ ok: boolean; fee: ApiFee }>("/api/fees/payment", token, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fees"] });
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
}

export function useMarkNotificationRead() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ ok: boolean }>(`/api/notifications/${id}/read`, token, {
        method: "PATCH",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
