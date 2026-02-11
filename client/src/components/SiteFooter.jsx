import React from 'react'

const SiteFooter = () => {
  return (
    <footer className="mt-16 border-t border-gray-200 py-10 text-sm text-slate-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p>IQRA School Suite. Built for academic operations at scale.</p>
        <div className="flex flex-wrap gap-4">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Support</span>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
