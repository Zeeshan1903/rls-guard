# RLS Guard Dog - Classroom Management System

A secure classroom management system built with Next.js, Supabase, and MongoDB featuring role-based access control and row-level security.

## Features

- **Role-based Access Control**: Students, teachers, and head teachers with different permissions
- **Row-Level Security (RLS)**: Strict data access policies in Supabase
- **Progress Tracking**: Teachers can add and manage student progress records
- **Class Analytics**: Edge Functions calculate class averages and save to MongoDB
- **Protected Routes**: Teacher dashboard accessible only to authorized users

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL with RLS policies
- **Analytics**: MongoDB for class averages storage
- **Edge Functions**: Supabase Edge Functions for calculations

## Quick Start

### 1. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
MONGODB_URI=your_mongodb_connection_string_here
MONGODB_DB_NAME=rls_guard_analytics
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Apply the database migrations to your Supabase project:

```sql
-- Run the contents of supabase/migrations/001_initial_schema.sql
-- Run the contents of supabase/migrations/002_rls_policies.sql
```

### 4. Deploy Edge Function

Deploy the class averages calculation function:

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Deploy the edge function
supabase functions deploy calculate-class-averages
```

### 5. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Database Schema

### Tables

1. **schools**: School information
2. **user_profiles**: User profiles with roles (student, teacher, head_teacher)
3. **classrooms**: Classroom information linked to schools and teachers
4. **progress**: Student progress records with scores and assignments
5. **student_classrooms**: Junction table for student-classroom enrollment

### RLS Policies

- **Students**: Can only see their own progress records and enrolled classrooms
- **Teachers**: Can see and manage progress for students in their classrooms
- **Head Teachers**: Can see all records within their school

## API Endpoints

### `/api/calculate-averages` (POST)

Triggers the Edge Function to calculate class averages.

**Request Body:**
```json
{
  "classroom_id": "optional-classroom-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Calculated averages for N classrooms",
  "data": [...]
}
```

## Usage

### For Teachers

1. Navigate to `/login` and sign in
2. Access the teacher dashboard at `/teacher`
3. Select a classroom to manage
4. Add progress records for students
5. Calculate class averages to save analytics to MongoDB

### For Students

1. Sign in at `/login`
2. View your own progress records (RLS automatically filters)

### For Head Teachers

1. Sign in at `/login`
2. Access teacher dashboard with school-wide permissions
3. View and manage all classrooms and progress in the school

## Security Features

- **Authentication**: Supabase Auth handles user authentication
- **Authorization**: Middleware protects teacher routes
- **Row-Level Security**: Database policies ensure users only see authorized data
- **Type Safety**: Full TypeScript support with generated database types

## Development

### Project Structure

```
src/
├── app/
│   ├── api/calculate-averages/    # API route for averages
│   ├── login/                     # Login page
│   ├── teacher/                   # Protected teacher dashboard
│   └── unauthorized/              # Access denied page
├── lib/
│   ├── database.types.ts          # Generated Supabase types
│   ├── supabase.ts               # Client-side Supabase client
│   └── supabase-server.ts        # Server-side Supabase client
supabase/
├── functions/
│   └── calculate-class-averages/  # Edge Function
└── migrations/                    # Database schema and policies
```

### Adding New Features

1. Update database schema in `supabase/migrations/`
2. Regenerate types: `supabase gen types typescript --local > src/lib/database.types.ts`
3. Add new components and pages as needed
4. Ensure RLS policies are updated for new tables

## Deployment

1. Deploy to Vercel or your preferred platform
2. Set environment variables in your deployment platform
3. Apply database migrations to your production Supabase project
4. Deploy Edge Functions using Supabase CLI

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
