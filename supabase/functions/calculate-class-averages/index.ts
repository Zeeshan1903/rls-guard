import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get request parameters
    const { classroom_id, school_id } = await req.json()

    if (!classroom_id && !school_id) {
      throw new Error('Either classroom_id or school_id is required')
    }

    // Build query for progress data
    let query = supabaseClient
      .from('progress')
      .select(`
        classroom_id,
        score,
        assignment_name,
        date_submitted,
        classrooms(
          id,
          name,
          school_id,
          subject,
          grade_level
        )
      `)

    if (classroom_id) {
      query = query.eq('classroom_id', classroom_id)
    } else {
      query = query.eq('school_id', school_id)
    }

    const { data: progressData, error: progressError } = await query

    if (progressError) throw progressError

    // Calculate averages by classroom
    const classroomAverages = new Map()

    progressData?.forEach(record => {
      if (!record.classrooms) return
      
      const classroomId = record.classroom_id
      const classroom = record.classrooms
      
      if (!classroomAverages.has(classroomId)) {
        classroomAverages.set(classroomId, {
          classroom_id: classroomId,
          classroom_name: classroom.name,
          school_id: classroom.school_id,
          subject: classroom.subject,
          grade_level: classroom.grade_level,
          total_score: 0,
          assignment_count: 0,
          scores: []
        })
      }

      const classData = classroomAverages.get(classroomId)
      classData.total_score += record.score
      classData.assignment_count += 1
      classData.scores.push(record.score)
    })

    // Calculate final averages and statistics
    const results = []
    for (const [classroomId, data] of classroomAverages) {
      const average = data.assignment_count > 0 ? data.total_score / data.assignment_count : 0
      const scores = data.scores.sort((a, b) => a - b)
      const median = scores.length > 0 ? (
        scores.length % 2 === 0
          ? (scores[scores.length / 2 - 1] + scores[scores.length / 2]) / 2
          : scores[Math.floor(scores.length / 2)]
      ) : 0

      results.push({
        classroom_id: classroomId,
        classroom_name: data.classroom_name,
        school_id: data.school_id,
        subject: data.subject,
        grade_level: data.grade_level,
        average_score: Math.round(average * 100) / 100,
        median_score: Math.round(median * 100) / 100,
        assignment_count: data.assignment_count,
        min_score: scores.length > 0 ? Math.min(...scores) : 0,
        max_score: scores.length > 0 ? Math.max(...scores) : 0,
        calculated_at: new Date().toISOString()
      })
    }

    // Save to MongoDB
    const mongoUri = Deno.env.get('MONGODB_URI')
    const mongoDbName = Deno.env.get('MONGODB_DB_NAME') || 'rls_guard_analytics'

    if (mongoUri && results.length > 0) {
      const client = new MongoClient()
      await client.connect(mongoUri)
      const db = client.database(mongoDbName)
      const collection = db.collection('class_averages')

      // Remove existing records for these classrooms
      const classroomIds = results.map(r => r.classroom_id)
      await collection.deleteMany({ classroom_id: { $in: classroomIds } })

      // Insert new records
      await collection.insertMany(results)
      await client.close()
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Calculated averages for ${results.length} classrooms`,
        data: results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error calculating class averages:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})