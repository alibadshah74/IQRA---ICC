import React from 'react'

const AboutIqra = () => {
  return (
    <section id="about-iqra" className="w-full py-16 lg:py-20">
      <div className="grid items-center gap-8 md:gap-12 lg:gap-16 grid-cols-2">
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">About IQRA</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">
            Built in 2024.
          </h2>
          <p className="mt-4 text-base text-slate-600 md:text-lg">
            IQRA Coaching Center began in 2024 with a single classroom, a small team, and a deep belief
            that every learner deserves focused guidance.
          </p>
          {/* <p className="mt-4 text-base text-slate-600 md:text-lg">
            Today, IQRA supports students with structured study plans, mentoring, and modern tools that
            keep learning personal and measurable. 
          </p> */}
        </div>
        <div className="flex items-center justify-center">
  <div className="w-full max-w-sm aspect-4/4 overflow-hidden rounded-full shadow-lg border border-gray-200 bg-white">
    <img
      src="/iqra_logo.svg"
      alt="IQRA campus"
      className="w-full h-full object-contain p-4"
      loading="lazy"
    />
  </div>
</div>

      </div>
    </section>
  )
}

export default AboutIqra
