import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import TeacherDashboard from './components/TeacherDashboard'
import { Database } from '@/lib/database.types'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export default async function TeacherPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user profile to verify role
  const { data: profileData, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = profileData as UserProfile | null

  if (profileError || !profile || !['teacher', 'head_teacher'].includes(profile.role)) {
    redirect('/unauthorized')
  }

  // Get teacher's classrooms
  const { data: classrooms } = await supabase
    .from('classrooms')
    .select(`
      *,
      student_classrooms(
        student_id,
        user_profiles(id, full_name, email)
      )
    `)
    .eq(profile.role === 'head_teacher' ? 'school_id' : 'teacher_id', 
        profile.role === 'head_teacher' ? profile.school_id : user.id)

  // Get progress records for teacher's students
  const { data: progressRecords } = await supabase
    .from('progress')
    .select(`
      *,
      user_profiles!progress_student_id_fkey(full_name, email),
      classrooms(name)
    `)
    .eq('school_id', profile.school_id)
    .order('date_submitted', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Teacher Dashboard
            </h1>
            <TeacherDashboard 
              profile={profile}
              classrooms={classrooms || []}
              progressRecords={progressRecords || []}
            />
          </div>
        </div>
      </div>
    </div>
  )
}