import {
  BookOpenCheck,
  Building2,
  CalendarCheck2,
  ClipboardCheck,
  Coins,
  FileSpreadsheet,
  GraduationCap,
  IdCard,
  Library,
  Receipt,
  ShieldCheck,
  Smartphone,
  SquareStack,
  SwatchBook,
  Truck,
  Users,
  UserSquare2,
} from 'lucide-react'

const ACCENT = '#2563eb'

export const PANEL_DATA = [
  {
    id: 'admin',
    name: 'Admin Panel',
    kicker: 'Operations Command Center',
    summary:
      'Centralize users, academics, finance, and communications with full governance and audit trails.',
    accent: ACCENT,
    stats: [
      { label: 'Modules', value: '18+' },
      { label: 'Role Types', value: '4' },
      { label: 'Audit Logs', value: 'Realtime' },
    ],
    features: [
      {
        title: 'User & Role Management',
        description: 'Create and manage teacher, student, and parent accounts with access controls.',
        icon: Users,
      },
      {
        title: 'Classes & Subjects',
        description: 'Define class structures, subject mappings, and academic years.',
        icon: SquareStack,
      },
      {
        title: 'Class Routine',
        description: 'Publish weekly schedules with clash detection and approvals.',
        icon: CalendarCheck2,
      },
      {
        title: 'Exam Planning & Grades',
        description: 'Configure exams, grading scales, and performance thresholds.',
        icon: FileSpreadsheet,
      },
      {
        title: 'Marks & Results',
        description: 'Collect marks, verify entries, and release results securely.',
        icon: ClipboardCheck,
      },
      {
        title: 'SMS Result Delivery',
        description: 'Send verified marks to guardians via configured SMS gateways.',
        icon: Smartphone,
      },
      {
        title: 'Accounting',
        description: 'Track income, expenses, and ledger reconciliations.',
        icon: Coins,
      },
      {
        title: 'Events & Activities',
        description: 'Plan school events with RSVP tracking.',
        icon: SwatchBook,
      },
      {
        title: 'Library, Dormitory, Transport',
        description: 'Manage assets, dorm allocation, and transport routes.',
        icon: Building2,
      },
      {
        title: 'System Settings',
        description: 'Configure general settings, language, and SMS providers.',
        icon: ShieldCheck,
      },
    ],
  },
  {
    id: 'teacher',
    name: 'Teacher Panel',
    kicker: 'Instruction & Assessment',
    summary:
      'Organize classes, distribute learning materials, and publish marks with confidence.',
    accent: ACCENT,
    stats: [
      { label: 'Class Groups', value: 'Dynamic' },
      { label: 'Materials', value: 'Secure' },
      { label: 'Assessments', value: 'Structured' },
    ],
    features: [
      {
        title: 'Student Management',
        description: 'Maintain class rosters, profiles, and performance snapshots.',
        icon: UserSquare2,
      },
      {
        title: 'Exams & Marks',
        description: 'Create assessments, input marks, and validate results.',
        icon: ClipboardCheck,
      },
      {
        title: 'Learning Materials',
        description: 'Share study files, assignments, and resources.',
        icon: GraduationCap,
      },
    ],
  },
  {
    id: 'student',
    name: 'Student Panel',
    kicker: 'My Learning Hub',
    summary:
      'Access routines, results, materials, and payments from one personalized dashboard.',
    accent: ACCENT,
    stats: [
      { label: 'Routine', value: 'Live' },
      { label: 'Results', value: 'Private' },
      { label: 'Payments', value: 'Online' },
    ],
    features: [
      {
        title: 'Class Routine',
        description: 'View personalized daily and weekly routines.',
        icon: CalendarCheck2,
      },
      {
        title: 'Exam Marks',
        description: 'Check verified exam results and progress trends.',
        icon: FileSpreadsheet,
      },
      {
        title: 'Study Materials',
        description: 'Download teacher-provided notes and assignments.',
        icon: BookOpenCheck,
      },
      {
        title: 'Invoices & Online Pay',
        description: 'See fee invoices and pay securely online.',
        icon: Receipt,
      },
    ],
  },
  {
    id: 'parent',
    name: 'Parent Panel',
    kicker: 'Family Progress View',
    summary:
      'Stay connected with children performance, schedules, and financial updates.',
    accent: ACCENT,
    stats: [
      { label: 'Child Updates', value: 'Instant' },
      { label: 'Payments', value: 'Transparent' },
      { label: 'Routines', value: 'Synced' },
    ],
    features: [
      {
        title: 'Children Marks',
        description: 'Review exam marks and progression insights.',
        icon: FileSpreadsheet,
      },
      {
        title: 'Invoices & Payments',
        description: 'View fee invoices and payment receipts.',
        icon: Receipt,
      },
      {
        title: 'Class Routine',
        description: 'Check daily schedules and special activities.',
        icon: CalendarCheck2,
      },
    ],
  },
]

export const PLATFORM_MODULES = [
  {
    title: 'Admissions & Identity',
    description: 'Onboarding, ID cards, and guardian linkage.',
    icon: IdCard,
  },
  {
    title: 'Library Operations',
    description: 'Cataloging, issue/return, and penalties.',
    icon: Library,
  },
  {
    title: 'Dormitory & Housing',
    description: 'Room allocation, inspections, and billing.',
    icon: Building2,
  },
  {
    title: 'Transport & Routes',
    description: 'Vehicle tracking, stops, and monthly fees.',
    icon: Truck,
  },
  {
    title: 'Finance & Receipts',
    description: 'Invoices, receipts, and ledger reconciliation.',
    icon: Coins,
  },
]
