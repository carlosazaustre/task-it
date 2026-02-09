import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user

      const isAuthPage = nextUrl.pathname.startsWith('/login') ||
                         nextUrl.pathname.startsWith('/register')

      const isApiAuth = nextUrl.pathname.startsWith('/api/auth')

      // Allow auth API routes always
      if (isApiAuth) return true

      // If not logged in and not on auth page, redirect to login
      if (!isLoggedIn && !isAuthPage) {
        return Response.redirect(new URL('/login', nextUrl))
      }

      // If logged in and on auth page, redirect to home
      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL('/', nextUrl))
      }

      return true
    },
  },
} satisfies NextAuthConfig
