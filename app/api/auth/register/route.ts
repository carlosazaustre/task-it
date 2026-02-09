import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations/auth'
import { registerLimiter, getClientIp } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    // Rate limiting: 3 registrations per hour per IP
    const ip = getClientIp(request)
    const rateLimitResult = registerLimiter(ip)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta de nuevo mas tarde.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              Math.ceil((rateLimitResult.retryAfterMs ?? 0) / 1000)
            ),
          },
        }
      )
    }

    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { email, password, name } = parsed.data

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya esta registrado' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        tags: {
          create: [
            { name: 'Trabajo', color: 'blue' },
            { name: 'Personal', color: 'green' },
            { name: 'Urgente', color: 'red' },
            { name: 'Reunion', color: 'purple' },
            { name: 'Idea', color: 'amber' },
          ],
        },
        settings: {
          create: {},
        },
      },
      select: { id: true, email: true, name: true },
    })

    return NextResponse.json(user, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
