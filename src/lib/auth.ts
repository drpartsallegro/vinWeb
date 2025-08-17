import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/db'

// Create providers array conditionally
const providers = [
  CredentialsProvider({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null
      }

      const user = await prisma.user.findUnique({
        where: {
          email: credentials.email.toLowerCase(),
        },
      })

      if (!user || !user.password) {
        return null
      }

      // Compare password
      const isPasswordValid = await compare(credentials.password, user.password)
      if (!isPasswordValid) {
        return null
      }

      // Link any existing guest orders to this user account
      try {
        await prisma.orderRequest.updateMany({
          where: {
            guestEmail: credentials.email.toLowerCase(),
            userId: null, // Only update orders that aren't already linked
          },
          data: {
            userId: user.id,
            guestEmail: null, // Clear guest email since it's now linked to a user
          },
        })
        
        console.log(`Linked guest orders to user account: ${user.email}`)
      } catch (linkError) {
        console.error('Error linking guest orders on login:', linkError)
        // Don't fail login if linking fails
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    },
  }),
]

// Only add Google provider if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && 
    process.env.GOOGLE_CLIENT_ID !== 'placeholder' && process.env.GOOGLE_CLIENT_SECRET !== 'placeholder') {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  )
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          role: user.role,
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          role: token.role,
        },
      }
    },
    async redirect({ url, baseUrl }) {
      // If admin user is logging in, redirect to admin dashboard
      if (url.startsWith(baseUrl) && url.includes('callbackUrl=/admin')) {
        return `${baseUrl}/admin`
      }
      
      // Check if user is admin and redirect accordingly
      // This will be handled in the login component
      if (url.startsWith(baseUrl)) return url
      else if (url.startsWith('/')) return `${baseUrl}${url}`
      else return baseUrl
    },
  },
}
