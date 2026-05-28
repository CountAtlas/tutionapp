export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: "tutor" | "guardian";
  token?: string;
  linkedStudentIds?: string[];
}

export interface Guardian {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  whatsapp?: string;
  studentIds: string[];
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  phone?: string;
  guardianId: string;
  guardianName: string;
  guardianPhone: string;
  batchIds: string[];
  feeStatus: "paid" | "pending" | "overdue";
  feeAmount: number;
  feePaid: number;
  joinDate: string;
  attendancePercent: number;
}

export interface Batch {
  id: string;
  name: string;
  subject: string;
  grade: string;
  schedule: string;
  time: string;
  days: string[];
  studentCount: number;
  teacherName: string;
}

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: "present" | "absent" | "late" | "unmarked";
}

export interface AttendanceSession {
  id: string;
  batchId: string;
  batchName: string;
  date: string;
  records: AttendanceRecord[];
}

export interface Fee {
  id: string;
  studentId: string;
  studentName: string;
  guardianPhone: string;
  month: string;
  amount: number;
  paid: number;
  status: "paid" | "pending" | "overdue";
  dueDate: string;
  paidDate?: string;
}

export interface Payment {
  id: string;
  feeId: string;
  amount: number;
  date: string;
  method: "cash" | "upi" | "bank";
  note?: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: "fee" | "attendance" | "general" | "reminder";
  studentId?: string;
  studentName?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  type: "test" | "holiday" | "general" | "reminder";
  date: string;
  batchIds?: string[];
}

export interface DashboardStats {
  totalStudents: number;
  pendingFees: number;
  monthlyEarnings: number;
  todayClasses: number;
  overdueFees: number;
  presentToday: number;
}

export interface ScheduleItem {
  id: string;
  batchId: string;
  batchName: string;
  subject: string;
  time: string;
  day: string;
  studentCount: number;
  room?: string;
}
