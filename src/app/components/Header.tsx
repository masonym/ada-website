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
        <p className="font-gotham text-slate-500 my-2">Some kind of tagline here Lorem ipsum dolor sit amet, consectetur adipiscing elit,</p>
        <div className="flex flex-row justify-between items-center w-full">
          <h1 className="flex-1 font-gotham font-bold ss:text-[72px] text-[64px] text-slate-900">
            AMERICAN <br className="lg:hidden block"></br>DEFENSE ALLIANCE
          </h1>
        </div>
        <p className="regular-16 text-slate-500 max-w-[640px] mt-5">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum
        </p>
      </div>
    </section>
  )
}

export default Header