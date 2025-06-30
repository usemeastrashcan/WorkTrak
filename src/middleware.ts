// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ALLOWED_EMAIL = process.env.NEXT_PUBLIC_EMAIL

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log('Session:', session)

  // Redirect to login if not authenticated with allowed email
  if (!session || session.user.email !== ALLOWED_EMAIL) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|auth|login|_next/static|_next/image|favicon.ico).*)'],
}