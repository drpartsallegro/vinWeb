import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  // Create admin user if it doesn't exist
  const adminEmail = 'admin@vinweb.com'
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    
    console.log('✅ Admin user created successfully!')
    console.log('📧 Email: admin@vinweb.com')
    console.log('🔑 Password: admin123')
  } else {
    console.log('✅ Admin user already exists')
  }

  // Seed categories
  console.log('🌱 Seeding categories...')
  const categoriesPath = path.join(__dirname, '..', 'data', 'categories.json')
  const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'))
  
  for (const category of categoriesData) {
    // Create parent category
    await prisma.category.upsert({
      where: { id: category.id },
      update: {
        name: category.name,
        slug: category.slug,
        path: category.path,
      },
      create: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        path: category.path,
        parentId: null,
      },
    })

    // Create child categories
    if (category.children && category.children.length > 0) {
      for (const child of category.children) {
        await prisma.category.upsert({
          where: { id: child.id },
          update: {
            name: child.name,
            slug: child.slug,
            path: child.path,
            parentId: child.parentId,
          },
          create: {
            id: child.id,
            name: child.name,
            slug: child.slug,
            path: child.path,
            parentId: child.parentId,
          },
        })
      }
    }
  }
  
  console.log('✅ Categories seeded successfully!')

  // Seed upsell items
  console.log('🌱 Seeding upsell items...')
  
  // Clear existing upsell items and create new ones
  await prisma.upsellItem.deleteMany({})
  
  const upsellItems = [
    {
      title: 'Premium Air Filter',
      description: 'High-performance air filter for better engine performance and fuel efficiency',
      imageUrl: '/images/air-filter.jpg',
      price: 29.99,
      active: true,
      tags: ['performance', 'air-intake']
    },
    {
      title: 'LED Headlight Kit',
      description: 'Bright LED headlights for improved visibility and modern look',
      imageUrl: '/images/led-headlights.jpg',
      price: 89.99,
      active: true,
      tags: ['lighting', 'exterior']
    },
    {
      title: 'Performance Exhaust',
      description: 'Sport exhaust system for enhanced sound and performance',
      imageUrl: '/images/exhaust.jpg',
      price: 299.99,
      active: true,
      tags: ['performance', 'exhaust']
    },
    {
      title: 'All-Weather Floor Mats',
      description: 'Durable floor mats to protect your vehicle interior',
      imageUrl: '/images/floor-mats.jpg',
      price: 49.99,
      active: true,
      tags: ['interior', 'protection']
    },
    {
      title: 'Bluetooth Speaker',
      description: 'Portable Bluetooth speaker for your vehicle entertainment',
      imageUrl: '/images/bluetooth-speaker.jpg',
      price: 39.99,
      active: true,
      tags: ['electronics', 'entertainment']
    }
  ]

  await prisma.upsellItem.createMany({
    data: upsellItems
  })
  
  console.log('✅ Upsell items seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
