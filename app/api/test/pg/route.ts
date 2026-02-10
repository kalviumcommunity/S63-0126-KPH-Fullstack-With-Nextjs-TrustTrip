import { Pool, PoolClient } from "pg";
import { NextResponse } from "next/server";

// Create a connection pool for direct PostgreSQL connections
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    })
  : null;

/**
 * Direct PostgreSQL Connection Test API
 *
 * This endpoint demonstrates direct PostgreSQL database connectivity
 * using the 'pg' library, as an alternative to Prisma ORM.
 *
 * Query Parameters:
 * - query: Optional SQL query to execute (default: SELECT NOW())
 *
 * Response includes:
 * - Connection status
 * - Server time
 * - Query results (if custom query provided)
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customQuery = searchParams.get("query");

  // Check if DATABASE_URL is configured
  if (!pool) {
    return NextResponse.json(
      {
        success: false,
        message: "DATABASE_URL environment variable is not configured",
        error: "Missing database connection string",
        hint: "Set DATABASE_URL in your environment variables",
        example: "postgresql://user:password@host:5432/database",
      },
      { status: 500 }
    );
  }

  let client: PoolClient | null = null;

  try {
    // Get a client from the pool
    client = await pool.connect();

    // Execute the query
    let result;
    if (customQuery) {
      // Execute custom query (sanitized by user)
      result = await client.query(customQuery);
    } else {
      // Default test query
      result = await client.query(`
        SELECT
          NOW() as server_time,
          current_database() as database_name,
          version() as postgresql_version,
          pg_backend_pid() as backend_pid
      `);
    }

    // Get table information
    const tableInfo = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    // Get row counts for each table
    const tableCounts = await Promise.all(
      tableInfo.rows.map(async (table: { table_name: string }) => {
        try {
          const countResult = await client.query(
            `SELECT COUNT(*) as count FROM "${table.table_name}"`
          );
          return {
            table: table.table_name,
            count: parseInt(countResult.rows[0].count, 10),
          };
        } catch {
          return {
            table: table.table_name,
            count: null,
          };
        }
      })
    );

    // Release the client back to the pool
    client.release();

    return NextResponse.json({
      success: true,
      message: "Direct PostgreSQL connection successful!",
      connection: {
        database: result.rows[0].database_name,
        serverTime: result.rows[0].server_time,
        postgreSQLVersion: result.rows[0].postgresql_version,
        backendPid: result.rows[0].backend_pid,
        sslEnabled: process.env.NODE_ENV === "production",
      },
      tables: tableCounts,
      executedQuery:
        customQuery ||
        "SELECT NOW(), current_database(), version(), pg_backend_pid()",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Release the client if it was acquired
    if (client) {
      client.release();
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    console.error("Direct PostgreSQL connection error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: errorMessage,
        troubleshooting: [
          "Verify DATABASE_URL is correct",
          "Check that your IP is allowed in security group/firewall rules",
          "Ensure the database instance is running and accessible",
          "Verify SSL/TLS configuration for production",
        ],
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Execute Custom Query
 *
 * Allows execution of custom SQL queries for testing purposes.
 * In production, this should be secured with proper authentication.
 */

export async function POST(request: Request) {
  const { query } = await request.json();

  if (!query) {
    return NextResponse.json(
      {
        success: false,
        message: "No query provided",
        hint: 'Include a "query" field in the request body',
      },
      { status: 400 }
    );
  }

  // Basic SQL injection prevention - whitelist allowed operations
  const upperQuery = query.toUpperCase().trim();
  const allowedPatterns = [
    /^SELECT\s+/,
    /^INSERT\s+INTO\s+["']?\w+["']?/,
    /^UPDATE\s+["']?\w+["']?/,
    /^DELETE\s+FROM\s+["']?\w+["']?/,
  ];

  const isAllowed = allowedPatterns.some((pattern) => pattern.test(upperQuery));

  if (!isAllowed) {
    return NextResponse.json(
      {
        success: false,
        message: "Query type not allowed",
        hint: "Only SELECT, INSERT, UPDATE, and DELETE queries are permitted",
      },
      { status: 403 }
    );
  }

  if (!pool) {
    return NextResponse.json(
      {
        success: false,
        message: "DATABASE_URL is not configured",
      },
      { status: 500 }
    );
  }

  let client: PoolClient | null = null;

  try {
    client = await pool.connect();
    const result = await client.query(query);
    client.release();

    return NextResponse.json({
      success: true,
      message: "Query executed successfully",
      affectedRows: result.rowCount,
      results: result.rows,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (client) {
      client.release();
    }

    return NextResponse.json(
      {
        success: false,
        message: "Query execution failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

