import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'pv-holidays-super-secret-key-change-in-production'
)

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@pvholidays.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'pvadmin2024'

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD
}

export async function createAdminToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

export async function getAdminToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('admin_token')?.value || null
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const token = await getAdminToken()
  if (!token) return false
  return verifyAdminToken(token)
}
