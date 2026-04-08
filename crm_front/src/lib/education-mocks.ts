export type AppRole = "ADMIN" | "TEACHER" | "STUDENT";

export type DashboardSnapshot = {
  attendance_percentage: number;
  homework_percentage: number;
  attendance_history: number[];
  homework_history: number[];
  upcoming_homework: Array<{
    id: number;
    title: string;
    due_date: string;
  }>;
  next_lesson: {
    id: number;
    datetime: string;
    title: string;
  };
};

export type StudentRecord = {
  id: number;
  full_name: string;
  telegram_username: string;
  attendance_percentage: number;
  homework_percentage: number;
  attendance_history: number[];
  homework_history: number[];
  submissions?: StudentSubmission[];
};

export type ChatMessage = {
  id: number;
  type: "text" | "image";
  content: string;
  sender_name: string;
  sender_username: string;
  is_teacher: boolean;
  is_pinned: boolean;
  sent_at: string;
  image_url?: string;
};

export type VideoRecord = {
  id: number;
  title: string;
  uploaded_at: string;
  teacher: string;
  video_url: string;
  attached_homework_title?: string | null;
};

export type LibraryItem = {
  id: number;
  title: string;
  file_type: "pdf" | "audio" | "image";
  uploaded_at: string;
  file_url: string;
};

export type HomeworkRecord = {
  id: number;
  title: string;
  instructions: string;
  due_date: string;
  is_submitted: boolean;
};

export type StudentSubmission = {
  id: number;
  homework_title: string;
  submitted: boolean;
  submitted_at?: string;
  answer?: string;
};

export type TeacherRecord = {
  id: number;
  full_name: string;
  telegram_username: string;
};

export type LessonRecord = {
  id: number;
  title: string;
  scheduled_at: string;
  is_live: boolean;
  youtube_embed_url?: string;
};

export const mockDashboard: DashboardSnapshot = {
  attendance_percentage: 85,
  homework_percentage: 58,
  attendance_history: [70, 75, 80, 85, 85, 90, 85, 85],
  homework_history: [50, 60, 60, 70, 60, 65, 58, 58],
  upcoming_homework: [
    { id: 1, title: "Unit 3 Grammar Exercise", due_date: "2026-04-07" },
    { id: 2, title: "Reading Comprehension", due_date: "2026-04-09" },
  ],
  next_lesson: {
    id: 1,
    datetime: "2026-04-06T14:00:00",
    title: "Live Lesson 12",
  },
};

export const mockStudentSubmissions: StudentSubmission[] = [
  {
    id: 1,
    homework_title: "Unit 3 Grammar Exercise",
    submitted: true,
    submitted_at: "2026-04-05T18:20:00",
    answer:
      "I completed all grammar questions and wrote full example sentences for each conditional form.",
  },
  {
    id: 2,
    homework_title: "Reading Comprehension",
    submitted: false,
    answer: "",
  },
];

export const mockStudents: StudentRecord[] = [
  {
    id: 1,
    full_name: "Ali Karimov",
    telegram_username: "alikarimov",
    attendance_percentage: 90,
    homework_percentage: 75,
    attendance_history: [80, 85, 90, 90, 90, 95, 90, 90],
    homework_history: [70, 75, 75, 80, 75, 75, 75, 75],
    submissions: mockStudentSubmissions,
  },
  {
    id: 2,
    full_name: "Zara Yusupova",
    telegram_username: "zarayusup",
    attendance_percentage: 55,
    homework_percentage: 40,
    attendance_history: [60, 55, 50, 55, 55, 60, 55, 55],
    homework_history: [40, 45, 40, 40, 45, 40, 40, 40],
    submissions: [
      {
        id: 3,
        homework_title: "Unit 3 Grammar Exercise",
        submitted: false,
      },
      {
        id: 4,
        homework_title: "Reading Comprehension",
        submitted: false,
      },
    ],
  },
  {
    id: 3,
    full_name: "Bobur Toshmatov",
    telegram_username: "bobbur",
    attendance_percentage: 78,
    homework_percentage: 82,
    attendance_history: [75, 78, 80, 78, 78, 80, 78, 78],
    homework_history: [80, 82, 80, 85, 82, 82, 82, 82],
    submissions: [
      {
        id: 5,
        homework_title: "Unit 3 Grammar Exercise",
        submitted: true,
        submitted_at: "2026-04-05T16:05:00",
        answer:
          "I used the grammar chart and focused on accuracy first, then rewrote the answers into natural full sentences.",
      },
      {
        id: 6,
        homework_title: "Reading Comprehension",
        submitted: true,
        submitted_at: "2026-04-04T21:10:00",
        answer:
          "The passage focused on habit formation, and I summarized the main ideas in my own words.",
      },
    ],
  },
];

export const mockLesson = {
  id: 1,
  title: "Live Lesson 12",
  datetime: "2026-04-06T14:00:00",
  is_live: false,
  youtube_embed_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
};

export const mockMessages: ChatMessage[] = [
  {
    id: 1,
    type: "text",
    content: "Welcome everyone to today's lesson!",
    sender_name: "Komil Teacher",
    sender_username: "komilteacher",
    is_teacher: true,
    is_pinned: true,
    sent_at: "2026-04-06T14:00:30Z",
  },
  {
    id: 2,
    type: "text",
    content: "Today we cover conditionals",
    sender_name: "Komil Teacher",
    sender_username: "komilteacher",
    is_teacher: true,
    is_pinned: true,
    sent_at: "2026-04-06T14:01:00Z",
  },
  {
    id: 3,
    type: "text",
    content: "Can you explain zero conditional?",
    sender_name: "Ali Karimov",
    sender_username: "alikarimov",
    is_teacher: false,
    is_pinned: false,
    sent_at: "2026-04-06T14:02:00Z",
  },
  {
    id: 4,
    type: "text",
    content: "Check this video: https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    sender_name: "Komil Teacher",
    sender_username: "komilteacher",
    is_teacher: true,
    is_pinned: true,
    sent_at: "2026-04-06T14:03:00Z",
  },
];

export const mockVideos: VideoRecord[] = [
  { id: 1, title: "Lesson 10 Recording", uploaded_at: "2026-04-01", teacher: "Komil Teacher", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", attached_homework_title: "Unit 3 Grammar Exercise" },
  { id: 2, title: "Grammar: Past Perfect", uploaded_at: "2026-03-28", teacher: "Komil Teacher", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", attached_homework_title: "Past Perfect Worksheet" },
  { id: 3, title: "Vocabulary Unit 4", uploaded_at: "2026-03-25", teacher: "Komil Teacher", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", attached_homework_title: null },
  { id: 4, title: "Lesson 9 Recording", uploaded_at: "2026-03-22", teacher: "Komil Teacher", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", attached_homework_title: "Listening Reflection" },
  { id: 5, title: "Speaking Practice", uploaded_at: "2026-03-19", teacher: "Komil Teacher", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", attached_homework_title: null },
  { id: 6, title: "Writing Workshop", uploaded_at: "2026-03-16", teacher: "Komil Teacher", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", attached_homework_title: "Essay Draft" },
];

export const mockLibrary: LibraryItem[] = [
  { id: 1, title: "IELTS Grammar Guide", file_type: "pdf", uploaded_at: "2026-03-01", file_url: "#" },
  { id: 2, title: "Vocabulary List Unit 1-5", file_type: "pdf", uploaded_at: "2026-03-05", file_url: "#" },
  { id: 3, title: "Pronunciation Practice Audio", file_type: "audio", uploaded_at: "2026-03-10", file_url: "#" },
  { id: 4, title: "Listening Exercise 3", file_type: "audio", uploaded_at: "2026-03-15", file_url: "#" },
  { id: 5, title: "Grammar Chart", file_type: "image", uploaded_at: "2026-03-20", file_url: "https://placehold.co/1000x700/0f172a/e2e8f0?text=Grammar+Chart" },
  { id: 6, title: "Conditional Sentences Diagram", file_type: "image", uploaded_at: "2026-03-22", file_url: "https://placehold.co/1000x700/0f172a/e2e8f0?text=Conditionals" },
];

export const mockHomework: HomeworkRecord = {
  id: 1,
  title: "Unit 3 Grammar Exercise",
  instructions:
    "Complete the following grammar exercises. Use the grammar chart in the library for reference. Write full sentences for each answer. Minimum 150 words.",
  due_date: "2026-04-07T23:59:00",
  is_submitted: false,
};

export const mockLibraryForHomework: LibraryItem[] = [
  { id: 1, title: "IELTS Grammar Guide", file_type: "pdf", uploaded_at: "2026-03-01", file_url: "#" },
  { id: 2, title: "Grammar Chart", file_type: "image", uploaded_at: "2026-03-20", file_url: "https://placehold.co/1000x700/0f172a/e2e8f0?text=Grammar+Chart" },
];

export const mockLessons: LessonRecord[] = [
  { id: 1, title: "Live Lesson 12", scheduled_at: "2026-04-06T14:00:00", is_live: false, youtube_embed_url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  { id: 2, title: "Live Lesson 13", scheduled_at: "2026-04-08T14:00:00", is_live: false, youtube_embed_url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  { id: 3, title: "Live Lesson 14", scheduled_at: "2026-04-10T14:00:00", is_live: false, youtube_embed_url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  { id: 4, title: "Live Lesson 15", scheduled_at: "2026-04-13T14:00:00", is_live: false, youtube_embed_url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
];

export const mockTeachers: TeacherRecord[] = [
  { id: 1, full_name: "Komil Teacher", telegram_username: "komilteacher" },
  { id: 2, full_name: "Nodira Abdullaeva", telegram_username: "nodiraenglish" },
  { id: 3, full_name: "Sherzod Mamatkulov", telegram_username: "sherzod_cefr" },
];

export function extractYouTubeId(text: string): string | null {
  const match = text.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function buildWeeklyHistory(attendance: number[], homework: number[]) {
  return attendance.map((value, index) => ({
    week: `Week ${index + 1}`,
    attendance: value,
    homework: homework[index] ?? 0,
  }));
}

export function getProgressColor(value: number) {
  if (value > 80) return "#22c55e";
  if (value >= 60) return "#f97316";
  return "#ef4444";
}

export function getProgressTextClass(value: number) {
  if (value > 80) return "text-green-500";
  if (value >= 60) return "text-orange-500";
  return "text-red-500";
}

export function getProgressBgClass(value: number) {
  if (value > 80) return "bg-green-500";
  if (value >= 60) return "bg-orange-500";
  return "bg-red-500";
}

export function getDaysRemaining(dateValue: string) {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const target = new Date(dateValue);
  const targetStart = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  return Math.ceil((targetStart - todayStart) / 86400000);
}

export function formatDate(value: string, options?: Intl.DateTimeFormatOptions) {
  return new Date(value).toLocaleDateString(undefined, options ?? {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getCountdownParts(target: string, now = Date.now()) {
  const diff = Math.max(0, new Date(target).getTime() - now);
  return {
    total: diff,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export function formatCountdownUnit(value: number) {
  return String(value).padStart(2, "0");
}
