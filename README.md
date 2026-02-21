# Rust WebUI Angular Rsbuild Starter

A production-ready desktop application starter combining Rust backend with Angular frontend, using WebUI for native window integration and Rsbuild for modern frontend bundling.

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
./run.sh --release          # Create release build
./run.sh --run              # Run existing build
./run.sh --clean            # Clean build artifacts
./run.sh --rebuild          # Clean and rebuild
```

### Frontend Development

```bash
cd frontend
bun run dev                 # Start development server (port 4200)
bun run build:rsbuild       # Production build
bun run preview             # Preview production build
```

## Project Overview

This project provides a complete desktop application framework with:

- **Rust Backend**: High-performance native core with SQLite database, comprehensive error handling, and modular architecture
- **Angular Frontend**: Modern MVVM-pattern UI with WinBox windowing, Rsbuild bundler, and reactive state management
- **WebUI Integration**: Native desktop windowing with bidirectional frontend-backend communication
- **Production Build Pipeline**: Automated build, asset management, and distribution packaging

## Technology Stack

### Backend

- **Language**: Rust 2024 Edition
- **Windowing**: webui-rs (WebUI 2.5.0-beta.4)
- **Database**: rusqlite 0.32 with bundled SQLite
- **Serialization**: serde, serde_json, serde_yaml, rmp-serde, serde_cbor, toml
- **Error Handling**: anyhow, thiserror
- **Logging**: log, env_logger
- **System**: dirs, tempfile, notify, hostname, whoami, num_cpus
- **Security**: base64, hmac, sha2, rand, jsonwebtoken, hex, md5
- **Network**: url, reqwest
- **Compression**: flate2, zstd, brotli, lz4_flex, snap, ascii85, punycode
- **File Operations**: walkdir, image, arboard, ini, zip, tar

### Frontend

- **Framework**: Angular 19.2
- **Language**: TypeScript 5.5
- **Bundler**: Rsbuild 1.7 (Rspack-based)
- **Runtime**: Bun 1.3
- **Windowing**: WinBox 0.2.82
- **State Management**: RxJS 7.8, Zone.js 0.15
- **Styling**: Sass 1.97
- **Code Quality**: Biome 2.4
- **Testing**: Jasmine, Karma, Protractor

### Build System

- **Backend**: Cargo with custom build.rs
- **Frontend**: Rsbuild with Angular integration
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
│   │   ├── presentation/       # WebUI handlers
│   │   └── error.rs            # Error types
│   └── utils/                  # Utility modules
│       ├── compression/        # Compression utilities
│       ├── crypto/             # Cryptography functions
│       ├── encoding/           # Encoding/decoding
│       ├── file_ops/           # File operations
│       ├── network/            # Network utilities
│       ├── security/           # Security utilities
│       ├── serialization/      # Serialization helpers
│       ├── system/             # System information
│       └── validation/         # Validation utilities
│
├── frontend/                   # Angular frontend
│   ├── src/                    # Source code
│   │   ├── main.ts             # Bootstrap and global handlers
│   │   ├── winbox-loader.ts    # WinBox initialization
│   │   ├── index.html          # Application template
│   │   ├── environments/       # Environment configurations
│   │   ├── models/             # Data interfaces (M in MVVM)
│   │   ├── viewmodels/         # Business logic (VM in MVVM)
│   │   │   ├── logging.viewmodel.ts
│   │   │   ├── event-bus.viewmodel.ts
│   │   │   ├── window-state.viewmodel.ts
│   │   │   └── api-client.ts
│   │   ├── views/              # Components (V in MVVM)
│   │   │   ├── app.component.ts
│   │   │   ├── home/
│   │   │   ├── demo/
│   │   │   └── shared/
│   │   │       └── error-modal.component.ts
│   │   ├── core/               # Shared infrastructure
│   │   │   ├── global-error.service.ts
│   │   │   ├── global-error.handler.ts
│   │   │   └── errors/
│   │   │       └── result.ts
│   │   ├── types/              # TypeScript type definitions
│   │   └── assets/             # Static assets
│   ├── docs/                   # Frontend documentation
│   ├── e2e/                    # End-to-end tests
│   ├── angular.json            # Angular configuration
│   ├── rsbuild.config.ts       # Rsbuild bundler config
│   ├── package.json            # Dependencies and scripts
│   ├── tsconfig.json           # TypeScript configuration
│   └── biome.json              # Code quality config
│
├── config/                     # Runtime configuration
│   └── app.config.toml         # Application settings
│
├── static/                     # Runtime static assets
│   ├── js/                     # JavaScript files
│   │   ├── main.js             # Main application bundle
│   │   ├── webui.js            # WebUI bridge
│   │   └── winbox.min.js       # WinBox library
│   └── css/                    # Stylesheets
│       ├── styles.css          # Application styles
│       └── winbox.min.css      # WinBox styles
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
│   └── webui-c-src/            # WebUI C source and examples
│
├── frontend-backup/            # Historical frontend reference
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
│   └── 09-errors-as-values.md  # Error handling guide
│
├── build.rs                    # Rust build script
├── Cargo.toml                  # Rust dependencies
├── Cargo.lock                  # Locked dependency versions
├── run.sh                      # Master build/run script
├── build-dist.sh               # Distribution package builder
├── build-frontend.js           # Frontend build orchestration
├── post-build.sh               # Post-build processing
└── README.md                   # This file
```

## Architecture

### Backend Architecture

The Rust backend follows a layered architecture inspired by Domain-Driven Design:

1. **Domain Layer**: Core business entities and domain logic
2. **Application Layer**: Use-case orchestration and handlers
3. **Infrastructure Layer**: External integrations (database, logging, config)
4. **Presentation Layer**: WebUI handlers and bridge

### Frontend Architecture

The Angular frontend uses the MVVM (Model-View-ViewModel) pattern:

1. **Models**: Pure data interfaces and type definitions
2. **ViewModels**: Business logic and state management services
3. **Views**: Angular components for UI rendering
4. **Core**: Cross-cutting concerns (error handling, events)

### Communication Pattern

Frontend-backend communication uses WebUI bindings:

```
Frontend JS --[JSON]--> window.bind() --> Rust Backend
Rust Backend --[JSON]--> window.run_js() --> Frontend JS
```

## Build System

### Frontend Build (Rsbuild)

Rsbuild is a modern bundler built on Rspack, providing:

- Fast cold builds (~20s for full build)
- Hot Module Replacement (HMR) for development
- Optimized production bundles
- TypeScript and Sass support out of the box

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

Edit `frontend/rsbuild.config.ts` to customize:

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
- Severity-based error handling (Critical, Major, Minor, Info)
- User-friendly error modal with technical details
- Error history tracking and statistics

See `docs/09-errors-as-values.md` for detailed guide.

## Logging

### Backend Logging

Configurable logging with multiple levels:

```rust
logger.info("Operation completed", { key: "value" });
logger.error("Operation failed", { error: "details" });
```

Logs written to console and file (configurable).

### Frontend Logging

Structured logging with contexts:

```typescript
logger.info(LogContext.App, 'Component', 'Message', { data });
logger.error(LogContext.Component, 'Service', 'Error', error);
```

View logs via LogViewer component in UI.

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

Run directly with `./run.sh` for development with hot reload.

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
bun run build:rsbuild
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

Frontend-specific documentation:

- `frontend/docs/ERROR_HANDLING_COMPLETE.md` - Frontend error handling
- `frontend/docs/RSBUILD_MIGRATION.md` - Rsbuild migration guide

## Potential Improvements

The following suggestions focus on project structure improvements:

### Directory Organization

1. **Consolidate Backup Directories**: The `frontend-backup/` directory should be moved to an `archives/` or `historical/` directory at the root level to clearly separate historical reference code from active development. Consider removing if no longer needed for migration safety.

2. **Separate Build Scripts**: Create a dedicated `scripts/` directory at the root level for build orchestration scripts (run.sh, build-dist.sh, build-frontend.js, post-build.sh) to separate build infrastructure from source code.

3. **Unified Configuration**: Move `frontend/angular.json`, `frontend/tsconfig*.json`, and `frontend/biome.json` to a root-level `config/` directory with frontend-specific subdirectory to centralize all configuration files.

4. **Shared Types Directory**: Create a `shared/` or `contracts/` directory at the root level for shared type definitions and protocol specifications that both backend and frontend consume, reducing duplication and ensuring type safety across the boundary.

5. **Plugin Structure**: The `plugins/` directory exists but appears incomplete. Either complete the plugin architecture with proper documentation and examples, or remove to reduce confusion. Consider moving plugin examples to `examples/` directory.

6. **Core Package Separation**: The `core/backend/` and `core/frontend/` directories suggest a monorepo structure. If these are meant to be reusable packages, consider proper workspace configuration with Cargo workspaces for Rust and npm workspaces for TypeScript.

7. **Test Organization**: Move all test configuration and test files to a unified `tests/` directory at the root level, with `tests/backend/` and `tests/frontend/` subdirectories, rather than scattering test configs throughout the codebase.

8. **Documentation Consolidation**: The documentation exists in both `docs/` and `frontend/docs/`. Consider consolidating into a single `docs/` directory with clear subdirectories (docs/backend/, docs/frontend/, docs/general/) to avoid confusion about where to find or add documentation.

9. **Asset Management**: The `static/` directory serves as runtime output, but `frontend/src/assets/` exists for source assets. Consider renaming `static/` to `runtime-assets/` or `dist-assets/` to clarify its purpose as build output rather than source.

10. **Thirdparty Management**: The `thirdparty/` directory contains vendored WebUI sources. Consider using Git submodules or proper dependency management instead of vendoring, unless modifications to upstream sources are required.

11. **Environment Configuration**: Frontend has `environments/` directory but backend uses single `app.config.toml`. Consider unified environment configuration strategy with `config/dev.toml`, `config/prod.toml`, etc.

12. **Generated Files**: Create a `.generated/` or `build-output/` directory to clearly separate generated files (like embedded_frontend.rs from build.rs) from hand-written source code.

### Build System

13. **Unified Build Configuration**: Consider migrating to a unified build system like Nx or Turborepo that can orchestrate both Rust and TypeScript builds with dependency tracking and incremental builds.

14. **CI/CD Configuration**: Add `.github/workflows/` or `.gitlab-ci.yml` for automated testing and deployment pipelines.

15. **Docker Support**: Add `Dockerfile` and `docker-compose.yml` for containerized development and deployment.

### Code Organization

16. **Barrel Exports**: Add `mod.rs` or `index.ts` barrel files in each directory to clarify public API surface and improve IDE autocomplete.

17. **Feature Flags**: Use Cargo features to enable/disable optional functionality rather than including all dependencies unconditionally.

18. **Workspace Members**: If core/backend and core/frontend are meant to be separate crates, configure them as workspace members in root Cargo.toml.

## License

MIT License
