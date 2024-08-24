import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json('Hello from API!');
}

//https://medium.com/@abilsavio/email-contact-form-using-nextjs-app-router-60c29fe70644