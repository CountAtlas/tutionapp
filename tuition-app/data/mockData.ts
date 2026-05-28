import {
  Announcement,
  Batch,
  DashboardStats,
  Fee,
  Guardian,
  Notification,
  ScheduleItem,
  Student,
} from "@/types";

export const TUTOR_WHATSAPP = "919999999999";

export const MOCK_STATS: DashboardStats = {
  totalStudents: 48,
  pendingFees: 12,
  monthlyEarnings: 86400,
  todayClasses: 4,
  overdueFees: 5,
  presentToday: 31,
};

export const MOCK_GUARDIANS: Guardian[] = [
  { id: "g1", name: "Rajesh Kumar", phone: "9876543210", whatsapp: "9876543210", studentIds: ["s1", "s2"], email: "rajesh@gmail.com", address: "12 MG Road, Bangalore" },
  { id: "g2", name: "Priya Sharma", phone: "9876543211", whatsapp: "9876543211", studentIds: ["s3"], email: "priya@gmail.com", address: "45 Brigade Road, Bangalore" },
  { id: "g3", name: "Anil Mehta", phone: "9876543212", whatsapp: "9876543212", studentIds: ["s4"], email: "anil@gmail.com", address: "78 Indiranagar, Bangalore" },
  { id: "g4", name: "Sunita Patel", phone: "9876543213", whatsapp: "9876543213", studentIds: ["s5"], email: "sunita@gmail.com", address: "23 Koramangala, Bangalore" },
  { id: "g5", name: "Vikram Nair", phone: "9876543214", whatsapp: "9876543214", studentIds: ["s6"], email: "vikram@gmail.com", address: "56 Whitefield, Bangalore" },
  { id: "g6", name: "Deepa Reddy", phone: "9876543215", whatsapp: "9876543215", studentIds: ["s7"], email: "deepa@gmail.com", address: "90 Electronic City, Bangalore" },
];

export const MOCK_STUDENTS: Student[] = [
  { id: "s1", name: "Arjun Kumar", grade: "10th", guardianId: "g1", guardianName: "Rajesh Kumar", guardianPhone: "9876543210", batchIds: ["b1", "b2"], feeStatus: "paid", feeAmount: 3000, feePaid: 3000, joinDate: "2024-06-01", attendancePercent: 92 },
  { id: "s2", name: "Anika Kumar", grade: "8th", guardianId: "g1", guardianName: "Rajesh Kumar", guardianPhone: "9876543210", batchIds: ["b3"], feeStatus: "pending", feeAmount: 2500, feePaid: 0, joinDate: "2024-07-15", attendancePercent: 85 },
  { id: "s3", name: "Rohan Sharma", grade: "12th", guardianId: "g2", guardianName: "Priya Sharma", guardianPhone: "9876543211", batchIds: ["b1", "b4"], feeStatus: "overdue", feeAmount: 4000, feePaid: 0, joinDate: "2024-05-10", attendancePercent: 78 },
  { id: "s4", name: "Sneha Mehta", grade: "9th", guardianId: "g3", guardianName: "Anil Mehta", guardianPhone: "9876543212", batchIds: ["b2"], feeStatus: "paid", feeAmount: 3000, feePaid: 3000, joinDate: "2024-08-01", attendancePercent: 96 },
  { id: "s5", name: "Kiran Patel", grade: "11th", guardianId: "g4", guardianName: "Sunita Patel", guardianPhone: "9876543213", batchIds: ["b4", "b5"], feeStatus: "pending", feeAmount: 3500, feePaid: 2000, joinDate: "2024-06-20", attendancePercent: 88 },
  { id: "s6", name: "Meera Nair", grade: "10th", guardianId: "g5", guardianName: "Vikram Nair", guardianPhone: "9876543214", batchIds: ["b1"], feeStatus: "paid", feeAmount: 3000, feePaid: 3000, joinDate: "2024-07-01", attendancePercent: 94 },
  { id: "s7", name: "Dev Reddy", grade: "7th", guardianId: "g6", guardianName: "Deepa Reddy", guardianPhone: "9876543215", batchIds: ["b3"], feeStatus: "overdue", feeAmount: 2000, feePaid: 0, joinDate: "2024-09-01", attendancePercent: 72 },
  { id: "s8", name: "Priya Singh", grade: "12th", guardianId: "g2", guardianName: "Priya Sharma", guardianPhone: "9876543211", batchIds: ["b4"], feeStatus: "pending", feeAmount: 4000, feePaid: 2500, joinDate: "2024-05-15", attendancePercent: 90 },
];

export const MOCK_BATCHES: Batch[] = [
  { id: "b1", name: "Maths 10th A", subject: "Mathematics", grade: "10th", schedule: "Mon, Wed, Fri", time: "4:00 PM - 5:30 PM", days: ["Mon", "Wed", "Fri"], studentCount: 12, teacherName: "Demo Tutor" },
  { id: "b2", name: "Science 9th", subject: "Science", grade: "9th", schedule: "Tue, Thu", time: "5:00 PM - 6:30 PM", days: ["Tue", "Thu"], studentCount: 10, teacherName: "Demo Tutor" },
  { id: "b3", name: "English 8th", subject: "English", grade: "8th", schedule: "Mon, Wed", time: "6:00 PM - 7:00 PM", days: ["Mon", "Wed"], studentCount: 8, teacherName: "Demo Tutor" },
  { id: "b4", name: "Physics 12th", subject: "Physics", grade: "12th", schedule: "Tue, Thu, Sat", time: "8:00 AM - 9:30 AM", days: ["Tue", "Thu", "Sat"], studentCount: 15, teacherName: "Demo Tutor" },
  { id: "b5", name: "Chemistry 11th", subject: "Chemistry", grade: "11th", schedule: "Mon, Wed, Fri", time: "7:00 AM - 8:30 AM", days: ["Mon", "Wed", "Fri"], studentCount: 13, teacherName: "Demo Tutor" },
];

export const MOCK_FEES: Fee[] = [
  { id: "f1", studentId: "s2", studentName: "Anika Kumar", guardianPhone: "9876543210", month: "January 2025", amount: 2500, paid: 0, status: "pending", dueDate: "2025-01-10" },
  { id: "f2", studentId: "s3", studentName: "Rohan Sharma", guardianPhone: "9876543211", month: "January 2025", amount: 4000, paid: 0, status: "overdue", dueDate: "2025-01-05" },
  { id: "f3", studentId: "s5", studentName: "Kiran Patel", guardianPhone: "9876543213", month: "January 2025", amount: 3500, paid: 2000, status: "pending", dueDate: "2025-01-10" },
  { id: "f4", studentId: "s7", studentName: "Dev Reddy", guardianPhone: "9876543215", month: "December 2024", amount: 2000, paid: 0, status: "overdue", dueDate: "2024-12-10" },
  { id: "f5", studentId: "s8", studentName: "Priya Singh", guardianPhone: "9876543211", month: "January 2025", amount: 4000, paid: 2500, status: "pending", dueDate: "2025-01-10" },
  { id: "f6", studentId: "s1", studentName: "Arjun Kumar", guardianPhone: "9876543210", month: "January 2025", amount: 3000, paid: 3000, status: "paid", dueDate: "2025-01-10", paidDate: "2025-01-08" },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "n1", title: "Fee Overdue", body: "Rohan Sharma's fee of ₹4,000 is overdue since Jan 5", type: "fee", studentId: "s3", studentName: "Rohan Sharma", isRead: false, createdAt: "2025-01-06T09:00:00Z" },
  { id: "n2", title: "Low Attendance", body: "Dev Reddy's attendance dropped below 75%", type: "attendance", studentId: "s7", studentName: "Dev Reddy", isRead: false, createdAt: "2025-01-05T10:00:00Z" },
  { id: "n3", title: "Fee Received", body: "Arjun Kumar paid ₹3,000 for January 2025", type: "fee", studentId: "s1", studentName: "Arjun Kumar", isRead: true, createdAt: "2025-01-04T14:30:00Z" },
  { id: "n4", title: "Reminder Sent", body: "WhatsApp reminder sent to Anika Kumar's guardian", type: "reminder", studentId: "s2", studentName: "Anika Kumar", isRead: true, createdAt: "2025-01-03T11:00:00Z" },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "a1",
    title: "Test on Monday — Mathematics",
    body: "Chapter 5 & 6 (Algebra). Please revise all formulas and practice exercises.",
    type: "test",
    date: "Jan 13, 2025",
    batchIds: ["b1"],
  },
  {
    id: "a2",
    title: "Holiday — Republic Day",
    body: "No classes on 26th January (Sunday) and 27th January (Monday). Classes resume on Tuesday.",
    type: "holiday",
    date: "Jan 12, 2025",
    batchIds: [],
  },
  {
    id: "a3",
    title: "New Study Material",
    body: "Physics notes for Chapter 8 (Optics) have been shared on the WhatsApp group. Please download.",
    type: "general",
    date: "Jan 10, 2025",
    batchIds: ["b4"],
  },
  {
    id: "a4",
    title: "Parent-Teacher Meeting",
    body: "PTM scheduled for Sunday, Jan 19th from 10 AM – 12 PM. Parents are encouraged to attend.",
    type: "reminder",
    date: "Jan 9, 2025",
    batchIds: [],
  },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const MOCK_SCHEDULE: ScheduleItem[] = [
  { id: "sc1", batchId: "b5", batchName: "Chemistry 11th", subject: "Chemistry", time: "7:00 AM", day: "Mon", studentCount: 13 },
  { id: "sc2", batchId: "b1", batchName: "Maths 10th A", subject: "Mathematics", time: "4:00 PM", day: "Mon", studentCount: 12 },
  { id: "sc3", batchId: "b3", batchName: "English 8th", subject: "English", time: "6:00 PM", day: "Mon", studentCount: 8 },
  { id: "sc4", batchId: "b4", batchName: "Physics 12th", subject: "Physics", time: "8:00 AM", day: "Tue", studentCount: 15 },
  { id: "sc5", batchId: "b2", batchName: "Science 9th", subject: "Science", time: "5:00 PM", day: "Tue", studentCount: 10 },
  { id: "sc6", batchId: "b5", batchName: "Chemistry 11th", subject: "Chemistry", time: "7:00 AM", day: "Wed", studentCount: 13 },
  { id: "sc7", batchId: "b1", batchName: "Maths 10th A", subject: "Mathematics", time: "4:00 PM", day: "Wed", studentCount: 12 },
  { id: "sc8", batchId: "b3", batchName: "English 8th", subject: "English", time: "6:00 PM", day: "Wed", studentCount: 8 },
  { id: "sc9", batchId: "b4", batchName: "Physics 12th", subject: "Physics", time: "8:00 AM", day: "Thu", studentCount: 15 },
  { id: "sc10", batchId: "b2", batchName: "Science 9th", subject: "Science", time: "5:00 PM", day: "Thu", studentCount: 10 },
  { id: "sc11", batchId: "b5", batchName: "Chemistry 11th", subject: "Chemistry", time: "7:00 AM", day: "Fri", studentCount: 13 },
  { id: "sc12", batchId: "b1", batchName: "Maths 10th A", subject: "Mathematics", time: "4:00 PM", day: "Fri", studentCount: 12 },
  { id: "sc13", batchId: "b4", batchName: "Physics 12th", subject: "Physics", time: "8:00 AM", day: "Sat", studentCount: 15 },
];

export function getTodaySchedule(): ScheduleItem[] {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = dayNames[new Date().getDay()];
  return MOCK_SCHEDULE.filter((s) => s.day === today);
}

export function getStudentsByIds(ids: string[]): Student[] {
  return MOCK_STUDENTS.filter((s) => ids.includes(s.id));
}

export function getFeesByStudentIds(ids: string[]): Fee[] {
  return MOCK_FEES.filter((f) => ids.includes(f.studentId));
}

export function getScheduleForBatchIds(batchIds: string[]): ScheduleItem[] {
  return MOCK_SCHEDULE.filter((sc) => batchIds.includes(sc.batchId));
}
