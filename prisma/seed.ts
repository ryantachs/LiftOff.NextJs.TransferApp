import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import bcrypt from "bcryptjs"
import fs from "node:fs"
import path from "node:path"

// Load .env (tsx doesn't auto-load it)
const envPath = path.resolve(process.cwd(), ".env")
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    if (!process.env[key]) process.env[key] = trimmed.slice(eq + 1).trim()
  }
}

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required")
}

const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding database...")

  // Clean existing data (in reverse dependency order)
  await prisma.auditLog.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.extraVehicleClass.deleteMany()
  await prisma.extra.deleteMany()
  await prisma.driver.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.vehicleClass.deleteMany()
  await prisma.quote.deleteMany()
  await prisma.savedAddress.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.pricingRule.deleteMany()
  await prisma.user.deleteMany()

  console.log("  Cleared existing data")

  // --- Users ---
  const passwordHash = await bcrypt.hash("Password123!", 10)

  const admin = await prisma.user.create({
    data: {
      email: "admin@liftoff.dev",
      name: "Admin User",
      phone: "07700100001",
      passwordHash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  })

  const dispatcher = await prisma.user.create({
    data: {
      email: "dispatch@liftoff.dev",
      name: "Sarah Dispatcher",
      phone: "07700100002",
      passwordHash,
      role: "DISPATCHER",
      emailVerified: new Date(),
    },
  })

  const customer1 = await prisma.user.create({
    data: {
      email: "john@example.com",
      name: "John Smith",
      phone: "07700200001",
      passwordHash,
      role: "CUSTOMER",
      emailVerified: new Date(),
    },
  })

  const customer2 = await prisma.user.create({
    data: {
      email: "jane@example.com",
      name: "Jane Doe",
      phone: "07700200002",
      passwordHash,
      role: "CUSTOMER",
      emailVerified: new Date(),
    },
  })

  const customer3 = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Test Customer",
      phone: "07700200003",
      passwordHash,
      role: "CUSTOMER",
      emailVerified: new Date(),
    },
  })

  console.log("  Created 5 users (admin, dispatcher, 3 customers)")

  // --- Vehicle Classes ---
  const standardClass = await prisma.vehicleClass.create({
    data: {
      name: "Standard Saloon",
      description: "Comfortable saloon car, ideal for up to 3 passengers with standard luggage.",
      maxPassengers: 3,
      maxLuggage: 2,
      baseRatePerKm: 1.80,
      minimumFare: 25.00,
      sortOrder: 1,
    },
  })

  const executiveClass = await prisma.vehicleClass.create({
    data: {
      name: "Executive",
      description: "Premium executive vehicle with leather interior and extra legroom.",
      maxPassengers: 3,
      maxLuggage: 2,
      baseRatePerKm: 2.80,
      minimumFare: 45.00,
      sortOrder: 2,
    },
  })

  const mpvClass = await prisma.vehicleClass.create({
    data: {
      name: "MPV / Estate",
      description: "Spacious MPV or estate car, perfect for families or extra luggage.",
      maxPassengers: 5,
      maxLuggage: 4,
      baseRatePerKm: 2.20,
      minimumFare: 35.00,
      sortOrder: 3,
    },
  })

  const luxuryClass = await prisma.vehicleClass.create({
    data: {
      name: "Luxury",
      description: "Top-of-the-range luxury vehicle for the ultimate travel experience.",
      maxPassengers: 3,
      maxLuggage: 2,
      baseRatePerKm: 4.50,
      minimumFare: 75.00,
      sortOrder: 4,
    },
  })

  const minibusClass = await prisma.vehicleClass.create({
    data: {
      name: "Minibus",
      description: "8-seater minibus for larger groups travelling together.",
      maxPassengers: 8,
      maxLuggage: 8,
      baseRatePerKm: 3.20,
      minimumFare: 55.00,
      sortOrder: 5,
    },
  })

  console.log("  Created 5 vehicle classes")

  // --- Vehicles ---
  const vehicles = await Promise.all([
    prisma.vehicle.create({
      data: {
        registration: "AB21 XYZ",
        make: "Toyota",
        model: "Prius",
        year: 2021,
        colour: "Silver",
        vehicleClassId: standardClass.id,
        motExpiry: new Date("2026-08-15"),
        serviceExpiry: new Date("2026-06-01"),
      },
    }),
    prisma.vehicle.create({
      data: {
        registration: "CD22 ABC",
        make: "Volkswagen",
        model: "Passat",
        year: 2022,
        colour: "Black",
        vehicleClassId: standardClass.id,
        motExpiry: new Date("2026-11-20"),
        serviceExpiry: new Date("2026-09-15"),
      },
    }),
    prisma.vehicle.create({
      data: {
        registration: "EF22 DEF",
        make: "Mercedes-Benz",
        model: "E-Class",
        year: 2022,
        colour: "Black",
        vehicleClassId: executiveClass.id,
        motExpiry: new Date("2026-10-01"),
        serviceExpiry: new Date("2026-07-20"),
      },
    }),
    prisma.vehicle.create({
      data: {
        registration: "GH23 GHI",
        make: "BMW",
        model: "5 Series",
        year: 2023,
        colour: "Grey",
        vehicleClassId: executiveClass.id,
        motExpiry: new Date("2027-01-15"),
        serviceExpiry: new Date("2026-11-01"),
      },
    }),
    prisma.vehicle.create({
      data: {
        registration: "IJ22 JKL",
        make: "Ford",
        model: "Galaxy",
        year: 2022,
        colour: "Blue",
        vehicleClassId: mpvClass.id,
        motExpiry: new Date("2026-09-10"),
        serviceExpiry: new Date("2026-05-15"),
      },
    }),
    prisma.vehicle.create({
      data: {
        registration: "KL23 MNO",
        make: "Mercedes-Benz",
        model: "S-Class",
        year: 2023,
        colour: "Black",
        vehicleClassId: luxuryClass.id,
        motExpiry: new Date("2027-03-01"),
        serviceExpiry: new Date("2026-12-15"),
      },
    }),
    prisma.vehicle.create({
      data: {
        registration: "MN22 PQR",
        make: "Mercedes-Benz",
        model: "Sprinter",
        year: 2022,
        colour: "White",
        vehicleClassId: minibusClass.id,
        motExpiry: new Date("2026-07-20"),
        serviceExpiry: new Date("2026-04-30"),
      },
    }),
  ])

  console.log("  Created 7 vehicles")

  // --- Drivers ---
  const drivers = await Promise.all([
    prisma.driver.create({
      data: {
        name: "Mike Johnson",
        email: "mike.j@liftoff.dev",
        phone: "07700300001",
        licenceNumber: "JOHNS810150M99AB",
        isAvailable: true,
        vehicleId: vehicles[0].id,
      },
    }),
    prisma.driver.create({
      data: {
        name: "David Williams",
        email: "david.w@liftoff.dev",
        phone: "07700300002",
        licenceNumber: "WILLI750620D12CD",
        isAvailable: true,
        vehicleId: vehicles[2].id,
      },
    }),
    prisma.driver.create({
      data: {
        name: "Steve Brown",
        email: "steve.b@liftoff.dev",
        phone: "07700300003",
        licenceNumber: "BROWN880315S45EF",
        isAvailable: true,
        vehicleId: vehicles[4].id,
      },
    }),
    prisma.driver.create({
      data: {
        name: "Ali Hassan",
        email: "ali.h@liftoff.dev",
        phone: "07700300004",
        licenceNumber: "HASSA900725A78GH",
        isAvailable: false,
        vehicleId: vehicles[5].id,
      },
    }),
    prisma.driver.create({
      data: {
        name: "Tom Clarke",
        email: "tom.c@liftoff.dev",
        phone: "07700300005",
        licenceNumber: "CLARK850110T23IJ",
        isAvailable: true,
        vehicleId: vehicles[6].id,
      },
    }),
  ])

  console.log("  Created 5 drivers")

  // --- Extras ---
  const childSeat = await prisma.extra.create({
    data: {
      name: "Child Seat",
      description: "Forward-facing child seat (9 months – 4 years)",
      price: 10.00,
      sortOrder: 1,
    },
  })

  const meetGreet = await prisma.extra.create({
    data: {
      name: "Meet & Greet",
      description: "Driver meets you in arrivals with a name board",
      price: 15.00,
      sortOrder: 2,
    },
  })

  const extraLuggage = await prisma.extra.create({
    data: {
      name: "Extra Luggage",
      description: "Additional large suitcase beyond the standard allowance",
      price: 5.00,
      sortOrder: 3,
    },
  })

  const wifi = await prisma.extra.create({
    data: {
      name: "Wi-Fi Hotspot",
      description: "Portable Wi-Fi device for the journey",
      price: 8.00,
      sortOrder: 4,
    },
  })

  const bottledWater = await prisma.extra.create({
    data: {
      name: "Bottled Water",
      description: "Complimentary chilled bottled water",
      price: 3.00,
      sortOrder: 5,
    },
  })

  // Link extras to vehicle classes
  await prisma.extraVehicleClass.createMany({
    data: [
      // Child seat available on all classes
      { extraId: childSeat.id, vehicleClassId: standardClass.id },
      { extraId: childSeat.id, vehicleClassId: executiveClass.id },
      { extraId: childSeat.id, vehicleClassId: mpvClass.id },
      { extraId: childSeat.id, vehicleClassId: luxuryClass.id },
      { extraId: childSeat.id, vehicleClassId: minibusClass.id },
      // Meet & Greet – all classes
      { extraId: meetGreet.id, vehicleClassId: standardClass.id },
      { extraId: meetGreet.id, vehicleClassId: executiveClass.id },
      { extraId: meetGreet.id, vehicleClassId: mpvClass.id },
      { extraId: meetGreet.id, vehicleClassId: luxuryClass.id },
      { extraId: meetGreet.id, vehicleClassId: minibusClass.id },
      // Extra luggage – all classes
      { extraId: extraLuggage.id, vehicleClassId: standardClass.id },
      { extraId: extraLuggage.id, vehicleClassId: executiveClass.id },
      { extraId: extraLuggage.id, vehicleClassId: mpvClass.id },
      { extraId: extraLuggage.id, vehicleClassId: luxuryClass.id },
      { extraId: extraLuggage.id, vehicleClassId: minibusClass.id },
      // Wi-Fi – executive & luxury only
      { extraId: wifi.id, vehicleClassId: executiveClass.id },
      { extraId: wifi.id, vehicleClassId: luxuryClass.id },
      // Bottled water – executive & luxury only
      { extraId: bottledWater.id, vehicleClassId: executiveClass.id },
      { extraId: bottledWater.id, vehicleClassId: luxuryClass.id },
    ],
  })

  console.log("  Created 5 extras with vehicle class links")

  // --- Pricing Rules ---
  await prisma.pricingRule.createMany({
    data: [
      {
        name: "Weekend Surcharge",
        type: "SURCHARGE",
        value: 10.00,
        isPercentage: true,
        daysOfWeek: [0, 6], // Sunday, Saturday
        isActive: true,
      },
      {
        name: "Bank Holiday Surcharge",
        type: "SURCHARGE",
        value: 15.00,
        isPercentage: true,
        appliesFrom: new Date("2026-03-25"),
        appliesTo: new Date("2026-03-25"),
        daysOfWeek: [],
        isActive: true,
      },
      {
        name: "Early Bird Discount",
        type: "DISCOUNT",
        value: 5.00,
        isPercentage: true,
        daysOfWeek: [1, 2, 3, 4, 5], // Weekdays
        isActive: true,
      },
      {
        name: "Executive Class Peak Surcharge",
        type: "SURCHARGE",
        value: 8.00,
        isPercentage: false,
        daysOfWeek: [5], // Friday
        vehicleClassId: executiveClass.id,
        isActive: true,
      },
    ],
  })

  console.log("  Created 4 pricing rules")

  // --- Saved Addresses ---
  await prisma.savedAddress.createMany({
    data: [
      {
        userId: customer1.id,
        label: "Home",
        address: "42 Oak Street, Manchester, M1 1AA",
        lat: 53.4808,
        lng: -2.2426,
      },
      {
        userId: customer1.id,
        label: "Office",
        address: "100 King Street, Manchester, M2 4WU",
        lat: 53.4794,
        lng: -2.2453,
      },
      {
        userId: customer2.id,
        label: "Home",
        address: "15 Elm Road, London, SW1A 1AA",
        lat: 51.5014,
        lng: -0.1419,
      },
    ],
  })

  console.log("  Created 3 saved addresses")

  // --- Bookings ---
  const bookings = await Promise.all([
    // Confirmed booking – assigned to driver
    prisma.booking.create({
      data: {
        reference: "LO-ABC123",
        status: "ASSIGNED",
        userId: customer1.id,
        journeyType: "PICKUP",
        pickupAddress: "Manchester Airport, Terminal 2",
        pickupLat: 53.3588,
        pickupLng: -2.2727,
        dropoffAddress: "42 Oak Street, Manchester, M1 1AA",
        dropoffLat: 53.4808,
        dropoffLng: -2.2426,
        distanceKm: 16.5,
        flightNumber: "BA1392",
        pickupDateTime: new Date("2026-03-01T14:30:00Z"),
        passengers: 2,
        luggage: 2,
        vehicleClassId: standardClass.id,
        extras: JSON.stringify([{ name: "Meet & Greet", price: 15 }]),
        basePrice: 29.70,
        extrasPrice: 15.00,
        totalPrice: 44.70,
        paymentMethod: "STRIPE",
        paidAt: new Date("2026-02-20T10:00:00Z"),
        driverId: drivers[0].id,
        vehicleId: vehicles[0].id,
        assignedAt: new Date("2026-02-21T09:00:00Z"),
      },
    }),

    // Confirmed – awaiting driver assignment
    prisma.booking.create({
      data: {
        reference: "LO-DEF456",
        status: "CONFIRMED",
        userId: customer2.id,
        journeyType: "DROPOFF",
        pickupAddress: "15 Elm Road, London, SW1A 1AA",
        pickupLat: 51.5014,
        pickupLng: -0.1419,
        dropoffAddress: "London Heathrow Airport, Terminal 5",
        dropoffLat: 51.4700,
        dropoffLng: -0.4543,
        distanceKm: 24.3,
        flightNumber: "VS401",
        pickupDateTime: new Date("2026-03-05T06:00:00Z"),
        passengers: 1,
        luggage: 1,
        vehicleClassId: executiveClass.id,
        extras: JSON.stringify([]),
        basePrice: 68.04,
        extrasPrice: 0,
        totalPrice: 68.04,
        paymentMethod: "STRIPE",
        paidAt: new Date("2026-02-19T15:30:00Z"),
      },
    }),

    // In progress
    prisma.booking.create({
      data: {
        reference: "LO-GHI789",
        status: "IN_PROGRESS",
        userId: customer1.id,
        journeyType: "PICKUP",
        pickupAddress: "Birmingham Airport",
        pickupLat: 52.4539,
        pickupLng: -1.7480,
        dropoffAddress: "The ICC, Birmingham, B1 2EA",
        dropoffLat: 52.4806,
        dropoffLng: -1.9139,
        distanceKm: 14.2,
        flightNumber: "EZY6901",
        pickupDateTime: new Date("2026-02-22T12:00:00Z"),
        passengers: 3,
        luggage: 3,
        vehicleClassId: mpvClass.id,
        extras: JSON.stringify([{ name: "Child Seat", price: 10 }]),
        basePrice: 35.00,
        extrasPrice: 10.00,
        totalPrice: 45.00,
        paymentMethod: "STRIPE",
        paidAt: new Date("2026-02-18T20:00:00Z"),
        driverId: drivers[2].id,
        vehicleId: vehicles[4].id,
        assignedAt: new Date("2026-02-20T11:00:00Z"),
      },
    }),

    // Completed
    prisma.booking.create({
      data: {
        reference: "LO-JKL012",
        status: "COMPLETED",
        userId: customer3.id,
        journeyType: "PICKUP",
        pickupAddress: "London Gatwick Airport, South Terminal",
        pickupLat: 51.1537,
        pickupLng: -0.1821,
        dropoffAddress: "Brighton Station, BN1 2SS",
        dropoffLat: 50.8291,
        dropoffLng: -0.1413,
        distanceKm: 42.0,
        pickupDateTime: new Date("2026-02-15T18:00:00Z"),
        passengers: 2,
        luggage: 2,
        vehicleClassId: standardClass.id,
        extras: JSON.stringify([]),
        basePrice: 75.60,
        extrasPrice: 0,
        totalPrice: 75.60,
        paymentMethod: "STRIPE",
        paidAt: new Date("2026-02-10T09:00:00Z"),
        driverId: drivers[0].id,
        vehicleId: vehicles[0].id,
        assignedAt: new Date("2026-02-12T14:00:00Z"),
      },
    }),

    // Cancelled
    prisma.booking.create({
      data: {
        reference: "LO-MNO345",
        status: "CANCELLED",
        userId: customer2.id,
        journeyType: "DROPOFF",
        pickupAddress: "22 Park Lane, Leeds, LS1 1AA",
        pickupLat: 53.7996,
        pickupLng: -1.5491,
        dropoffAddress: "Leeds Bradford Airport",
        dropoffLat: 53.8659,
        dropoffLng: -1.6606,
        distanceKm: 11.8,
        pickupDateTime: new Date("2026-02-28T05:00:00Z"),
        passengers: 1,
        luggage: 1,
        vehicleClassId: standardClass.id,
        extras: JSON.stringify([]),
        basePrice: 25.00,
        extrasPrice: 0,
        totalPrice: 25.00,
        paymentMethod: "STRIPE",
        paidAt: new Date("2026-02-16T12:00:00Z"),
        cancelledAt: new Date("2026-02-18T08:00:00Z"),
        cancellationReason: "Flight cancelled",
      },
    }),

    // Pending payment
    prisma.booking.create({
      data: {
        reference: "LO-PQR678",
        status: "PENDING_PAYMENT",
        userId: customer3.id,
        journeyType: "PICKUP",
        pickupAddress: "Edinburgh Airport",
        pickupLat: 55.9500,
        pickupLng: -3.3725,
        dropoffAddress: "1 Princes Street, Edinburgh, EH2 2EQ",
        dropoffLat: 55.9533,
        dropoffLng: -3.1883,
        distanceKm: 13.0,
        flightNumber: "BA1472",
        pickupDateTime: new Date("2026-03-10T20:00:00Z"),
        passengers: 2,
        luggage: 2,
        vehicleClassId: executiveClass.id,
        extras: JSON.stringify([{ name: "Meet & Greet", price: 15 }, { name: "Bottled Water", price: 3 }]),
        basePrice: 45.00,
        extrasPrice: 18.00,
        totalPrice: 63.00,
        paymentMethod: "STRIPE",
      },
    }),

    // Manual payment booking (for dispatch)
    prisma.booking.create({
      data: {
        reference: "LO-STU901",
        status: "CONFIRMED",
        userId: customer1.id,
        journeyType: "DROPOFF",
        pickupAddress: "10 Downing Street, London, SW1A 2AA",
        pickupLat: 51.5034,
        pickupLng: -0.1276,
        dropoffAddress: "London City Airport",
        dropoffLat: 51.5048,
        dropoffLng: 0.0495,
        distanceKm: 15.2,
        pickupDateTime: new Date("2026-03-08T07:00:00Z"),
        passengers: 1,
        luggage: 1,
        vehicleClassId: luxuryClass.id,
        extras: JSON.stringify([{ name: "Wi-Fi Hotspot", price: 8 }]),
        basePrice: 75.00,
        extrasPrice: 8.00,
        totalPrice: 83.00,
        paymentMethod: "MANUAL",
        paidAt: new Date("2026-02-22T11:00:00Z"),
        internalNotes: "VIP client – account invoiced monthly",
      },
    }),
  ])

  console.log(`  Created ${bookings.length} bookings`)

  // --- Audit Logs ---
  await prisma.auditLog.createMany({
    data: [
      {
        bookingId: bookings[0].id,
        action: "STATUS_CHANGE",
        actor: dispatcher.email,
        changes: JSON.stringify({ from: "CONFIRMED", to: "ASSIGNED", driverId: drivers[0].id }),
      },
      {
        bookingId: bookings[2].id,
        action: "STATUS_CHANGE",
        actor: "system",
        changes: JSON.stringify({ from: "ASSIGNED", to: "IN_PROGRESS" }),
      },
      {
        bookingId: bookings[3].id,
        action: "STATUS_CHANGE",
        actor: drivers[0].email,
        changes: JSON.stringify({ from: "IN_PROGRESS", to: "COMPLETED" }),
      },
      {
        bookingId: bookings[4].id,
        action: "CANCELLED",
        actor: customer2.email,
        changes: JSON.stringify({ reason: "Flight cancelled" }),
      },
    ],
  })

  console.log("  Created 4 audit log entries")
  console.log("")
  console.log("✅ Seed complete!")
  console.log("")
  console.log("  Test accounts (all use password: Password123!):")
  console.log("    Admin:      admin@liftoff.dev")
  console.log("    Dispatcher:  dispatch@liftoff.dev")
  console.log("    Customer 1:  john@example.com")
  console.log("    Customer 2:  jane@example.com")
  console.log("    Customer 3:  test@example.com")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
