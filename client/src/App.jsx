import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './pages/home/Home.jsx'
import Login from './pages/auth/Login.jsx'
import SelectRole from './pages/auth/SelectRole.jsx'
import NotFound from './pages/shared/NotFound.jsx'

import RoleProtectedRoute from './routes/RoleProtectedRoute.jsx'
import RoleLayout from './layouts/RoleLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import AdminAcademics from './pages/admin/AdminAcademics.jsx'
import AdminRoutine from './pages/admin/AdminRoutine.jsx'
import AdminExams from './pages/admin/AdminExams.jsx'
import AdminFinance from './pages/admin/AdminFinance.jsx'
import AdminEvents from './pages/admin/AdminEvents.jsx'
import AdminSettings from './pages/admin/AdminSettings.jsx'

// Teacher
import TeacherDashboard from './pages/teacher/TeacherDashboard.jsx'
import TeacherStudents from './pages/teacher/TeacherStudents.jsx'
import TeacherMarks from './pages/teacher/TeacherMarks.jsx'
import TeacherMaterials from './pages/teacher/TeacherMaterials.jsx'
import TeacherSubjects from './pages/teacher/TeacherSubjects.jsx'
import TeacherRoutine from './pages/teacher/TeacherRoutine.jsx'
import TeacherExams from './pages/teacher/TeacherExams.jsx'

// Student
import StudentDashboard from './pages/student/StudentDashboard.jsx'
import StudentRoutine from './pages/student/StudentRoutine.jsx'
import StudentMarks from './pages/student/StudentMarks.jsx'
import StudentMaterials from './pages/student/StudentMaterials.jsx'
import StudentPayments from './pages/student/StudentPayments.jsx'
import StudentSubjects from './pages/student/StudentSubjects.jsx'

// Parent
import ParentDashboard from './pages/parent/ParentDashboard.jsx'
import ParentMarks from './pages/parent/ParentMarks.jsx'
import ParentInvoices from './pages/parent/ParentInvoices.jsx'
import ParentRoutine from './pages/parent/ParentRoutine.jsx'
import ParentSubjects from './pages/parent/ParentSubjects.jsx'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/select-role" element={<SelectRole />} />
        <Route path="/login" element={<Login />} />

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin/*"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="academics" element={<AdminAcademics />} />
          <Route path="routine" element={<AdminRoutine />} />
          <Route path="exams" element={<AdminExams />} />
          <Route path="finance" element={<AdminFinance />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* ================= TEACHER ================= */}
        <Route
          path="/teacher/*"
          element={
            <RoleProtectedRoute allowedRoles={['teacher']}>
              <RoleLayout role="teacher" subtitle="Teacher Dashboard" />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<TeacherDashboard />} />
          <Route path="students" element={<TeacherStudents />} />
          <Route path="marks" element={<TeacherMarks />} />
          <Route path="materials" element={<TeacherMaterials />} />
          <Route path="subjects" element={<TeacherSubjects />} />
          <Route path="routine" element={<TeacherRoutine />} />
          <Route path="exams" element={<TeacherExams />} />
        </Route>

        {/* ================= STUDENT ================= */}
        <Route
          path="/student/*"
          element={
            <RoleProtectedRoute allowedRoles={['student']}>
              <RoleLayout role="student" subtitle="Student Dashboard" />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="routine" element={<StudentRoutine />} />
          <Route path="marks" element={<StudentMarks />} />
          <Route path="materials" element={<StudentMaterials />} />
          <Route path="payments" element={<StudentPayments />} />
          <Route path="subjects" element={<StudentSubjects />} />
        </Route>

        {/* ================= PARENT ================= */}
        <Route
          path="/parent/*"
          element={
            <RoleProtectedRoute allowedRoles={['parent']}>
              <RoleLayout role="parent" subtitle="Parent Dashboard" />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<ParentDashboard />} />
          <Route path="marks" element={<ParentMarks />} />
          <Route path="invoices" element={<ParentInvoices />} />
          <Route path="routine" element={<ParentRoutine />} />
          <Route path="subjects" element={<ParentSubjects />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
