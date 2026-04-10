export const demoCredentials = [
  { role: "Admin", email: "admin@smartschool.edu", password: "Admin@123456" },
  { role: "Teacher", email: "teacher@smartschool.edu", password: "Teacher@123456" },
  { role: "Student", email: "student@smartschool.edu", password: "Student@123456" },
];

export const sampleSeedData = {
  school: {
    name: "Smart School",
    address: "21 Knowledge Avenue, Lahore",
    phone: "+92 300 1234567",
    principalName: "Ayesha Rahman",
    academicYear: "2026-2027",
    updatedBy: "System Seed",
    notes: "Initial Smart School profile for local development and demo walkthroughs.",
  },
  users: [
    {
      id: "admin-demo",
      uid: "admin-demo",
      displayName: "Sarah Khan",
      email: "admin@smartschool.edu",
      role: "admin",
      linkedProfileId: null,
      status: "active",
    },
    {
      id: "teacher-demo",
      uid: "teacher-demo",
      displayName: "Hamza Ali",
      email: "teacher@smartschool.edu",
      role: "teacher",
      linkedProfileId: "teacher-hamza",
      status: "active",
    },
    {
      id: "student-demo",
      uid: "student-demo",
      displayName: "Amina Noor",
      email: "student@smartschool.edu",
      role: "student",
      linkedProfileId: "student-amina",
      status: "active",
    },
  ],
  teachers: [
    {
      id: "teacher-hamza",
      employeeId: "T-1001",
      firstName: "Hamza",
      lastName: "Ali",
      email: "teacher@smartschool.edu",
      phone: "+92 301 4567890",
      qualification: "MSc Mathematics",
      department: "Senior Section",
      userId: "teacher-demo",
    },
  ],
  classes: [
    {
      id: "class-10-a",
      name: "Grade 10",
      section: "A",
      room: "Room 12",
      academicYear: "2026-2027",
    },
  ],
  subjects: [
    { id: "subject-math", name: "Mathematics", code: "MTH-10", description: "Core mathematics curriculum for Grade 10." },
    { id: "subject-science", name: "General Science", code: "SCI-10", description: "Integrated science module for Grade 10." },
  ],
  students: [
    {
      id: "student-amina",
      rollNumber: "G10A-001",
      firstName: "Amina",
      lastName: "Noor",
      email: "student@smartschool.edu",
      phone: "+92 302 7894561",
      guardianName: "Nadia Noor",
      guardianPhone: "+92 333 1112233",
      classId: "class-10-a",
      userId: "student-demo",
    },
  ],
  assignments: [
    {
      id: "assign-math-10a",
      classId: "class-10-a",
      subjectId: "subject-math",
      teacherId: "teacher-hamza",
      schoolYear: "2026-2027",
    },
  ],
  attendance: [
    {
      id: "attendance-amina-2026-04-01",
      studentId: "student-amina",
      classId: "class-10-a",
      subjectId: "subject-math",
      teacherId: "teacher-hamza",
      date: "2026-04-01",
      status: "present",
    },
  ],
  results: [
    {
      id: "result-amina-midterm-math",
      studentId: "student-amina",
      classId: "class-10-a",
      subjectId: "subject-math",
      teacherId: "teacher-hamza",
      examName: "Midterm",
      term: "Term 1",
      score: 87,
      totalMarks: 100,
    },
  ],
};
