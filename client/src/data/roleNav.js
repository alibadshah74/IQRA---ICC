import {
  BookOpen,
  CalendarClock,
  CreditCard,
  LayoutGrid,
  Users,
  FileText,
  GraduationCap,
  Layers,
} from 'lucide-react'

export const roleNav = {
  teacher: [
    { label: 'Dashboard', path: '', icon: LayoutGrid },
    { label: 'Manage Students', path: 'students', icon: Users },
    { label: 'Manage Exam Marks', path: 'marks', icon: FileText },
    { label: 'Upload Study Materials', path: 'materials', icon: FileText },
    { label: 'Manage Classes & Subjects', path: 'subjects', icon: Layers },
    { label: 'Manage Class Routine', path: 'routine', icon: CalendarClock },
    { label: 'Manage Exams & Grades', path: 'exams', icon: FileText },
  ],
  student: [
    { label: 'Dashboard', path: '', icon: LayoutGrid },
    { label: 'Class Routine', path: 'routine', icon: CalendarClock },
    { label: 'Exam Marks', path: 'marks', icon: FileText },
    { label: 'Study Materials / Files', path: 'materials', icon: BookOpen },
    { label: 'Payment Invoices', path: 'payments', icon: CreditCard },
    { label: 'Classes & Subjects', path: 'subjects', icon: Layers },
  ],
  parent: [
    { label: 'Dashboard', path: '', icon: LayoutGrid },
    { label: 'Children Marks', path: 'marks', icon: GraduationCap },
    { label: 'Payment Invoices', path: 'invoices', icon: CreditCard },
    { label: 'Children Class Routine', path: 'routine', icon: CalendarClock },
    { label: 'Classes & Subjects', path: 'subjects', icon: Layers },
  ],
}
