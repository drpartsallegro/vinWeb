import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }





