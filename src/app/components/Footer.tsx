import { FOOTER_CONTACT_INFO, FOOTER_LINKS, SOCIALS } from '@/constants'
import { getCdnPath } from '@/utils/image'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Footer = () => {
  return (
    <footer className="flexCenter mb-12 mt-12">
      <div className="padding-container max-container flex w-full flex-col gap-14">
        <div className="flex flex-col items-start justify-center gap-[10%] md:flex-row">
          <Link
            href="/" className="mb-10"
          >
            <Image
              src={getCdnPath("/logo.webp")}
              alt="American Defense Alliance Logo"
              width={192}
              height={192}
            />
          </Link>
          <div className="flex flex-wrap gap-10 sm:justify-around md:flex-1">
            {FOOTER_LINKS.map((columns, index) => (
              <FooterColumn key={index} title={columns.title}>
                <ul className="regular-14 flex flex-col gap-4 text-gray-30">
                  {columns.links.map((link) => (
                    <Link href={link.href} key={link.label}>
                      {link.label}
                    </Link>
                  ))}
                </ul>
              </FooterColumn>
            ))}


            <div className="flex flex-col gap-5">
              <FooterColumn title={FOOTER_CONTACT_INFO.title}>
                <div className="medium-14 whitespace-nowrap text-blue-70 h-fit">
                  <p>1300 Pennsylvania Avenue, N.W., Ste. 700</p>
                  <p>Washington, DC 20004</p>
                </div>
                {FOOTER_CONTACT_INFO.links.map((link) => (
                  <Link href={link.href} key={link.label} className="flex gap-4 md:flex-col lg:flex-row items-center">
                    <p className="whitespace-nowrap">
                      {link.label}:
                    </p>
                    <p className="medium-14 whitespace-nowrap text-blue-70 h-fit">
                      {link.value}
                    </p>
                  </Link>
                ))}
              </FooterColumn>
            </div>

            <div className="flex flex-col gap-5">
              <FooterColumn title={SOCIALS.title}>
                <ul className="regular-14 flex gap-4 text-gray-30">
                  {SOCIALS.links.map((link) => (
                    <Link
                      href={link.href}
                      key={link.title}
                      target='_blank'
                      className="hover:text-gray-50 transition-colors"
                    >
                      <link.Icon size={24} />
                    </Link>
                  ))}
                </ul>
              </FooterColumn>
            </div>
          </div>
        </div>
        <div className="border border-gray-700" />
        <p className="regular-14 w-full text-center text-gray-30">&copy; 2025 American Defense Alliance | All Rights Reserved</p>
      </div>

    </footer>
  )
}

type FooterColumnProps = {
  title: string,
  children: React.ReactNode;
}

const FooterColumn = ({ title, children }: FooterColumnProps) => {
  return (
    <div className="flex flex-col gap-5">
      <h4 className="bold-18 whitespace-nowrap">{title}</h4>
      {children}
    </div>
  )
}

export default Footer