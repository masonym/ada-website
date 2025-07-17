import React from 'react'
import { redirect } from 'next/navigation'

// this is just a redirect
const page = ({ params }: { params: { slug: string } }) => {
  return (
    // this is just a redirect
    redirect(`/events/${params.slug}/venue-and-lodging`)
  )
}

// this is just a redirect
export default page