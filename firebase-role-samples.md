# Firebase Role Samples

Use these sample Firestore documents in the `users` collection after creating Firebase Authentication users.

Important:

- Document ID in `users` must be the Firebase Auth `uid`
- `linkedProfileId` must match the document id inside `teachers` or `students`

## users collection

### Admin user doc

```json
{
  "displayName": "Sarah Khan",
  "email": "admin@smartschool.edu",
  "role": "admin",
  "status": "active"
}
```

### Teacher user doc

```json
{
  "displayName": "Hamza Ali",
  "email": "teacher@smartschool.edu",
  "role": "teacher",
  "linkedProfileId": "teacher-hamza",
  "status": "active"
}
```

### Student user doc

```json
{
  "displayName": "Amina Noor",
  "email": "student@smartschool.edu",
  "role": "student",
  "linkedProfileId": "student-amina",
  "status": "active"
}
```

## Matching teacher document

Collection: `teachers`
Document ID: `teacher-hamza`

```json
{
  "employeeId": "T-1001",
  "firstName": "Hamza",
  "lastName": "Ali",
  "email": "teacher@smartschool.edu",
  "phone": "+92 301 4567890",
  "qualification": "MSc Mathematics",
  "department": "Senior Section",
  "userId": "PASTE_TEACHER_AUTH_UID_HERE"
}
```

## Matching student document

Collection: `students`
Document ID: `student-amina`

```json
{
  "rollNumber": "G10A-001",
  "firstName": "Amina",
  "lastName": "Noor",
  "email": "student@smartschool.edu",
  "phone": "+92 302 7894561",
  "guardianName": "Nadia Noor",
  "guardianPhone": "+92 333 1112233",
  "classId": "class-10-a",
  "userId": "PASTE_STUDENT_AUTH_UID_HERE"
}
```

## Matching class document

Collection: `classes`
Document ID: `class-10-a`

```json
{
  "name": "Grade 10",
  "section": "A",
  "room": "Room 12",
  "academicYear": "2026-2027"
}
```

## Matching subject document

Collection: `subjects`
Document ID: `subject-math`

```json
{
  "name": "Mathematics",
  "code": "MTH-10",
  "description": "Core mathematics curriculum for Grade 10."
}
```

## Matching assignment document

Collection: `assignments`
Document ID: `assign-math-10a`

```json
{
  "classId": "class-10-a",
  "subjectId": "subject-math",
  "teacherId": "teacher-hamza",
  "schoolYear": "2026-2027"
}
```
