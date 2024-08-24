import Header from '@/app/components/Header'
import UpcomingEvents from '@/app/components/UpcomingEvents'
import AboutUs from '@/app/components/AboutUs'
import Blogs from '@/app/components/Blogs'
import ContactUs from '@/app/components/ContactUs'


export default function Home() {
  return (
    <>
    <Header/>
    <UpcomingEvents/>
    <AboutUs/>
    <Blogs/>
    <ContactUs/>
    </>
  )
}