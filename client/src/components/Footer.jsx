import React, { useEffect, useState } from 'react'
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react'
import Modal from './Modal.jsx'
import apiClient from '../api/client.js'

const Footer = () => {
  const [modal, setModal] = useState('')
  const [settings, setSettings] = useState({
    schoolName: '',
    academicYear: '',
    schoolMotto: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
  })

  const closeModal = () => setModal('')

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const { data } = await apiClient.get('/settings')
        const payload = data?.data ?? data
        if (cancelled) return
        setSettings({
          schoolName: payload?.schoolName || '',
          academicYear: payload?.academicYear || '',
          schoolMotto: payload?.schoolMotto || '',
          contactEmail: payload?.contactEmail || '',
          contactPhone: payload?.contactPhone || '',
          address: payload?.address || '',
        })
      } catch (err) {
        if (!cancelled) {
          setSettings({
            schoolName: '',
            academicYear: '',
            schoolMotto: '',
            contactEmail: '',
            contactPhone: '',
            address: '',
          })
        }
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  return (
    <footer className="mt-16 border-t border-gray-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="order-1 lg:order-1">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">IQRA</p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-900">IQRA Coaching Center</h3>
            <p className="mt-3 text-sm text-slate-600">
              A focused learning community delivering consistent academic growth since 2024.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-gray-200 p-2 text-slate-600 hover:bg-gray-50"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-gray-200 p-2 text-slate-600 hover:bg-gray-50"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-gray-200 p-2 text-slate-600 hover:bg-gray-50"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-gray-200 p-2 text-slate-600 hover:bg-gray-50"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="order-3 lg:order-2">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Navigate</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li><a href="#about-iqra" className="hover:text-slate-900">About IQRA</a></li>
              <li><a href="#courses" className="hover:text-slate-900">Courses</a></li>
              <li><a href="#teachers" className="hover:text-slate-900">Teachers</a></li>
              <li><a href="#achievements" className="hover:text-slate-900">Achievements</a></li>
              <li><a href="#testimonials" className="hover:text-slate-900">Testimonials</a></li>
            </ul>
          </div>

          <div className="order-2 lg:order-3">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Legal</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
              <button
                type="button"
                onClick={() => setModal('terms')}
                className="text-left hover:text-slate-900"
              >
                Terms
              </button>
              <button
                type="button"
                onClick={() => setModal('privacy')}
                className="text-left hover:text-slate-900"
              >
                Privacy Policy
              </button>
            </div>
          </div>

          <div className="order-4 lg:order-4 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">School Profile</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-500">School Name</span>
                <span className="font-semibold text-slate-900">{settings.schoolName || '-'}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-500">Academic Year</span>
                <span className="font-semibold text-slate-900">{settings.academicYear || '-'}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-500">School Motto</span>
                <span className="font-semibold text-slate-900">{settings.schoolMotto || '-'}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-500">Email</span>
                <span className="font-semibold text-slate-900">{settings.contactEmail || '-'}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-500">Contact</span>
                <span className="font-semibold text-slate-900">{settings.contactPhone || '-'}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-500">Address</span>
                <span className="font-semibold text-slate-900">{settings.address || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-100 pt-6 text-xs text-slate-500">
          IQRA Coaching Center. All rights reserved.
        </div>
      </div>

      <Modal title="Terms" isOpen={modal === 'terms'} onClose={closeModal}>
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            IQRA provides academic coaching services and learning resources for enrolled students. By
            using our services, you agree to follow published academic guidelines and maintain respectful
            conduct within the learning environment.
          </p>
          <p>
            Course schedules, fees, and program details may be updated with prior notice to ensure the
            highest learning standards.
          </p>
        </div>
      </Modal>

      <Modal title="Privacy Policy" isOpen={modal === 'privacy'} onClose={closeModal}>
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            IQRA collects only the information required for academic administration and student support.
            Personal data is stored securely and shared only with authorized staff.
          </p>
          <p>
            We do not sell personal data. Parents and students may request updates to their records through
            the administration office.
          </p>
        </div>
      </Modal>
    </footer>
  )
}

export default Footer
