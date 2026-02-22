# Rust WebUI Angular Rsbuild Starter

A production-ready desktop application framework combining a Rust backend with an Angular frontend, using WebUI for native window integration and Angular CLI for modern frontend bundling.

## Quick Start

```bash
# From project root
./run.sh
```

### Common Commands

```bash
./run.sh --build            # Build frontend and backend
./run.sh --build-frontend   # Build frontend only
./run.sh --build-rust       # Build backend only
./run.sh --release          # Create optimized release build
./run.sh --run              # Run existing build
./run.sh --clean            # Clean build artifacts
./run.sh --rebuild          # Clean and rebuild
```

### Frontend Development

```bash
cd frontend
bun run dev                 # Start development server (port 4200)
bun run build               # Production build with Angular CLI
bun run preview             # Preview production build
```

## Project Overview

This project provides a complete desktop application framework with:

- **Rust Backend**: High-performance native core with SQLite database, comprehensive error handling, and layered architecture
- **Angular Frontend**: Modern MVVM-pattern UI with WinBox windowing, Angular CLI bundler, and reactive state management
- **WebUI Integration**: Native desktop windowing with bidirectional frontend-backend communication
- **Production Build Pipeline**: Automated build, asset management, and distribution packaging
- **DevTools Panel**: Comprehensive system diagnostics exposing backend and frontend metrics

## Technology Stack

### Backend

- **Language**: Rust 2024 Edition
- **Windowing**: webui-rs (WebUI)
- **Database**: rusqlite 0.32 with bundled SQLite
- **Serialization**: serde, serde_json, serde_yaml, rmp-serde, serde_cbor, toml
- **Error Handling**: anyhow, thiserror
- **Logging**: log, env_logger
- **System**: dirs, tempfile, notify, hostname, whoami, num_cpus
- **Security**: base64, hmac, sha2, rand, jsonwebtoken, hex, md5
- **Network**: url, reqwest
- **Compression**: flate2, zstd, brotli, lz4_flex, snap

### Frontend

- **Framework**: Angular 19.2
- **Language**: TypeScript 5.5
- **Bundler**: Angular CLI with esbuild
- **Runtime**: Bun 1.3
- **Windowing**: WinBox 0.2.82
- **State Management**: RxJS 7.8, Zone.js 0.15, Angular Signals
- **Styling**: Sass 1.97
- **Code Quality**: Biome 2.4
- **Testing**: Jasmine, Karma, Protractor

### Build System

- **Backend**: Cargo with custom build.rs
- **Frontend**: Angular CLI production builds
- **Orchestration**: Bash scripts (run.sh, build-dist.sh, build-frontend.js)
- **CI/CD Ready**: Cross-platform support (Windows, macOS, Linux)

## Project Structure

```
.
├── src/                        # Rust backend source
│   ├── main.rs                 # Application entrypoint
│   ├── utils_demo.rs           # Demo utilities
│   ├── core/                   # Core architecture layers
│   │   ├── domain/             # Domain entities
│   │   ├── application/        # Application handlers
│   │   ├── infrastructure/     # External integrations
│   │   │   ├── database/       # SQLite connection and models
│   │   │   ├── logging/        # Logging system
│   │   │   ├── config.rs       # Configuration loading
│   │   │   └── event_bus.rs    # Event dispatch
│   │   └── presentation/       # WebUI handlers
│   └── utils/                  # Utility modules
│       ├── compression/        # Compression utilities
│       ├── crypto/             # Cryptography functions
│       └── system/             # System information
│
├── frontend/                   # Angular frontend
│   ├── src/                    # Source code
│   │   ├── main.ts             # Bootstrap and global handlers
│   │   ├── index.html          # Application template
│   │   ├── environments/       # Environment configurations
│   │   ├── models/             # Data interfaces (M in MVVM)
│   │   ├── viewmodels/         # Business logic (VM in MVVM)
│   │   │   ├── logging.viewmodel.ts
│   │   │   ├── event-bus.viewmodel.ts
│   │   │   ├── window-state.viewmodel.ts
│   │   │   ├── devtools.service.ts
│   │   │   └── api-client.ts
│   │   ├── views/              # Components (V in MVVM)
│   │   │   ├── app.component.ts
│   │   │   └── devtools/       # DevTools components
│   │   ├── core/               # Shared infrastructure
│   │   │   ├── global-error.service.ts
│   │   │   └── global-error.handler.ts
│   │   └── assets/             # Static assets
│   ├── docs/                   # Frontend documentation
│   ├── e2e/                    # End-to-end tests
│   ├── angular.json            # Angular configuration
│   ├── package.json            # Dependencies and scripts
│   └── tsconfig.json           # TypeScript configuration
│
├── config/                     # Runtime configuration
│   └── app.config.toml         # Application settings
│
├── static/                     # Runtime static assets
│   ├── js/                     # JavaScript files
│   └── css/                    # Stylesheets
│
├── dist/                       # Distribution output
│   ├── index.html              # Main HTML file
│   └── static/                 # Compiled assets
│
├── target/                     # Cargo build output
│   ├── debug/                  # Debug builds
│   └── release/                # Release builds
│
├── thirdparty/                 # Vendored sources
│   └── webui-c-src/            # WebUI C source
│
├── docs/                       # Documentation
│   ├── 01-introduction.md      # Project overview
│   ├── 02-architecture.md      # Architecture details
│   ├── 03-build-system.md      # Build instructions
│   ├── 04-communication.md     # Communication patterns
│   ├── 05-dependencies.md      # Dependency reference
│   ├── 06-improvements.md      # Suggested enhancements
│   ├── 07-getting-started.md   # Getting started guide
│   ├── 08-project-structure.md # Repository layout
│   ├── 09-errors-as-values.md  # Error handling guide
│   └── 10-testing.md           # Testing guide
│
├── build.rs                    # Rust build script
├── Cargo.toml                  # Rust dependencies
├── Cargo.lock                  # Locked dependency versions
├── run.sh                      # Master build/run script
├── build-dist.sh               # Distribution package builder
├── build-frontend.js           # Frontend build orchestration
└── post-build.sh               # Post-build processing
```

## Architecture

### Backend Architecture

The Rust backend follows a layered architecture:

1. **Domain Layer**: Core business entities and domain logic
2. **Application Layer**: Use-case orchestration and handlers
3. **Infrastructure Layer**: External integrations (database, logging, config)
4. **Presentation Layer**: WebUI handlers and bridge

### Frontend Architecture

The Angular frontend uses the MVVM pattern:

1. **Models**: Pure data interfaces and type definitions
2. **ViewModels**: Business logic and state management services
3. **Views**: Angular components for UI rendering
4. **Core**: Cross-cutting concerns (error handling, events)

### DevTools Architecture

The DevTools panel provides comprehensive system diagnostics:

1. **DevTools Service**: Gathers metrics from backend and frontend
2. **DevTools Component**: Main tabbed interface with 11 panels
3. **Backend Endpoints**: System info, memory, process, network, database, config APIs
4. **Auto-Refresh**: 2-second interval updates for dynamic data

### Communication Pattern

Frontend-backend communication uses WebUI bindings:

```
Frontend JS --[JSON]--> window.bind() --> Rust Backend
Rust Backend --[JSON]--> window.run_js() --> Frontend JS
```

## Build System

### Frontend Build (Angular CLI)

Angular CLI provides:

- Production-optimized builds with AOT compilation
- TypeScript and Sass support
- Bundle optimization and tree-shaking
- Source maps for debugging

### Backend Build (Cargo)

Standard Rust build with custom build.rs for:

- WebUI C source compilation
- Configuration generation
- Asset embedding support

### Distribution Build

The build-dist.sh script creates self-contained packages:

- Windows: ZIP archive with executable
- macOS: TAR.GZ archive with executable
- Linux: TAR.GZ archive with executable

## Configuration

### Application Configuration

Edit `config/app.config.toml` to customize:

- Application name and version
- Window behavior and appearance
- Database path
- Logging settings

Example:

```toml
[app]
name = "Rust WebUI Application"
version = "1.0.0"

[window]
title = "My Application"
width = 1200
height = 800

[database]
path = "app.db"

[logging]
level = "info"
file = "logs/application.log"
```

### Frontend Configuration

Edit `frontend/angular.json` to customize:

- Build output paths
- Asset handling
- Development server settings

## Development Workflow

### 1. Initial Setup

```bash
# Install Rust (if not installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Bun (if not installed)
curl -fsSL https://bun.sh/install | bash

# Install frontend dependencies
cd frontend
bun install
```

### 2. Development

```bash
# Terminal 1: Frontend development server
cd frontend
bun run dev

# Terminal 2: Rust backend
cargo run
```

### 3. Production Build

```bash
# Full production build
./run.sh --release

# Create distribution package
./build-dist.sh build-release
```

## Error Handling

The project implements "Errors as Values" pattern:

### Backend

- Result<T, E> types for fallible operations
- Centralized error types in core/error.rs
- Automatic error conversion and propagation

### Frontend

- Global error capture and classification
- Severity-based error handling
- User-friendly error modal with technical details
- Error history tracking and statistics

See `docs/09-errors-as-values.md` for detailed guide.

## Logging

### Backend Logging

Configurable logging with multiple levels:

```rust
log::info!("Operation completed");
log::error!("Operation failed: {}", error);
```

Logs written to console and file (configurable).

### Frontend Logging

Structured logging with contexts:

```typescript
logger.info('Component initialized', { data });
logger.error('Operation failed', error);
```

## Testing

### Backend Tests

```bash
cargo test
```

### Frontend Tests

```bash
cd frontend
bun run test          # Unit tests
bun run e2e           # End-to-end tests
```

## Deployment

### Development

Run directly with `./run.sh` for development.

### Production

1. Build release: `./run.sh --release`
2. Create package: `./build-dist.sh build-release`
3. Distribute archive to users

### Cross-Platform

The build system supports:

- **Linux**: Static linking, no external dependencies
- **Windows**: MSVC toolchain, Windows API integration
- **macOS**: Cocoa integration, native windowing

## Troubleshooting

### Build Fails

```bash
# Clean and rebuild
./run.sh --rebuild

# Frontend only
cd frontend
rm -rf dist node_modules
bun install
bun run build
```

### Runtime Errors

1. Check `application.log` for backend errors
2. Open browser DevTools for frontend errors
3. Verify config/app.config.toml is valid TOML
4. Ensure static/js/ and static/css/ contain required files

### WebUI Issues

1. Verify WebUI port is not in use
2. Check firewall allows localhost connections
3. Ensure index.html exists in dist/

## Documentation

Complete documentation is available in the `docs/` directory:

- [01-introduction.md](docs/01-introduction.md) - Project overview and use cases
- [02-architecture.md](docs/02-architecture.md) - Detailed architecture
- [03-build-system.md](docs/03-build-system.md) - Build configuration and troubleshooting
- [04-communication.md](docs/04-communication.md) - Frontend-backend communication
- [05-dependencies.md](docs/05-dependencies.md) - Complete dependency reference
- [06-improvements.md](docs/06-improvements.md) - Suggested enhancements
- [07-getting-started.md](docs/07-getting-started.md) - Installation and setup
- [08-project-structure.md](docs/08-project-structure.md) - Repository layout
- [09-errors-as-values.md](docs/09-errors-as-values.md) - Error handling pattern
- [10-testing.md](docs/10-testing.md) - Testing guide

## DevTools Panel

The DevTools panel provides comprehensive system diagnostics accessible from the bottom panel:

### Features

- **Overview**: Quick summary of system status
- **System**: OS, hostname, CPU cores, Rust version
- **Memory**: Visual memory usage with statistics
- **Process**: PID, CPU%, memory, threads, uptime
- **Network**: Network interfaces with IP/MAC addresses
- **Database**: DB path, size, tables, connections
- **Config**: Application configuration settings
- **Performance**: FPS, DOM nodes, JS heap, event listeners
- **Events**: Filterable event log (errors, warnings, info)
- **Bindings**: Backend function binding status
- **Windows**: Open WinBox windows with state

### Usage

1. Click the DevTools tab in the bottom panel
2. Auto-refresh is enabled by default (2-second interval)
3. Toggle auto-refresh with the play/pause button
4. Export data as JSON with the download button
5. Panel expands to 50% screen height when DevTools is active

## License

MIT License
