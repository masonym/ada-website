import { NextRequest, NextResponse } from 'next/server'
import { uploadImage, updateSponsorLogo } from '@/lib/sanity-admin'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const sponsorId = formData.get('sponsorId') as string
    const logo = formData.get('logo') as File | null

    if (!sponsorId) {
      return NextResponse.json({ error: 'Sponsor ID is required' }, { status: 400 })
    }

    if (!logo) {
      return NextResponse.json({ error: 'Logo is required' }, { status: 400 })
    }

    // upload the new logo
    const logoBuffer = Buffer.from(await logo.arrayBuffer())
    const imageAsset = await uploadImage(logoBuffer, logo.name)

    // update the sponsor's logo reference
    await updateSponsorLogo(sponsorId, imageAsset._id)

    return NextResponse.json({ 
      success: true, 
      message: 'Logo updated successfully'
    })
  } catch (error) {
    console.error('Error updating sponsor logo:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to update logo' 
    }, { status: 500 })
  }
}
