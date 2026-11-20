# SarkariSajha - Database Schema & Storage Model

## Database Engine
- **Cloud Firestore** (`gen-lang-client-0066392058` / `asia-southeast1`)

## Collections Schema

### 1. `users`
- `uid` (string, Document ID): Unique Firebase Auth user ID.
- `email` (string): User contact email.
- `displayName` (string): Candidate name.
- `role` (string): `candidate` | `editor` | `admin` | `super_admin`.
- `profile` (map): Qualifications, preferred services, province, mobile number.
- `createdAt` (timestamp).

### 2. `vacancies`
- `id` (string): Unique identifier.
- `title` (string): Vacancy designation.
- `organization` (string): Public body name.
- `category` (string): Public Service, Banking, Teacher, Security, Provincial.
- `level` (string): Officer, Level 5, etc.
- `posts` (number): Number of open seats.
- `province` (string): Geographical jurisdiction.
- `deadlineEn` / `deadlineNp` (string): Last date of application.
- `officialUrl` (string): Verified official government portal link.
- `verifiedByAdmin` (boolean): Human audit approval flag.

### 3. `applications` (or `saved_vacancies`)
- `id` (string): Track ID.
- `userId` (string): Candidate reference.
- `vacancyId` (string): Target job reference.
- `status` (string): Bookmarked, Form Drafted, Fee Paid, Exam Scheduled.
- `feePaid` (boolean): Payment status.
- `notes` (string): User notes.

### 4. `quiz_sets` & `quiz_attempts`
- `title` (string): Test name.
- `targetService` (string): Exam paper target.
- `questions` (array of maps): Question stem, options, correct index, explanation.
- `attempts`: Candidate scores and timing analytics.

### 5. `notifications`
- System alerts, deadline reminders, exam hall ticket updates.
