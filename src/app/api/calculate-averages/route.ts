import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { Database } from '@/lib/database.types'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify user is authenticated and has teacher/head_teacher role
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('role, school_id')
      .eq('id', user.id)
      .single()

    const profile = profileData as UserProfile | null

    if (profileError || !profile || !['teacher', 'head_teacher'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { classroom_id } = await request.json()

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('calculate-class-averages', {
      body: {
        classroom_id: classroom_id || null,
        school_id: profile.school_id
      }
    })

    if (error) {
      console.error('Edge function error:', error)
      return NextResponse.json({ error: 'Failed to calculate averages' }, { status: 500 })
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}