import { NextResponse } from 'next/server';

export async function GET() {
  const email = process.env.MY_EMAIL;
  const password = process.env.MY_PASSWORD;

  return NextResponse.json({
    hasEmail: !!email,
    hasPassword: !!password,
    emailPrefix: email ? email.substring(0, 3) + '***' : null,
    passwordLength: password ? password.length : 0,
    nodeEnv: process.env.NODE_ENV,
  });
}
