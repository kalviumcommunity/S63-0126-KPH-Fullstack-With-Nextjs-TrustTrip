import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test database connection by counting users
    const userCount = await prisma.user.count();
    
    // Test database connection by counting projects
    const projectCount = await prisma.project.count();

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      data: {
        usersCount: userCount,
        projectsCount: projectCount,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
