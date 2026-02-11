import React, { useEffect, useState } from 'react'
import apiClient from '../../api/client.js'

const DEFAULT_FORM = {
  schoolName: '',
  schoolMotto: '',
  academicYear: '',
  contactEmail: '',
  contactPhone: '',
  timezone: '',
  resultPublishMode: '',
}

const AdminSettings = () => {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await apiClient.get('/admin/settings')
      const res = data?.data ?? data
      setForm({
        schoolName: res?.schoolName || '',
        schoolMotto: res?.schoolMotto || '',
        academicYear: res?.academicYear || '',
        contactEmail: res?.contactEmail || '',
        contactPhone: res?.contactPhone || '',
        timezone: res?.timezone || '',
        resultPublishMode: res?.resultPublishMode || '',
      })
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      const payload = {
        schoolName: form.schoolName,
        schoolMotto: form.schoolMotto,
        academicYear: form.academicYear,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        timezone: form.timezone,
        resultPublishMode: form.resultPublishMode,
      }
      await apiClient.put('/admin/settings', payload)
      setSuccess('Settings saved successfully.')
      fetchSettings()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    fetchSettings()
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">System Settings</h2>
        <p className="mt-1 text-sm text-slate-500">
          Update institutional settings, academic year, and communications preferences.
        </p>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
        )}
        {success && (
          <p className="mt-4 rounded-xl bg-green-50 px-4 py-2 text-sm text-green-700">{success}</p>
        )}
        {loading && <p className="mt-4 text-sm text-slate-500">Loading...</p>}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">School Name</label>
            <input
              type="text"
              value={form.schoolName}
              onChange={(e) => setForm((f) => ({ ...f, schoolName: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">School Motto</label>
            <input
              type="text"
              value={form.schoolMotto}
              onChange={(e) => setForm((f) => ({ ...f, schoolMotto: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Academic Year</label>
            <input
              type="text"
              value={form.academicYear}
              onChange={(e) => setForm((f) => ({ ...f, academicYear: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Contact Email</label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Contact Phone</label>
            <input
              type="text"
              value={form.contactPhone}
              onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Timezone</label>
            <input
              type="text"
              value={form.timezone}
              onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Result Publish Mode</label>
            <select
              value={form.resultPublishMode}
              onChange={(e) => setForm((f) => ({ ...f, resultPublishMode: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Select mode</option>
              <option value="Manual Approval">Manual Approval</option>
              <option value="Auto Publish">Auto Publish</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          <button
            onClick={handleReset}
            className="rounded-xl border border-gray-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
