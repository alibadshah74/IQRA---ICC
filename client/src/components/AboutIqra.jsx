import React from 'react'
import aboutImage from '../assets/iqrabg.avif'

const AboutIqra = () => {
  return (
    <section id="about-iqra" className="min-h-[70vh] py-16 lg:min-h-[75vh] lg:py-20">
      <div className="grid items-center gap-20 lg:grid-cols-2">
        <div className="order-first lg:order-last">
          <div className=" h-100 w-100 aspect-square overflow-hidden rounded-4xl border border-gray-200 shadow-sm">
            <img
              src='iqra_logo.svg'
              alt="IQRA campus"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
        <div className="lg:flex lg:flex-col lg:justify-center">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">About IQRA</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">
            Built in 2024 with a vision to raise learning standards.
          </h2>
          <p className="mt-4 text-base text-slate-600 md:text-lg">
            IQRA Coaching Center began in 2024 with a single classroom, a small team, and a deep belief
            that every learner deserves focused guidance. From a low-ground start, we grew through
            discipline, community trust, and consistent results.
          </p>
          <p className="mt-4 text-base text-slate-600 md:text-lg">
            Today, IQRA supports students with structured study plans, mentoring, and modern tools that
            keep learning personal and measurable. We remain committed to steady growth built on effort,
            integrity, and care for every family we serve.
          </p>
        </div>
      </div>
    </section>
  )
}

export default AboutIqra
