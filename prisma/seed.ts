import { PrismaClient, BusType, ScheduleStatus, BookingStatus, RefundStatus, RefundRule } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean existing data in correct order (respecting foreign key constraints)
  await prisma.refund.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.schedule.deleteMany()
  await prisma.route.deleteMany()
  await prisma.bus.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️  Cleaned existing data')

  // Create Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+91-9876543210',
        dateOfBirth: new Date('1990-05-15'),
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '+91-9876543211',
        dateOfBirth: new Date('1985-08-22'),
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike.johnson@example.com',
        firstName: 'Mike',
        lastName: 'Johnson',
        phoneNumber: '+91-9876543212',
        dateOfBirth: new Date('1992-12-03'),
      },
    }),
  ])

  console.log('👥 Created users:', users.length)

  // Create Buses
  const buses = await Promise.all([
    prisma.bus.create({
      data: {
        busNumber: 'TT-001',
        capacity: 40,
        busType: BusType.STANDARD,
        amenities: ['AC', 'WiFi', 'USB Charging'],
      },
    }),
    prisma.bus.create({
      data: {
        busNumber: 'TT-002',
        capacity: 30,
        busType: BusType.PREMIUM,
        amenities: ['AC', 'WiFi', 'USB Charging', 'Entertainment', 'Snacks'],
      },
    }),
    prisma.bus.create({
      data: {
        busNumber: 'TT-003',
        capacity: 20,
        busType: BusType.LUXURY,
        amenities: ['AC', 'WiFi', 'USB Charging', 'Entertainment', 'Meals', 'Recliner Seats'],
      },
    }),
    prisma.bus.create({
      data: {
        busNumber: 'TT-004',
        capacity: 24,
        busType: BusType.SLEEPER,
        amenities: ['AC', 'WiFi', 'USB Charging', 'Sleeper Berths', 'Blankets'],
      },
    }),
  ])

  console.log('🚌 Created buses:', buses.length)

  // Create Routes
  const routes = await Promise.all([
    // Routes for Bus 1 (Standard)
    prisma.route.create({
      data: {
        routeCode: 'DEL-MUM-001',
        departureCity: 'Delhi',
        arrivalCity: 'Mumbai',
        distance: 1400.5,
        estimatedDuration: 840, // 14 hours
        basePrice: 1200.0,
        busId: buses[0].id,
      },
    }),
    prisma.route.create({
      data: {
        routeCode: 'MUM-DEL-001',
        departureCity: 'Mumbai',
        arrivalCity: 'Delhi',
        distance: 1400.5,
        estimatedDuration: 840,
        basePrice: 1200.0,
        busId: buses[0].id,
      },
    }),
    // Routes for Bus 2 (Premium)
    prisma.route.create({
      data: {
        routeCode: 'DEL-BLR-002',
        departureCity: 'Delhi',
        arrivalCity: 'Bangalore',
        distance: 2150.0,
        estimatedDuration: 1200, // 20 hours
        basePrice: 2000.0,
        busId: buses[1].id,
      },
    }),
    // Routes for Bus 3 (Luxury)
    prisma.route.create({
      data: {
        routeCode: 'MUM-BLR-003',
        departureCity: 'Mumbai',
        arrivalCity: 'Bangalore',
        distance: 980.0,
        estimatedDuration: 720, // 12 hours
        basePrice: 2500.0,
        busId: buses[2].id,
      },
    }),
    // Routes for Bus 4 (Sleeper)
    prisma.route.create({
      data: {
        routeCode: 'DEL-KOL-004',
        departureCity: 'Delhi',
        arrivalCity: 'Kolkata',
        distance: 1470.0,
        estimatedDuration: 900, // 15 hours
        basePrice: 1800.0,
        busId: buses[3].id,
      },
    }),
  ])

  console.log('🛣️  Created routes:', routes.length)

  // Create Schedules (upcoming and past trips)
  const now = new Date()
  const schedules = await Promise.all([
    // Future schedules
    prisma.schedule.create({
      data: {
        departureTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        arrivalTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 840 * 60 * 1000),
        availableSeats: 35,
        priceMultiplier: 1.0,
        routeId: routes[0].id,
      },
    }),
    prisma.schedule.create({
      data: {
        departureTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        arrivalTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 1200 * 60 * 1000),
        availableSeats: 28,
        priceMultiplier: 1.2, // Weekend surcharge
        routeId: routes[2].id,
      },
    }),
    prisma.schedule.create({
      data: {
        departureTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        arrivalTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 720 * 60 * 1000),
        availableSeats: 18,
        priceMultiplier: 1.1,
        routeId: routes[3].id,
      },
    }),
    // Past schedule for completed booking
    prisma.schedule.create({
      data: {
        departureTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        arrivalTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 900 * 60 * 1000),
        availableSeats: 20,
        priceMultiplier: 1.0,
        status: ScheduleStatus.COMPLETED,
        routeId: routes[4].id,
      },
    }),
  ])

  console.log('📅 Created schedules:', schedules.length)

  // Create Bookings
  const bookings = await Promise.all([
    // Active booking - can be refunded
    prisma.booking.create({
      data: {
        bookingNumber: 'TT-20240127-001',
        seatNumber: 'A1',
        passengerName: 'John Doe',
        passengerPhone: '+91-9876543210',
        ticketPrice: 1200.0,
        userId: users[0].id,
        scheduleId: schedules[0].id,
      },
    }),
    // Future booking - premium price
    prisma.booking.create({
      data: {
        bookingNumber: 'TT-20240127-002',
        seatNumber: 'B5',
        passengerName: 'Jane Smith',
        passengerPhone: '+91-9876543211',
        ticketPrice: 2400.0, // base price * 1.2 multiplier
        userId: users[1].id,
        scheduleId: schedules[1].id,
      },
    }),
    // Near-departure booking
    prisma.booking.create({
      data: {
        bookingNumber: 'TT-20240127-003',
        seatNumber: 'C10',
        passengerName: 'Mike Johnson',
        passengerPhone: '+91-9876543212',
        ticketPrice: 2750.0, // luxury bus with multiplier
        userId: users[2].id,
        scheduleId: schedules[2].id,
      },
    }),
    // Completed booking
    prisma.booking.create({
      data: {
        bookingNumber: 'TT-20240120-001',
        seatNumber: 'S2',
        passengerName: 'John Doe',
        passengerPhone: '+91-9876543210',
        ticketPrice: 1800.0,
        bookingStatus: BookingStatus.CONFIRMED,
        userId: users[0].id,
        scheduleId: schedules[3].id,
      },
    }),
  ])

  console.log('🎫 Created bookings:', bookings.length)

  // Create Refunds (demonstrating different scenarios)
  const refunds = await Promise.all([
    // Refund for booking made 2 days in advance (5% deduction)
    prisma.refund.create({
      data: {
        refundNumber: 'REF-20240127-001',
        originalAmount: 1200.0,
        processingFee: 50.0,
        cancellationFee: 60.0, // 5% of 1200
        deductionPercentage: 5.0,
        refundAmount: 1090.0, // 1200 - 50 - 60
        hoursBeforeDeparture: 48,
        appliedRule: RefundRule.STANDARD_24H_PLUS,
        refundStatus: RefundStatus.COMPLETED,
        processedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
        completedAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
        userId: users[0].id,
        bookingId: bookings[0].id,
      },
    }),
    // Pending refund for near-departure booking (25% deduction)
    prisma.refund.create({
      data: {
        refundNumber: 'REF-20240127-002',
        originalAmount: 2750.0,
        processingFee: 75.0,
        cancellationFee: 687.5, // 25% of 2750
        deductionPercentage: 25.0,
        refundAmount: 1987.5, // 2750 - 75 - 687.5
        hoursBeforeDeparture: 8,
        appliedRule: RefundRule.STANDARD_6_12H,
        refundStatus: RefundStatus.PROCESSING,
        processedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        userId: users[2].id,
        bookingId: bookings[2].id,
      },
    }),
  ])

  console.log('💰 Created refunds:', refunds.length)

  console.log('✅ Database seeding completed successfully!')
  
  // Print summary
  console.log('\n📊 Summary:')
  console.log(`   Users: ${users.length}`)
  console.log(`   Buses: ${buses.length}`)
  console.log(`   Routes: ${routes.length}`)
  console.log(`   Schedules: ${schedules.length}`)
  console.log(`   Bookings: ${bookings.length}`)
  console.log(`   Refunds: ${refunds.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })