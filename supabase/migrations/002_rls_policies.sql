-- RLS Policies for schools table
CREATE POLICY "Users can view their own school" ON schools
  FOR SELECT USING (
    id IN (
      SELECT school_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for user_profiles table
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Teachers can view students in their school" ON user_profiles
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('teacher', 'head_teacher')
    )
  );

-- RLS Policies for classrooms table
CREATE POLICY "Students can view their enrolled classrooms" ON classrooms
  FOR SELECT USING (
    id IN (
      SELECT classroom_id FROM student_classrooms WHERE student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view classrooms they teach" ON classrooms
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Head teachers can view all classrooms in their school" ON classrooms
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM user_profiles 
      WHERE id = auth.uid() AND role = 'head_teacher'
    )
  );

CREATE POLICY "Teachers can insert classrooms in their school" ON classrooms
  FOR INSERT WITH CHECK (
    teacher_id = auth.uid() AND
    school_id IN (
      SELECT school_id FROM user_profiles WHERE id = auth.uid() AND role IN ('teacher', 'head_teacher')
    )
  );

CREATE POLICY "Teachers can update their own classrooms" ON classrooms
  FOR UPDATE USING (teacher_id = auth.uid());

CREATE POLICY "Head teachers can update classrooms in their school" ON classrooms
  FOR UPDATE USING (
    school_id IN (
      SELECT school_id FROM user_profiles 
      WHERE id = auth.uid() AND role = 'head_teacher'
    )
  );

-- RLS Policies for progress table
CREATE POLICY "Students can view their own progress" ON progress
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Teachers can view progress for their students" ON progress
  FOR SELECT USING (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Head teachers can view all progress in their school" ON progress
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM user_profiles 
      WHERE id = auth.uid() AND role = 'head_teacher'
    )
  );

CREATE POLICY "Teachers can insert progress for their students" ON progress
  FOR INSERT WITH CHECK (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    ) AND
    student_id IN (
      SELECT student_id FROM student_classrooms WHERE classroom_id = progress.classroom_id
    )
  );

CREATE POLICY "Teachers can update progress for their students" ON progress
  FOR UPDATE USING (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Head teachers can insert/update progress in their school" ON progress
  FOR ALL USING (
    school_id IN (
      SELECT school_id FROM user_profiles 
      WHERE id = auth.uid() AND role = 'head_teacher'
    )
  );

-- RLS Policies for student_classrooms table
CREATE POLICY "Students can view their classroom enrollments" ON student_classrooms
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Teachers can view enrollments for their classrooms" ON student_classrooms
  FOR SELECT USING (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Head teachers can view all enrollments in their school" ON student_classrooms
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM user_profiles 
      WHERE id = auth.uid() AND role = 'head_teacher'
    )
  );

CREATE POLICY "Teachers can manage enrollments for their classrooms" ON student_classrooms
  FOR ALL USING (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Head teachers can manage enrollments in their school" ON student_classrooms
  FOR ALL USING (
    school_id IN (
      SELECT school_id FROM user_profiles 
      WHERE id = auth.uid() AND role = 'head_teacher'
    )
  );