import dotenv from 'dotenv'
import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'


const MONGO_URI = process.env.MONGO_URI
dotenv.config()

const ADMIN = {
  fullName: 'Md Majid Hussain',
  username: 'adminmajid',
  email: 'admin@iqra.edu',
  password: 'Admin@123',
  role: 'admin',
  isActive: true,
}

async function seedAdmin() {
  if (!MONGO_URI?.trim()) {
    console.error('MONGO_URI is not set.')
    process.exit(1)
  }

  try {
    await mongoose.connect(MONGO_URI)
    console.log('Connected to MongoDB.')

    const existing = await User.findOne({
      $or: [{ email: ADMIN.email }, { username: ADMIN.username }],
    })

    if (existing) {
      console.log('Admin user already exists.')
      await mongoose.disconnect()
      process.exit(0)
      return
    }

    const hashedPassword = await bcrypt.hash(ADMIN.password, 10)
    await User.create({
      fullName: ADMIN.fullName,
      username: ADMIN.username,
      email: ADMIN.email,
      password: hashedPassword,
      role: ADMIN.role,
      isActive: ADMIN.isActive,
    })

    console.log('Admin user created successfully.')
  } catch (err) {
    console.error('Seed failed:', err.message)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('Database connection closed.')
    process.exit(0)
  }
}

seedAdmin()
