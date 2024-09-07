import Image from 'next/image'
import React from 'react'
import Button from './Button'

const Header = () => {
  return (
    <section id="home" className="max-container flex flex-col gap-20 md:gap-28 relative">
      <div className="absolute inset-0 opacity-10 z-0"></div>
      <div className="flex-1 items-start flex-col sm:px-16 px-6 relative z-10">
        <p className="italic font-gotham text-blue-600 mt-8 text-[16px] md:text-[24px] font-semibold">
        Connecting Industry to Government Procurement Opportunities
        </p>
        <h1 className="flex-1 font-gotham font-bold ss:text-[72px] text-[40px] md:text-[64px] text-slate-900 mt-4">
          AMERICAN <br className="lg:hidden block"></br>DEFENSE ALLIANCE
        </h1>
        <p className="text-[18px] md:text-[24px] font-gotham font-medium text-slate-700 max-w-[1000px] mt-6 leading-relaxed">
        The American Defense Alliance is dedicated to the critical mission of supporting U.S. National Security and our Warfighters. We serve as a vital bridge between the private-sector Defense Industrial Base and Federal acquisition requirements and priorities.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 max-w-[480px]">
          <Button
            title="Explore Events"
            variant="btn_blue"
            link="/events"
            className="text-lg py-3 px-6"
          />
          <Button
            title="Learn More About Us"
            variant="btn_white_text"
            link="/about"
            className="text-lg py-3 px-6 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
          />
        </div>
      </div>
      {/* <div className="flex-1 flex justify-center items-center">
        <Image
          src="/header_image.jpg"
          alt="Defense technology"
          width={600}
          height={400}
          className="rounded-lg shadow-2xl"
        />
      </div> */}
    </section>
  )
}

export default Header