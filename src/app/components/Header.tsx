import Image from 'next/image'
import React from 'react'

const Header = () => {
  return (
    <section id="home" className="max-container flex flex-col gap-20 md:gap-28 xl:flex-row">
      {/* <Image
      src="/header_banner.jpg"
      width={0}
      height={0}
      unoptimized={true}
      className='h-auto w-full rounded-3xl'
      /> */}

      <div className="flex-1 items-start flex-col sm:px-16 px-6">
        <p className="font-gotham text-slate-500 mt-8">Connecting industry to government procurement opportunities.</p>
        <div className="flex flex-row justify-between items-center w-full">
          <h1 className="flex-1 font-gotham font-bold ss:text-[72px] text-[64px] text-slate-900">
            AMERICAN <br className="lg:hidden block"></br>DEFENSE ALLIANCE
          </h1>
        </div>
        <p className="text-[20px] font-gotham text-slate-500 max-w-[1000px] mt-5">
        The American Defense Alliance is dedicated to the critical mission of supporting U.S. National Security and our Warfighters, by informing the private-sector Defense Industrial Base of Federal acquisition requirements and priorities, and helping Small Businesses/Diversity Suppliers and Prime Contractors connect with each other in identifying, pursuing and performing Government contracts. 
        </p>
      </div>
    </section>
  )
}

export default Header