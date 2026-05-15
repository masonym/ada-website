import React from 'react'
import { redirect } from 'next/navigation'

// this is just a redirect
const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  return (
    // this is just a redirect
    redirect(`/events/${slug}/venue-and-lodging`)
  )
}

// this is just a redirect
export default page