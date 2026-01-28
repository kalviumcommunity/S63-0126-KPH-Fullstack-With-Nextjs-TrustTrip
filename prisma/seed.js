const path = require("path");

// Import the generated Prisma client directly - use require to get client code
const absolutePath = path.resolve(
  __dirname,
  "..",
  ".prisma",
  "client",
  "default",
  "index.js"
);
const PrismaModule = require(absolutePath);

const { PrismaClient } = PrismaModule;

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
  const alice = allUsers.find((u) => u.email === "alice@trusttrip.com");
  const bob = allUsers.find((u) => u.email === "bob@trusttrip.com");
  const carol = allUsers.find((u) => u.email === "carol@trusttrip.com");
  const david = allUsers.find((u) => u.email === "david@trusttrip.com");
  const emma = allUsers.find((u) => u.email === "emma@trusttrip.com");

  // Create projects
  console.log("🗺️  Creating projects...");
  const projects = await prisma.project.createMany({
    data: [
      {
        title: "Summer Europe Tour",
        description: "Exploring the best of Europe in summer",
        destination: "Europe",
        budget: 5000,
        currency: "USD",
        startDate: new Date("2026-06-01"),
        endDate: new Date("2026-08-31"),
        imageUrl: "https://api.example.com/projects/europe.jpg",
        userId: alice.id,
      },
      {
        title: "Southeast Asia Backpacking",
        description: "Budget-friendly backpacking adventure",
        destination: "Southeast Asia",
        budget: 3000,
        currency: "USD",
        startDate: new Date("2026-07-01"),
        endDate: new Date("2026-09-30"),
        imageUrl: "https://api.example.com/projects/asia.jpg",
        userId: bob.id,
      },
      {
        title: "Japan Cultural Experience",
        description: "Deep dive into Japanese culture",
        destination: "Japan",
        budget: 4500,
        currency: "USD",
        startDate: new Date("2026-05-15"),
        endDate: new Date("2026-06-15"),
        imageUrl: "https://api.example.com/projects/japan.jpg",
        userId: carol.id,
      },
      {
        title: "Caribbean Beach Escape",
        description: "Relaxing beach vacation in the Caribbean",
        destination: "Caribbean",
        budget: 3500,
        currency: "USD",
        startDate: new Date("2026-12-01"),
        endDate: new Date("2026-12-25"),
        imageUrl: "https://api.example.com/projects/caribbean.jpg",
        userId: emma.id,
      },
    ],
  });
  console.log(`✅ Created ${projects.count} projects`);

  // Fetch created projects for reference
  const allProjects = await prisma.project.findMany();
  const europeProject = allProjects.find(
    (p) => p.title === "Summer Europe Tour"
  );
  const asiaProject = allProjects.find(
    (p) => p.title === "Southeast Asia Backpacking"
  );

  // Create reviews
  console.log("⭐ Creating reviews...");
  await prisma.review.createMany({
    data: [
      {
        rating: 5,
        comment: "Amazing experience! Highly recommended.",
        userId: bob.id,
        projectId: europeProject.id,
      },
      {
        rating: 4,
        comment: "Good value for money but crowded during peak season.",
        userId: emma.id,
        projectId: europeProject.id,
      },
      {
        rating: 5,
        comment: "Best backpacking trip ever!",
        userId: alice.id,
        projectId: asiaProject.id,
      },
      {
        rating: 3,
        comment: "Fun but physically demanding.",
        userId: carol.id,
        projectId: asiaProject.id,
      },
    ],
  });
  console.log("✅ Created 4 reviews");

  // Create bookings
  console.log("🎫 Creating bookings...");
  const bookings = await prisma.booking.createMany({
    data: [
      {
        quantity: 2,
        totalPrice: 10000,
        userId: bob.id,
        projectId: europeProject.id,
      },
      {
        quantity: 1,
        totalPrice: 3000,
        userId: emma.id,
        projectId: asiaProject.id,
      },
      {
        quantity: 3,
        totalPrice: 7500,
        userId: carol.id,
        projectId: europeProject.id,
      },
    ],
  });
  console.log(`✅ Created ${bookings.count} bookings`);

  // Fetch bookings for payment creation
  const allBookings = await prisma.booking.findMany();

  // Create payments
  console.log("💳 Creating payments...");
  const payments = await prisma.payment.createMany({
    data: [
      {
        amount: 10000,
        currency: "USD",
        paymentMethod: "credit_card",
        transactionId: "TXN_001_" + Date.now(),
        userId: bob.id,
        projectId: europeProject.id,
        bookingId: allBookings[0].id,
      },
      {
        amount: 3000,
        currency: "USD",
        paymentMethod: "paypal",
        transactionId: "TXN_002_" + Date.now(),
        userId: emma.id,
        projectId: asiaProject.id,
        bookingId: allBookings[1].id,
      },
      {
        amount: 7500,
        currency: "USD",
        paymentMethod: "bank_transfer",
        transactionId: "TXN_003_" + Date.now(),
        userId: carol.id,
        projectId: europeProject.id,
        bookingId: allBookings[2].id,
      },
    ],
  });
  console.log(`✅ Created ${payments.count} payments`);

  // Fetch payment for refund creation
  const firstPayment = await prisma.payment.findFirst();

  // Create refunds
  console.log("🔄 Creating refunds...");
  await prisma.refund.createMany({
    data: [
      {
        reason: "Customer requested cancellation",
        refundAmount: 2500,
        paymentId: firstPayment.id,
        userId: bob.id,
      },
    ],
  });
  console.log("✅ Created 1 refund request");

  console.log("\n✨ Database seeded successfully!");
  console.log("\n📊 Summary:");
  console.log(`  - Users: ${users.count}`);
  console.log(`  - Projects: ${projects.count}`);
  console.log(`  - Reviews: 4`);
  console.log(`  - Bookings: ${bookings.count}`);
  console.log(`  - Payments: ${payments.count}`);
  console.log(`  - Refunds: 1`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
