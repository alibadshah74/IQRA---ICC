import {
  CalendarClock,
  CreditCard,
  FileText,
  GraduationCap,
  LayoutGrid,
  Settings,
  Users,
} from 'lucide-react'

export const adminNav = [
  { label: 'Dashboard', path: '', icon: LayoutGrid },
  { label: 'Users', path: 'users', icon: Users },
  { label: 'Academics', path: 'academics', icon: GraduationCap },
  { label: 'Routine', path: 'routine', icon: CalendarClock },
  { label: 'Exams', path: 'exams', icon: FileText },
  { label: 'Finance', path: 'finance', icon: CreditCard },
  { label: 'Events', path: 'events', icon: CalendarClock },
  { label: 'Settings', path: 'settings', icon: Settings },
]
