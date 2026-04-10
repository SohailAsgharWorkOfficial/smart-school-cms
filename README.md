# Smart School Student Management System

A production-structured React and Firebase web app for managing Smart School operations across three roles: `Admin`, `Teacher`, and `Student`.

The app includes role-based dashboards, CRUD management pages, teacher-restricted attendance and results workflows, student self-service views, Firestore schema guidance, seed data, and Firebase security rules.

## Tech Stack

- React 19 + Vite
- React Router
- Firebase Authentication
- Firestore Database
- Firebase Storage ready
- React Hook Form
- React Toastify

## Included Features

### Admin

- Manage students, teachers, classes, and subjects
- Assign teachers to class-subject combinations
- Review all attendance and results records
- Update school profile records
- Seed demo data to Firestore

### Teacher

- Secure login through Firebase Authentication
- View assigned classes and subjects only
- Mark and update attendance for assigned students
- Enter results only for assigned class-subject combinations
- Review previously entered attendance and results

### Student

- Secure login through Firebase Authentication
- View only personal profile and academic records
- See enrolled subjects and assigned teachers
- Review personal attendance and published results

## Project Structure

```text
src/
  components/
    forms/
    layout/
    shared/
  contexts/
  data/
  firebase/
  hooks/
  layouts/
  pages/
    admin/
    auth/
    shared/
    student/
    teacher/
  routes/
  services/
  utils/
```

## Firestore Collections

- `users`
  - Fields: `uid`, `displayName`, `email`, `role`, `linkedProfileId`, `status`
- `students`
  - Fields: `firstName`, `lastName`, `rollNumber`, `classId`, `guardianName`, `userId`
- `teachers`
  - Fields: `firstName`, `lastName`, `employeeId`, `department`, `qualification`, `userId`
- `classes`
  - Fields: `name`, `section`, `room`, `academicYear`
- `subjects`
  - Fields: `name`, `code`, `description`
- `assignments`
  - Fields: `classId`, `subjectId`, `teacherId`, `schoolYear`
- `attendance`
  - Fields: `studentId`, `classId`, `subjectId`, `teacherId`, `date`, `status`
- `results`
  - Fields: `studentId`, `classId`, `subjectId`, `teacherId`, `examName`, `term`, `score`, `totalMarks`
- `school/profile`
  - Fields: `name`, `address`, `phone`, `principalName`, `academicYear`, `notes`

## Firebase Setup

1. Create a Firebase project.
2. Enable `Authentication > Email/Password`.
3. Create a Firestore database.
4. Copy `.env.example` to `.env`.
5. Fill in all `VITE_FIREBASE_*` variables from Firebase project settings.
6. Deploy the included `firestore.rules` to Firebase.
7. If you will upload profile images or documents, also deploy `storage.rules`.

## Local Run Instructions

```bash
npm install
npm run dev
```

To create a production bundle:

```bash
npm run build
```

## Authentication and Roles

Role-based access is enforced in two layers:

1. Frontend route guards using `ProtectedRoute` and `RoleRoute`
2. Firestore security rules in [firestore.rules](/d:/GITHUB/smart-school-cms/firestore.rules)

Storage security rules are available in [storage.rules](/d:/GITHUB/smart-school-cms/storage.rules).

Recommended account mapping:

- Create Firebase Authentication users manually in Firebase Console.
- Create matching documents in `users`.
- Set `role` to `admin`, `teacher`, or `student`.
- Set `linkedProfileId` to the related `teachers/{id}` or `students/{id}` document.

## Demo Data

Demo data lives in [sampleData.js](/d:/GITHUB/smart-school-cms/src/data/sampleData.js) and can be seeded from the admin `School Records` page.

Exact role-mapped sample documents are also included in [firebase-role-samples.md](/d:/GITHUB/smart-school-cms/firebase-role-samples.md).

Suggested demo accounts:

- `admin@smartschool.edu`
- `teacher@smartschool.edu`
- `student@smartschool.edu`

Create those accounts in Firebase Authentication, then seed the related Firestore data.

## Future Expansion Ready

The structure is intentionally ready for:

- Parent portal
- Fee management
- Notifications
- Timetable module
- Document uploads
- Analytics and reporting
