"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Calendar, Users, Plus, BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Student = {
  id: string;
  name: string;
  email: string;
};

type Homework = {
  id: string;
  title: string;
  description: string;
  instructions: string;
  due_date: string;
  subject: string;
  students_count: number;
  submissions_count: number;
  created_at: string;
};

export default function TeacherHomeworkPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  async function fetchData() {
    try {
      const [homeworksRes, studentsRes] = await Promise.all([
        fetch("/api/homework"),
        fetch("/api/users?role=student"),
      ]);

      if (homeworksRes.ok) {
        const homeworksData = await homeworksRes.json();
        setHomeworks(Array.isArray(homeworksData) ? homeworksData : []);
      }

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(Array.isArray(studentsData) ? studentsData : []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateHomework(e: React.FormEvent) {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          instructions: instructions.trim(),
          due_date: dueDate,
          subject: subject.trim() || null,
          student_ids: selectedStudents,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create homework");
      }

      toast.success("Homework created successfully!");
      setShowCreateForm(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to create homework");
    } finally {
      setCreating(false);
    }
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setInstructions("");
    setDueDate("");
    setSubject("");
    setSelectedStudents([]);
  }

  function toggleStudent(studentId: string) {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  }

  function selectAllStudents() {
    setSelectedStudents(students.map((s) => s.id));
  }

  function deselectAllStudents() {
    setSelectedStudents([]);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function getDaysRemaining(dueDate: string) {
    const diff = new Date(dueDate).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  }

  // Check if user is teacher or admin
  const isTeacherOrAdmin = session?.user?.role === "TEACHER" || session?.user?.role === "ADMIN";

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isTeacherOrAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-md">
          <div className="mb-6 inline-flex rounded-full bg-red-100 p-4">
            <BookOpen className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">Only teachers and administrators can access this page.</p>
          <button
            onClick={() => router.push("/homework")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Student Homework
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Homework Management</h1>
          <p className="text-gray-600 mt-2">Create and manage homework assignments</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Create Homework
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Create New Homework</h2>
          <form onSubmit={handleCreateHomework} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Grammar Exercise 5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., English Grammar"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Brief description of the homework"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Detailed instructions for students"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Assign to Students ({selectedStudents.length} selected)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllStudents}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Select All
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    type="button"
                    onClick={deselectAllStudents}
                    className="text-sm text-gray-600 hover:text-gray-700"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                {students.length === 0 ? (
                  <p className="text-gray-500 text-sm">No students found</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {students.map((student) => (
                      <label
                        key={student.id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => toggleStudent(student.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{student.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Homework
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Homework List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {homeworks.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No homework assignments yet</p>
            <p className="text-sm text-gray-400 mt-2">Click "Create Homework" to get started</p>
          </div>
        ) : (
          homeworks.map((homework) => {
            const daysLeft = getDaysRemaining(homework.due_date);
            const isOverdue = daysLeft < 0;
            const submissionRate = homework.students_count > 0
              ? Math.round((homework.submissions_count / homework.students_count) * 100)
              : 0;

            return (
              <div
                key={homework.id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">{homework.title}</h3>
                  {homework.subject && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {homework.subject}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{homework.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {formatDate(homework.due_date)}</span>
                    <span
                      className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${
                        isOverdue
                          ? "bg-red-100 text-red-800"
                          : daysLeft <= 2
                          ? "bg-orange-100 text-orange-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {isOverdue ? "Overdue" : `${daysLeft}d left`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{homework.students_count} students assigned</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Submissions</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {homework.submissions_count}/{homework.students_count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        submissionRate === 100
                          ? "bg-green-500"
                          : submissionRate >= 50
                          ? "bg-blue-500"
                          : "bg-orange-500"
                      }`}
                      style={{ width: `${submissionRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{submissionRate}% completed</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
