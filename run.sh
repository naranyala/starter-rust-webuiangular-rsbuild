#!/bin/bash

# Master build and run script for Rust WebUI Vue project
# This script handles the complete build pipeline for frontend and backend

set -e  # Exit on any error

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "======================================"
echo "Rust WebUI Application - Build Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${GREEN}[BUILD]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    print_step "Checking prerequisites..."

    # Check for Bun
    if ! command -v bun &> /dev/null; then
        print_error "Bun is not installed. Please install Bun from https://bun.sh/"
        exit 1
    fi
    print_status "Bun found: $(bun --version)"

    # Check for Cargo/Rust
    if ! command -v cargo &> /dev/null; then
        print_error "Cargo is not installed. Please install Rust from https://rustup.rs/"
        exit 1
    fi
    print_status "Cargo found: $(cargo --version)"

    echo ""
}

# Install frontend dependencies if needed
install_frontend_deps() {
    print_step "Installing frontend dependencies..."

    if [ ! -d "frontend/node_modules" ]; then
        print_status "Installing npm packages..."
        cd frontend
        bun install
        cd ..
        print_status "Frontend dependencies installed!"
    else
        print_status "Frontend dependencies already installed."
    fi

    echo ""
}

# Build frontend
build_frontend() {
    print_step "Building frontend..."

    if [ ! -f "build-frontend.js" ]; then
        print_error "build-frontend.js not found!"
        exit 1
    fi

    bun build-frontend.js

    # Check for build output - either in root dist/ or frontend/dist/
    local frontend_index=""
    if [ -f "dist/index.html" ]; then
        frontend_index="dist/index.html"
    elif [ -f "frontend/dist/browser/index.html" ]; then
        frontend_index="frontend/dist/browser/index.html"
    elif [ -f "frontend/dist/index.html" ]; then
        frontend_index="frontend/dist/index.html"
    fi
    
    local required_files=(
        "dist/index.html"
        "dist/static/js/main.js"
        "dist/static/js/webui.js"
        "dist/static/js/winbox.min.js"
    )
    local missing=0
    for f in "${required_files[@]}"; do
        if [ ! -f "$f" ]; then
            print_error "Frontend build failed - missing: $f"
            missing=1
        fi
    done
    if [ "$missing" -ne 0 ]; then
        exit 1
    fi

    print_status "Frontend build completed!"

    echo ""
}

# Build Rust application
build_rust() {
    print_step "Building Rust application..."

    # Clean previous build artifacts if requested
    if [ "$1" == "--clean" ]; then
        print_status "Cleaning previous Rust build..."
        cargo clean
    fi

    # Build the Rust application
    cargo build

    if [ ! -f "target/debug/rustwebui-app" ]; then
        print_error "Rust build failed - executable not found!"
        exit 1
    fi

    print_status "Rust build completed!"

    echo ""
}

# Run post-build script
post_build() {
    print_step "Running post-build steps..."

    if [ -f "post-build.sh" ]; then
        chmod +x post-build.sh
        ./post-build.sh
        print_status "Post-build completed!"
    else
        print_warning "post-build.sh not found - skipping post-build steps"
    fi

    echo ""
}

# Build release version
build_release() {
    print_step "Building release version..."

    # Build frontend for production
    cd frontend
    bun install
    bun run build
    cd ..

    # Build Rust in release mode
    cargo build --release

    # Run post-build for release
    if [ -f "post-build.sh" ]; then
        chmod +x post-build.sh
        ./post-build.sh
    fi

    print_status "Release build completed!"

    echo ""
}

# Run the application
run_app() {
    print_step "Running application..."

    # Determine which executable to run
    if [ -f "target/debug/app" ]; then
        print_status "Running debug version..."
        ./target/debug/app
    elif [ -f "target/release/app" ]; then
        print_status "Running release version..."
        ./target/release/app
    elif [ -f "target/debug/rustwebui-app" ]; then
        print_warning "Using unrenamed executable..."
        ./target/debug/rustwebui-app
    else
        print_error "No executable found. Please build first."
        exit 1
    fi
}

# Clean all build artifacts
clean_all() {
    print_step "Cleaning all build artifacts..."

    # Clean Rust build
    if [ -d "target" ]; then
        cargo clean
        print_status "Rust build artifacts cleaned"
    fi

    # Clean frontend build
    if [ -d "frontend/dist" ]; then
        rm -rf frontend/dist
        print_status "Frontend dist cleaned"
    fi

    # Clean root runtime dist (used by backend/WebUI)
    if [ -d "dist" ]; then
        rm -rf dist
        print_status "Root dist cleaned"
    fi

    # Clean generated runtime JS copies
    rm -f static/js/main.js static/js/winbox.min.js
    print_status "Generated static JS cleaned"

    # Clean caches
    if [ -d "frontend/node_modules/.cache" ]; then
        rm -rf frontend/node_modules/.cache
        print_status "Frontend cache cleaned"
    fi

    print_status "All build artifacts cleaned!"

    echo ""
}

# Run backend tests
test_backend() {
    print_step "Running backend tests..."

    cargo test -- --test-threads=1

    if [ $? -eq 0 ]; then
        print_status "Backend tests passed!"
    else
        print_error "Backend tests failed!"
        exit 1
    fi

    echo ""
}

# Run frontend tests
test_frontend() {
    print_step "Running frontend tests..."

    cd frontend
    
    # Check if Bun tests exist, otherwise fall back to Karma
    if ls src/**/*.bun.spec.ts 1> /dev/null 2>&1; then
        print_status "Running Bun tests..."
        bun test
        local result=$?
    else
        print_status "Running Karma tests..."
        bun run test:karma
        local result=$?
    fi
    
    cd ..

    if [ $result -eq 0 ]; then
        print_status "Frontend tests passed!"
    else
        print_error "Frontend tests failed!"
        exit 1
    fi

    echo ""
}

# Run all tests
run_tests() {
    print_step "Running all tests..."

    test_backend
    test_frontend

    print_status "All tests passed!"
}

# Show help
show_help() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  (no option)      Build and run the application (default)"
    echo "  --build           Build only (frontend + Rust)"
    echo "  --build-frontend  Build frontend only"
    echo "  --build-rust     Build Rust only"
    echo "  --release        Build release version"
    echo "  --run            Run the application (requires build)"
    echo "  --test            Run all tests (backend + frontend)"
    echo "  --test-backend    Run backend tests only"
    echo "  --test-frontend   Run frontend tests only"
    echo "  --clean          Clean all build artifacts"
    echo "  --rebuild        Clean and rebuild everything"
    echo "  --help, -h       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0               # Build and run"
    echo "  $0 --build       # Build only"
    echo "  $0 --test        # Run all tests"
    echo "  $0 --rebuild     # Clean and rebuild"
    echo "  $0 --release     # Build release version"
    echo ""
}

# Main execution
main() {
    case "${1:-}" in
        --build)
            check_prerequisites
            install_frontend_deps
            build_frontend
            build_rust
            post_build
            ;;
        --build-frontend)
            check_prerequisites
            install_frontend_deps
            build_frontend
            ;;
        --build-rust)
            check_prerequisites
            build_rust
            post_build
            ;;
        --release)
            check_prerequisites
            build_release
            ;;
        --run)
            run_app
            ;;
        --test)
            run_tests
            ;;
        --test-backend)
            test_backend
            ;;
        --test-frontend)
            test_frontend
            ;;
        --clean)
            clean_all
            ;;
        --rebuild)
            clean_all
            check_prerequisites
            install_frontend_deps
            build_frontend
            build_rust
            post_build
            ;;
        --help|-h)
            show_help
            ;;
        "")
            # Default: build and run
            check_prerequisites
            install_frontend_deps
            build_frontend
            build_rust
            post_build
            run_app
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
