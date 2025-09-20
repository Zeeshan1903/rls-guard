import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import type { Database } from '@/lib/database.types';

export default async function Home() {
  const supabase = await createClient();
  // Fetch all tables
  const { data: schools } = await supabase.from('schools').select('*');
  const { data: users } = await supabase.from('user_profiles').select('*');
  const { data: classrooms } = await supabase.from('classrooms').select('*');
  const { data: progress } = await supabase.from('progress').select('*');
  const { data: studentClassrooms } = await supabase.from('student_classrooms').select('*');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 p-8">

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-4 mb-8">
          <Link href="/" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition">Home</Link>
          <Link href="/login" className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition">Login</Link>
          <Link href="/teacher" className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold shadow hover:bg-purple-700 transition">Teacher Dashboard</Link>
          <Link href="/unauthorized" className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition">Unauthorized</Link>
        </nav>
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-blue-700 dark:text-blue-300 mb-2 drop-shadow-lg">RLS Guard Dog - All Data Overview</h1>
          <p className="text-lg text-gray-700 dark:text-gray-200">Supabase RLS • Supabase Auth • Next.js • MongoDB</p>
        </header>

        {/* Schools */}
        <section className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-purple-700 mb-4">Schools</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-purple-100 dark:bg-gray-800">
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Created At</th>
                </tr>
              </thead>
              <tbody>
                {schools?.map((s: Database['public']['Tables']['schools']['Row']) => (
                  <tr key={s.id} className="even:bg-purple-50 dark:even:bg-gray-800">
                    <td className="px-4 py-2">{s.id}</td>
                    <td className="px-4 py-2">{s.name}</td>
                    <td className="px-4 py-2">{s.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Users */}
        <section className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">User Profiles</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-blue-100 dark:bg-gray-800">
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">School ID</th>
                  <th className="px-4 py-2">Full Name</th>
                  <th className="px-4 py-2">Created At</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((u: Database['public']['Tables']['user_profiles']['Row']) => (
                  <tr key={u.id} className="even:bg-blue-50 dark:even:bg-gray-800">
                    <td className="px-4 py-2">{u.id}</td>
                    <td className="px-4 py-2">{u.email}</td>
                    <td className="px-4 py-2 font-semibold">{u.role}</td>
                    <td className="px-4 py-2">{u.school_id}</td>
                    <td className="px-4 py-2">{u.full_name}</td>
                    <td className="px-4 py-2">{u.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Classrooms */}
        <section className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Classrooms</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-green-100 dark:bg-gray-800">
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">School ID</th>
                  <th className="px-4 py-2">Teacher ID</th>
                  <th className="px-4 py-2">Subject</th>
                  <th className="px-4 py-2">Grade Level</th>
                  <th className="px-4 py-2">Created At</th>
                </tr>
              </thead>
              <tbody>
                {classrooms?.map((c: Database['public']['Tables']['classrooms']['Row']) => (
                  <tr key={c.id} className="even:bg-green-50 dark:even:bg-gray-800">
                    <td className="px-4 py-2">{c.id}</td>
                    <td className="px-4 py-2">{c.name}</td>
                    <td className="px-4 py-2">{c.school_id}</td>
                    <td className="px-4 py-2">{c.teacher_id}</td>
                    <td className="px-4 py-2">{c.subject}</td>
                    <td className="px-4 py-2">{c.grade_level}</td>
                    <td className="px-4 py-2">{c.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Progress */}
        <section className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-pink-700 mb-4">Progress Records</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-pink-100 dark:bg-gray-800">
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Student ID</th>
                  <th className="px-4 py-2">Classroom ID</th>
                  <th className="px-4 py-2">School ID</th>
                  <th className="px-4 py-2">Score</th>
                  <th className="px-4 py-2">Assignment</th>
                  <th className="px-4 py-2">Date Submitted</th>
                  <th className="px-4 py-2">Notes</th>
                  <th className="px-4 py-2">Created At</th>
                </tr>
              </thead>
              <tbody>
                {progress?.map((p: Database['public']['Tables']['progress']['Row']) => (
                  <tr key={p.id} className="even:bg-pink-50 dark:even:bg-gray-800">
                    <td className="px-4 py-2">{p.id}</td>
                    <td className="px-4 py-2">{p.student_id}</td>
                    <td className="px-4 py-2">{p.classroom_id}</td>
                    <td className="px-4 py-2">{p.school_id}</td>
                    <td className="px-4 py-2">{p.score}</td>
                    <td className="px-4 py-2">{p.assignment_name}</td>
                    <td className="px-4 py-2">{p.date_submitted}</td>
                    <td className="px-4 py-2">{p.notes}</td>
                    <td className="px-4 py-2">{p.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Student Classrooms */}
        <section className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-yellow-700 mb-4">Student Classrooms</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-yellow-100 dark:bg-gray-800">
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Student ID</th>
                  <th className="px-4 py-2">Classroom ID</th>
                  <th className="px-4 py-2">School ID</th>
                  <th className="px-4 py-2">Enrolled At</th>
                </tr>
              </thead>
              <tbody>
                {studentClassrooms?.map((sc: Database['public']['Tables']['student_classrooms']['Row']) => (
                  <tr key={sc.id} className="even:bg-yellow-50 dark:even:bg-gray-800">
                    <td className="px-4 py-2">{sc.id}</td>
                    <td className="px-4 py-2">{sc.student_id}</td>
                    <td className="px-4 py-2">{sc.classroom_id}</td>
                    <td className="px-4 py-2">{sc.school_id}</td>
                    <td className="px-4 py-2">{sc.enrolled_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
