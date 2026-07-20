import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

/**
 * Seed script — populates the database with test data.
 *
 * Run with: npx ts-node prisma/seed.ts
 * (or via the "prisma.seed" script in package.json)
 *
 * Creates:
 * - 2 test users (owner1 and owner2)
 * - 16 properties spread across Pakistani cities
 *
 * All coordinates are real lat/lng values for the specified cities,
 * so they'll show correctly on the Leaflet map.
 */

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data (in reverse order of dependencies)
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const owner1 = await prisma.user.create({
    data: {
      email: 'ahmed@example.com',
      password: hashedPassword,
      name: 'Ahmed Khan',
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      email: 'fatima@example.com',
      password: hashedPassword,
      name: 'Fatima Ali',
    },
  });

  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@example.com',
      password: hashedPassword,
      name: 'Usman Raza',
    },
  });

  console.log(`✅ Created 3 users: ${owner1.name}, ${owner2.name}, ${buyer.name}`);

  // Property seed data — real Pakistani city coordinates
  const properties = [
    // Lahore properties
    {
      title: 'Modern 3-Bed Apartment in Gulberg',
      description: 'Spacious apartment with modern finishes in the heart of Gulberg. Walking distance to MM Alam Road restaurants and shopping.',
      price: 85000,
      type: 'RENT',
      beds: 3,
      baths: 2,
      city: 'Lahore',
      lat: 31.5204,
      lng: 74.3587,
      ownerId: owner1.id,
    },
    {
      title: 'Luxury Villa in DHA Phase 6',
      description: 'Beautiful 5-bedroom villa with landscaped garden, servant quarters, and covered parking for 3 cars.',
      price: 45000000,
      type: 'SALE',
      beds: 5,
      baths: 4,
      city: 'Lahore',
      lat: 31.4697,
      lng: 74.3762,
      ownerId: owner2.id,
    },
    {
      title: 'Studio Apartment Near UET',
      description: 'Affordable studio apartment perfect for students. Furnished with AC, bed, and study desk.',
      price: 25000,
      type: 'RENT',
      beds: 1,
      baths: 1,
      city: 'Lahore',
      lat: 31.5082,
      lng: 74.3015,
      ownerId: owner1.id,
    },
    // Karachi properties
    {
      title: 'Sea-Facing Flat in Clifton',
      description: '2-bedroom apartment with stunning sea views. 24/7 security, gym, and rooftop pool.',
      price: 120000,
      type: 'RENT',
      beds: 2,
      baths: 2,
      city: 'Karachi',
      lat: 24.8138,
      lng: 67.0300,
      ownerId: owner2.id,
    },
    {
      title: 'Penthouse in Bahria Town Karachi',
      description: 'Premium penthouse with panoramic views, private elevator, and smart home automation.',
      price: 75000000,
      type: 'SALE',
      beds: 4,
      baths: 3,
      city: 'Karachi',
      lat: 25.0700,
      lng: 67.3294,
      ownerId: owner1.id,
    },
    {
      title: 'Commercial Space in I.I. Chundrigar Road',
      description: 'Prime commercial office space on Pakistans Wall Street. 1500 sq ft open floor plan.',
      price: 200000,
      type: 'RENT',
      beds: 0,
      baths: 2,
      city: 'Karachi',
      lat: 24.8500,
      lng: 67.0104,
      ownerId: owner2.id,
    },
    // Islamabad properties
    {
      title: 'Family Home in F-7 Sector',
      description: 'Elegant 4-bedroom house in one of Islamabads most prestigious sectors. Margalla Hills view.',
      price: 60000000,
      type: 'SALE',
      beds: 4,
      baths: 3,
      city: 'Islamabad',
      lat: 33.7215,
      lng: 73.0576,
      ownerId: owner1.id,
    },
    {
      title: '2-Bed Apartment in Centaurus Mall Area',
      description: 'Modern apartment walking distance to Centaurus Mall. Gym, pool, and underground parking.',
      price: 65000,
      type: 'RENT',
      beds: 2,
      baths: 1,
      city: 'Islamabad',
      lat: 33.7077,
      lng: 73.0498,
      ownerId: owner2.id,
    },
    {
      title: 'Plot in DHA Phase 2 Islamabad',
      description: '1 Kanal residential plot in prime location. Corner plot with extra green belt view.',
      price: 35000000,
      type: 'SALE',
      beds: 0,
      baths: 0,
      city: 'Islamabad',
      lat: 33.5180,
      lng: 73.1020,
      ownerId: owner1.id,
    },
    // Rawalpindi properties
    {
      title: 'Cozy House in Bahria Town Phase 8',
      description: '3-bedroom house in a gated community. Park-facing, near mosque and school.',
      price: 35000,
      type: 'RENT',
      beds: 3,
      baths: 2,
      city: 'Rawalpindi',
      lat: 33.5455,
      lng: 73.1228,
      ownerId: owner2.id,
    },
    {
      title: 'Commercial Plaza on Murree Road',
      description: 'Shop and office spaces available. High footfall area near Liaquat Bagh.',
      price: 28000000,
      type: 'SALE',
      beds: 0,
      baths: 1,
      city: 'Rawalpindi',
      lat: 33.5916,
      lng: 73.0489,
      ownerId: owner1.id,
    },
    // Faisalabad properties
    {
      title: 'Furnished Apartment in Madina Town',
      description: 'Fully furnished 2-bed apartment near Faisalabad Dry Port. All utilities included.',
      price: 30000,
      type: 'RENT',
      beds: 2,
      baths: 1,
      city: 'Faisalabad',
      lat: 31.4187,
      lng: 73.0791,
      ownerId: owner2.id,
    },
    {
      title: 'Factory Building in Industrial Area',
      description: 'Large industrial building suitable for textile manufacturing. 10,000 sq ft covered area.',
      price: 50000000,
      type: 'SALE',
      beds: 0,
      baths: 2,
      city: 'Faisalabad',
      lat: 31.3920,
      lng: 73.1130,
      ownerId: owner1.id,
    },
    // Multan properties
    {
      title: 'Heritage House Near Shrine',
      description: 'Traditional Multani house with modern renovations. Blue pottery accents throughout.',
      price: 15000000,
      type: 'SALE',
      beds: 3,
      baths: 2,
      city: 'Multan',
      lat: 30.1984,
      lng: 71.4687,
      ownerId: owner2.id,
    },
    // Peshawar properties
    {
      title: 'New Construction in Hayatabad Phase 7',
      description: 'Brand new 4-bed house in the safest sector of Peshawar. Double-story with basement.',
      price: 25000000,
      type: 'SALE',
      beds: 4,
      baths: 3,
      city: 'Peshawar',
      lat: 34.0007,
      lng: 71.4990,
      ownerId: owner1.id,
    },
    // Quetta properties
    {
      title: 'Mountain View Cottage',
      description: 'Charming cottage with stunning mountain views. Perfect for a peaceful retreat.',
      price: 20000,
      type: 'RENT',
      beds: 2,
      baths: 1,
      city: 'Quetta',
      lat: 30.1798,
      lng: 66.9750,
      ownerId: owner2.id,
    },
  ];

  // Bulk insert all properties
  for (const property of properties) {
    await prisma.property.create({
      data: {
        ...property,
        mediaUrls: [],
      },
    });
  }

  console.log(`✅ Created ${properties.length} properties across Pakistani cities`);
  console.log('');
  console.log('📧 Test accounts (password for all: password123):');
  console.log('   - ahmed@example.com (Owner 1)');
  console.log('   - fatima@example.com (Owner 2)');
  console.log('   - buyer@example.com (Buyer)');
  console.log('');
  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
