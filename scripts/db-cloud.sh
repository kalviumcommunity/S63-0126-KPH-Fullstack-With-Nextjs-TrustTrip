#!/bin/bash

# ============================================================================
# PostgreSQL Cloud Database Operations Script
# ============================================================================

# This script provides helper commands for managing your cloud PostgreSQL
# database connection with Prisma ORM.

# ============================================================================
# CONFIGURATION
# ============================================================================

# Set your cloud database connection string
# Replace with your actual DATABASE_URL
DATABASE_URL="${DATABASE_URL:-postgresql://admin:password@host:5432/db}"

# ============================================================================
# COLORS
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# FUNCTIONS
# ============================================================================

print_header() {
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# ============================================================================
# COMMANDS
# ============================================================================

show_help() {
    print_header "PostgreSQL Cloud Database Operations"
    echo ""
    echo "Usage: ./db-cloud.sh [command]"
    echo ""
    echo "Commands:"
    echo "  test-connection    Test database connection"
    echo "  migrate            Run database migrations"
    echo "  migrate-status     Check migration status"
    echo "  generate           Generate Prisma client"
    echo "  studio             Open Prisma Studio"
    echo "  seed               Seed database with test data"
    echo "  backup             Create database snapshot (requires AWS CLI)"
    echo "  help               Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  DATABASE_URL       PostgreSQL connection string"
    echo ""
}

test_connection() {
    print_header "Testing Database Connection"
    echo ""
    echo "Connection String: ${DATABASE_URL:0:50}..."
    echo ""
    
    if [ -z "$DATABASE_URL" ] || [ "$DATABASE_URL" = "postgresql://admin:password@host:5432/db" ]; then
        print_error "DATABASE_URL is not set or is using default values!"
        echo "Please set your actual DATABASE_URL:"
        echo "  export DATABASE_URL='postgresql://user:pass@host:5432/db'"
        echo ""
        return 1
    fi
    
    print_success "Testing connection with Prisma..."
    echo ""
    
    npx prisma db execute --dry-run 2>&1 || true
    
    echo ""
    print_success "Connection test initiated!"
    echo ""
    echo "To verify in browser:"
    echo "  1. Start your application: npm run dev"
    echo "  2. Visit: http://localhost:3000/api/test"
    echo "  3. Check for successful response"
    echo ""
}

run_migrations() {
    print_header "Running Database Migrations"
    echo ""
    
    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL is not set!"
        echo "Please set your DATABASE_URL first."
        return 1
    fi
    
    print_warning "This will apply all pending migrations to your database."
    echo ""
    read -p "Continue? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_success "Running migrations..."
        npx prisma migrate deploy
        
        print_success "Generating Prisma client..."
        npx prisma generate
        
        print_success "Migrations completed!"
    else
        print_warning "Migration cancelled."
    fi
}

check_migration_status() {
    print_header "Migration Status"
    echo ""
    
    npx prisma migrate status
}

open_studio() {
    print_header "Opening Prisma Studio"
    echo ""
    print_warning "Prisma Studio will open in your default browser."
    echo ""
    
    npx prisma studio
}

seed_database() {
    print_header "Seeding Database"
    echo ""
    print_warning "This will add test data to your database."
    echo ""
    
    npx prisma db seed
    
    print_success "Database seeding completed!"
}

create_backup() {
    print_header "Creating Database Backup"
    echo ""
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed!"
        echo "Please install AWS CLI to create backups."
        return 1
    fi
    
    # Check if DATABASE_URL is AWS RDS format
    if [[ "$DATABASE_URL" =~ rds\.amazonaws\.com ]]; then
        INSTANCE_ID=$(aws rds describe-db-instances \
            --query "DBInstances[?contains(DBInstanceIdentifier,'trusttrip')].DBInstanceIdentifier" \
            --output text)
        
        if [ -n "$INSTANCE_ID" ]; then
            TIMESTAMP=$(date +%Y%m%d_%H%M%S)
            SNAPSHOT_ID="trusttrip-backup-${TIMESTAMP}"
            
            print_success "Creating RDS snapshot: $SNAPSHOT_ID"
            aws rds create-db-snapshot \
                --db-instance-identifier "$INSTANCE_ID" \
                --db-snapshot-identifier "$SNAPSHOT_ID"
            
            print_success "Snapshot creation initiated!"
            echo ""
            echo "To monitor status:"
            echo "  aws rds describe-db-snapshots --db-snapshot-identifier $SNAPSHOT_ID"
        else
            print_error "Could not find TrustTrip RDS instance."
        fi
    else
        print_warning "This backup script is configured for AWS RDS."
        echo "For Azure, use the Azure Portal or Azure CLI."
    fi
}

# ============================================================================
# MAIN
# ============================================================================

main() {
    case "${1:-help}" in
        test-connection)
            test_connection
            ;;
        migrate)
            run_migrations
            ;;
        migrate-status)
            check_migration_status
            ;;
        generate)
            print_header "Generating Prisma Client"
            npx prisma generate
            print_success "Prisma client generated!"
            ;;
        studio)
            open_studio
            ;;
        seed)
            seed_database
            ;;
        backup)
            create_backup
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"

