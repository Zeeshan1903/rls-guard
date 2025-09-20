-- Create schools table
CREATE TABLE schools (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user profiles table extending Supabase auth.users
CREATE TABLE user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'teacher', 'head_teacher')),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  full_name text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create classrooms table
CREATE TABLE classrooms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  subject text,
  grade_level text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create progress table
CREATE TABLE progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  classroom_id uuid REFERENCES classrooms(id) ON DELETE CASCADE NOT NULL,
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  score numeric(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  assignment_name text NOT NULL,
  date_submitted timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create student_classroom junction table for many-to-many relationship
CREATE TABLE student_classrooms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  classroom_id uuid REFERENCES classrooms(id) ON DELETE CASCADE NOT NULL,
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  enrolled_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_id, classroom_id)
);

-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_classrooms ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_user_profiles_school_id ON user_profiles(school_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_classrooms_school_id ON classrooms(school_id);
CREATE INDEX idx_classrooms_teacher_id ON classrooms(teacher_id);
CREATE INDEX idx_progress_student_id ON progress(student_id);
CREATE INDEX idx_progress_classroom_id ON progress(classroom_id);
CREATE INDEX idx_progress_school_id ON progress(school_id);
CREATE INDEX idx_student_classrooms_student_id ON student_classrooms(student_id);
CREATE INDEX idx_student_classrooms_classroom_id ON student_classrooms(classroom_id);