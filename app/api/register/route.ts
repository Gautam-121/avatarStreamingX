import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import bcrypt from 'bcrypt'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'users.json')

type User = {
  name: string
  email: string
  password: string
}

// Type guard to check if the error is an instance of NodeJS.ErrnoException
function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === 'object' && error !== null && 'code' in error
}

// Function to validate email using regex
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Function to validate password with required criteria
function isValidPassword(password: string): boolean {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/
  return passwordRegex.test(password)
}

// POST method handler
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    // Check if all fields are provided
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Validate password format
    if (!isValidPassword(password)) {
      return NextResponse.json({
        error: 'Password must be 8-20 characters, include at least one uppercase letter, one lowercase letter, one number, and one special character.',
      }, { status: 400 })
    }

    let users: User[] = []

    try {
      const data = await fs.readFile(DATA_FILE, 'utf8')
      users = JSON.parse(data)
    } catch (error: unknown) {
      if (isNodeError(error) && error.code === 'ENOENT') {
        await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
        await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2))
        users = []
      } else {
        throw error
      }
    }

    // Check if the email is already registered
    if (users.find(user => user.email === email)) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = { name, email, password: hashedPassword }

    // Add the new user and save to the file
    users.push(newUser)
    await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2))

    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 })
  } catch (error: unknown) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    )
  }
}
