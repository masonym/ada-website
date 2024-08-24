import { ABOUT_TEXT } from '@/constants'
import React from 'react'

const AboutUs = () => {
  return (
    <section className="max-container flex flex-col gap-20 md:gap-28 mt-12">
      <div>
        <h1 className="self-end text-center font-gotham font-bold ss:text-[72px] text-[64px] text-slate-900 sm:px-16 px-6">
          Our Mission(?)
        </h1>
      </div>
      {ABOUT_TEXT.map((item, index) => (
        <div
          key={index}
          className={`flex ${index % 2 === 0 ? 'flex-row text-start' : 'flex-row-reverse text-end'} items-center gap-4 flexBetween px-32`}
        >
          <div className="w-1/2">
            <h2 className="text-[32px] font-bold font-gotham text-slate-700">{item.title}</h2>
            <p className="regular-24 font-gotham text-slate-500">{item.description}</p>
          </div>
        </div>
      ))}
    </section>
  )
}

export default AboutUs
