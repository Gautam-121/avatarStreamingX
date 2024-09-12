import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import bcrypt from 'bcrypt'
import path from 'path'
import jwt from 'jsonwebtoken'

const DATA_FILE = path.join(process.cwd(), 'data', 'users.json')

// JWT secret key (replace with your secret key in a real app)
const JWT_SECRET_KEY = 'your_jwt_secret_key'

type User = {
  name: string
  email: string
  password: string
}

// Function to validate email using regex
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// POST method handler
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    // Validate email and password fields
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    let users: User[] = []

    // Read the users.json file to get the list of registered users
    try {
      const data = await fs.readFile(DATA_FILE, 'utf8')
      users = JSON.parse(data)
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }
      throw error
    }

    // Find the user with the provided email
    const user = users.find(user => user.email === email)
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Generate a JWT token
    const token = jwt.sign(
      {
        name: user.name,
        email: user.email,
      },
      JWT_SECRET_KEY,
      { expiresIn: '1h' } // Token expires in 1 hour
    )

    // Return the JWT token in the response
    return NextResponse.json({
      message: 'Login successful',
      data:{
        name: user.name,
        email: user.email
      },
      token,
    })
  } catch (error: unknown) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
