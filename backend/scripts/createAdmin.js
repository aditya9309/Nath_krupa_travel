import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'

dotenv.config()

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL })
    if (existingAdmin) {
      console.log('Admin user already exists')
      process.exit(0)
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL,
      phone: '1234567890',
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
      isApproved: true,
      isBlocked: false
    })

    console.log('Admin user created successfully:', admin.email)
    process.exit(0)
  } catch (error) {
    console.error('Error creating admin:', error)
    process.exit(1)
  }
}

createAdmin()
