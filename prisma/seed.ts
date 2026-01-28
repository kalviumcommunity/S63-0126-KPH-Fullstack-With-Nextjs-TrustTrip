/* eslint-disable @typescript-eslint/no-require-imports, no-console */
// @ts-ignore - require for seed script
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data (in order to avoid conflicts)
  await prisma.refund.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("✨ Existing data cleared");

  // Create users
  console.log("👥 Creating users...");
  const users = await prisma.user.createMany({
    data: [
      {
        name: "Alice Johnson",
        email: "alice@trusttrip.com",
        password: "hashed_password_1", // In production, this would be hashed
        profileImage: "https://api.example.com/avatar/alice.jpg",
        bio: "Adventure seeker and travel enthusiast",
        phone: "+1-555-0101",
        verified: true,
      },
      {
        name: "Bob Smith",
        email: "bob@trusttrip.com",
        password: "hashed_password_2",
        profileImage: "https://api.example.com/avatar/bob.jpg",
        bio: "Budget traveler exploring the world",
        phone: "+1-555-0102",
        verified: true,
      },
      {
        name: "Carol Davis",
        email: "carol@trusttrip.com",
        password: "hashed_password_3",
        profileImage: "https://api.example.com/avatar/carol.jpg",
        bio: "Luxury travel planner",
        phone: "+1-555-0103",
        verified: true,
      },
      {
        name: "David Wilson",
        email: "david@trusttrip.com",
        password: "hashed_password_4",
        profileImage: "https://api.example.com/avatar/david.jpg",
        bio: "Cultural explorer and photographer",
        phone: "+1-555-0104",
        verified: false,
      },
      {
        name: "Emma Brown",
        email: "emma@trusttrip.com",
        password: "hashed_password_5",
        profileImage: "https://api.example.com/avatar/emma.jpg",
        bio: "Family travel specialist",
        phone: "+1-555-0105",
        verified: true,
      },
    ],
  });
  console.log(`✅ Created ${users.count} users`);

  // Fetch created users for reference
  const allUsers = await prisma.user.findMany();
  const alice = allUsers.find(
    (u: { email: string }) => u.email === "alice@trusttrip.com"
  )!;
  const bob = allUsers.find(
    (u: { email: string }) => u.email === "bob@trusttrip.com"
  )!;
  const carol = allUsers.find(
    (u: { email: string }) => u.email === "carol@trusttrip.com"
  )!;
  const david = allUsers.find(
    (u: { email: string }) => u.email === "david@trusttrip.com"
  )!;
  const emma = allUsers.find(
    (u: { email: string }) => u.email === "emma@trusttrip.com"
  )!;

  // Create projects
  console.log("🗺️  Creating projects...");
  const now = new Date();
  const projects = await prisma.project.createMany({
    data: [
      {
        title: "Summer Europe Tour",
        description: "A 3-week journey through France, Italy, and Spain",
        destination: "Europe",
        budget: 5000,
        currency: "USD",
        startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        endDate: new Date(now.getTime() + 50 * 24 * 60 * 60 * 1000), // 50 days from now
        status: "ACTIVE" as const,
        imageUrl: "https://images.example.com/europe.jpg",
        userId: alice.id,
      },
      {
        title: "Southeast Asia Backpacking",
        description:
          "Budget-friendly exploration of Thailand, Vietnam, and Cambodia",
        destination: "Southeast Asia",
        budget: 2000,
        currency: "USD",
        startDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 75 * 24 * 60 * 60 * 1000),
        status: "PLANNING" as const,
        imageUrl: "https://images.example.com/asia.jpg",
        userId: bob.id,
      },
      {
        title: "Caribbean Luxury Cruise",
        description: "All-inclusive 7-day luxury cruise to Caribbean islands",
        destination: "Caribbean",
        budget: 8000,
        currency: "USD",
        startDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 67 * 24 * 60 * 60 * 1000),
        status: "ACTIVE" as const,
        imageUrl: "https://images.example.com/caribbean.jpg",
        userId: carol.id,
      },
      {
        title: "Japan Cultural Immersion",
        description:
          "Experience traditional Japanese culture in Tokyo and Kyoto",
        destination: "Japan",
        budget: 4500,
        currency: "USD",
        startDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 110 * 24 * 60 * 60 * 1000),
        status: "PLANNING" as const,
        imageUrl: "https://images.example.com/japan.jpg",
        userId: david.id,
      },
      {
        title: "African Safari Adventure",
        description: "Wildlife safari across Kenya and Tanzania",
        destination: "Africa",
        budget: 6000,
        currency: "USD",
        startDate: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 140 * 24 * 60 * 60 * 1000),
        status: "PLANNING" as const,
        imageUrl: "https://images.example.com/africa.jpg",
        userId: alice.id,
      },
    ],
  });
  console.log(`✅ Created ${projects.count} projects`);

  // Fetch created projects for reference
  const allProjects = await prisma.project.findMany();
  const europeProject = allProjects.find(
    (p: { title: string }) => p.title === "Summer Europe Tour"
  )!;
  const asiaProject = allProjects.find(
    (p: { title: string }) => p.title === "Southeast Asia Backpacking"
  )!;

  // Create reviews
  console.log("⭐ Creating reviews...");
  const reviews = await prisma.review.createMany({
    data: [
      {
        rating: 5,
        comment:
          "Excellent trip planning! Alice did a fantastic job organizing the itinerary.",
        userId: bob.id,
        projectId: europeProject.id,
      },
      {
        rating: 4,
        comment:
          "Great destination choice, but could have been better on timing.",
        userId: carol.id,
        projectId: europeProject.id,
      },
      {
        rating: 5,
        comment: "Best travel experience ever! Cannot recommend enough.",
        userId: emma.id,
        projectId: asiaProject.id,
      },
    ],
  });
  console.log(`✅ Created ${reviews.count} reviews`);

  // Create bookings
  console.log("📅 Creating bookings...");
  const bookings = await prisma.booking.createMany({
    data: [
      {
        quantity: 2,
        totalPrice: 5000,
        status: "CONFIRMED" as const,
        userId: bob.id,
        projectId: europeProject.id,
      },
      {
        quantity: 1,
        totalPrice: 4500,
        status: "PENDING" as const,
        userId: carol.id,
        projectId: europeProject.id,
      },
      {
        quantity: 3,
        totalPrice: 2000,
        status: "CONFIRMED" as const,
        userId: emma.id,
        projectId: asiaProject.id,
      },
    ],
  });
  console.log(`✅ Created ${bookings.count} bookings`);

  // Fetch bookings for payment creation
  const allBookings = await prisma.booking.findMany();
  const booking1 = allBookings[0];
  const booking2 = allBookings[1];
  const booking3 = allBookings[2];

  // Create payments
  console.log("💳 Creating payments...");
  const payments = await prisma.payment.createMany({
    data: [
      {
        amount: 5000,
        currency: "USD",
        paymentMethod: "credit_card",
        transactionId: "txn_2024_001_alice",
        status: "COMPLETED" as const,
        paidAt: new Date(),
        userId: bob.id,
        projectId: europeProject.id,
        bookingId: booking1.id,
      },
      {
        amount: 4500,
        currency: "USD",
        paymentMethod: "paypal",
        transactionId: "txn_2024_002_carol",
        status: "PENDING" as const,
        userId: carol.id,
        projectId: europeProject.id,
        bookingId: booking2.id,
      },
      {
        amount: 2000,
        currency: "USD",
        paymentMethod: "bank_transfer",
        transactionId: "txn_2024_003_emma",
        status: "COMPLETED" as const,
        paidAt: new Date(),
        userId: emma.id,
        projectId: asiaProject.id,
        bookingId: booking3.id,
      },
    ],
  });
  console.log(`✅ Created ${payments.count} payments`);

  // Fetch payments for refund creation
  const allPayments = await prisma.payment.findMany();
  const payment1 = allPayments[0];

  // Create refunds
  console.log("🔄 Creating refunds...");
  const refunds = await prisma.refund.createMany({
    data: [
      {
        reason: "Customer requested cancellation due to health issues",
        refundAmount: 500,
        status: "APPROVED" as const,
        approvedAt: new Date(),
        paymentId: payment1.id,
        userId: bob.id,
      },
    ],
  });
  console.log(`✅ Created ${refunds.count} refunds`);

  console.log("🎉 Database seeding completed successfully!");
  console.log("\n📊 Seed Summary:");
  console.log(`  • Users: ${users.count}`);
  console.log(`  • Projects: ${projects.count}`);
  console.log(`  • Reviews: ${reviews.count}`);
  console.log(`  • Bookings: ${bookings.count}`);
  console.log(`  • Payments: ${payments.count}`);
  console.log(`  • Refunds: ${refunds.count}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error("❌ Error seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
