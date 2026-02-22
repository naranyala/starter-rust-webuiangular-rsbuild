# Project Structure

## Repository Layout

```
.
+-- src/                    # Active Rust application (main entry)
+-- frontend/               # Active Angular workspace (MVVM)
+-- config/                 # Runtime configuration
+-- static/                 # Runtime static JS/CSS assets
+-- thirdparty/             # Vendored upstream sources
+-- dist/                   # Distribution output
+-- target/                 # Cargo build output
+-- docs/                   # Documentation
+-- .gitignore              # Git ignore rules
+-- Cargo.toml              # Rust project manifest
+-- Cargo.lock              # Locked dependency versions
+-- build.rs                # Rust build script
+-- run.sh                  # Master build/run script
+-- build-dist.sh           # Distribution builder
+-- build-frontend.js       # Frontend build orchestration
+-- post-build.sh           # Post-build processing
+-- app.config.toml         # Application configuration
+-- app.db                  # SQLite database file
+-- application.log         # Runtime log file
+-- README.md               # This file (table of contents)
```

## Rust Backend: src/

### Entrypoint

- src/main.rs: Application bootstrap and runtime startup

### Core Architecture (src/core/)

This follows a layered model (Domain-Driven Design inspired):

- src/core/domain/: Domain entities and domain-level traits
- src/core/application/: Use-case orchestration and app handlers
  - src/core/application/handlers/: Focused handler modules (UI, DB, API, sysinfo, window_state)
- src/core/infrastructure/: Concrete implementations and external integrations
  - src/core/infrastructure/database/: Connection, models, user persistence
  - src/core/infrastructure/logging/: Logger config, formatter, and output behavior
  - src/core/infrastructure/config.rs: Config loading
  - src/core/infrastructure/di.rs: Dependency wiring
  - src/core/infrastructure/event_bus.rs: Backend event dispatch plumbing
- src/core/presentation/: Presentation boundary
  - src/core/presentation/webui/: WebUI-facing handlers and bridge surface
    - handlers/db_handlers.rs: Database operation handlers
    - handlers/sysinfo_handlers.rs: System information handlers
    - handlers/logging_handlers.rs: Logging handlers
    - handlers/event_bus_handlers.rs: Event bus handlers
    - handlers/window_state_handler.rs: Window state management
    - handlers/ui_handlers.rs: General UI handlers
- src/core/error.rs: Centralized error types

### Utilities (src/utils/)

- compression/: Compression utilities
- crypto/: Cryptography functions
- encoding/: Encoding/decoding
- file_ops/: File operations
- network/: Network utilities
- security/: Security utilities
- serialization/: Serialization helpers
- system/: System information
- validation/: Validation utilities

These modules keep infrastructure-level helper logic out of business layers.

## Frontend App: frontend/ (MVVM Pattern)

### Primary Runtime Source (frontend/src/)

```
frontend/src/
+-- main.ts                    # Angular bootstrap and global startup wiring
+-- environments/              # Environment configs (dev/prod)
+-- types/                     # TypeScript declarations
+-- polyfills.ts               # Angular polyfills
+-- test.ts                    # Test configuration
|
+-- models/                    # M - Data interfaces and types
|   +-- index.ts               # Barrel export
|   +-- card.model.ts          # Card entity interfaces
|   +-- window.model.ts        # Window state interfaces
|   +-- log.model.ts           # Logging interfaces
|   +-- error.model.ts         # Error handling types
|   +-- api.model.ts           # API client types
|   +-- devtools.model.ts      # DevTools data models
|
+-- viewmodels/                # VM - Business logic and state management
|   +-- index.ts               # Barrel export
|   +-- logging.viewmodel.ts   # Logging backend service
|   +-- logger.ts              # Logger facade API
|   +-- event-bus.viewmodel.ts # Event bus implementation
|   +-- window-state.viewmodel.ts # Window state management
|   +-- api-client.ts          # Backend API client
|   +-- devtools.service.ts    # DevTools data gathering service
|   +-- connection-monitor.service.ts # Connection monitoring
|   +-- viewport.service.ts    # Viewport management
|
+-- views/                     # V - Angular components
|   +-- app.component.ts       # Main shell component
|   +-- app.component.html     # Main template
|   +-- app.component.css      # Main styles
|   +-- devtools/              # DevTools components
|   |   +-- devtools.component.ts       # Main DevTools container
|   |   +-- devtools-panels.component.ts # Panel components
|   +-- shared/
|       +-- error-modal.component.ts
|
+-- core/                      # Shared infrastructure
    +-- index.ts
    +-- global-error.service.ts
    +-- global-error.handler.ts
    +-- errors/
        +-- result.ts
    +-- winbox.service.ts      # WinBox window service
```

### MVVM Pattern Explanation

**Models (models/):**
- Pure data interfaces and type definitions
- No business logic, only data shape contracts
- Examples: Card, WindowEntry, LogEntry, DevToolsData

**ViewModels (viewmodels/):**
- Business logic and state management services
- Angular services decorated with @Injectable
- Handle data transformation, state, and communication
- Examples: LoggingViewModel, EventBusViewModel, WindowStateViewModel, DevToolsService

**Views (views/):**
- Angular components (presentation layer)
- Handle UI rendering and user interaction
- Consume ViewModels via dependency injection
- Examples: AppComponent, DevToolsComponent, ErrorModalComponent

**Core (core/):**
- Cross-cutting concerns
- Error handling infrastructure
- Shared utilities that don't fit in other layers

### Frontend Tooling and Build Config

- frontend/package.json: Scripts and dependencies
- frontend/angular.json: Angular build/serve configuration
- frontend/tsconfig.json, frontend/tsconfig.app.json, frontend/tsconfig.spec.json: TypeScript configs
- frontend/biome.json: Lint/format policy
- frontend/e2e/: End-to-end testing config
- frontend/karma.conf.js: Karma test runner config

### Frontend Generated Directories

- frontend/dist/: Compiled frontend output
- frontend/.angular/: Angular cache
- frontend/node_modules/: Installed JS dependencies

## Configuration: config/

- config/app.config.toml: Runtime configuration source

Typical configuration domains include app metadata, window behavior, database settings, and logging options.

## Runtime Static Assets: static/

- static/js/: Runtime JavaScript assets (including WebUI bridge files)
- static/css/: Runtime stylesheets

These assets are consumed by runtime HTML and desktop WebUI rendering.

## Vendor Sources: thirdparty/

- thirdparty/webui-c-src/: Vendored WebUI C source and examples

## Build Output Directories

### target/

Cargo build output:
- target/debug/: Debug builds
- target/release/: Release builds
- target/debug/app: Debug executable
- target/release/app: Release executable

### dist/

Distribution output:
- dist/index.html: Main HTML file
- dist/static/js/: Compiled JavaScript
- dist/static/css/: Compiled CSS

## Documentation: docs/

- 01-introduction.md: Project overview
- 02-architecture.md: Architecture details
- 03-build-system.md: Build instructions
- 04-communication.md: Communication patterns
- 05-dependencies.md: Dependency reference
- 06-improvements.md: Suggested enhancements
- 07-getting-started.md: Getting started guide
- 08-project-structure.md: This file
- 09-errors-as-values.md: Error handling guide
- 10-testing.md: Testing guide

## Build Scripts

### run.sh

Master build and run script:
- Installs dependencies
- Builds frontend and backend
- Runs the application
- Supports various flags (--build, --release, --clean, etc.)

### build-frontend.js

Frontend build orchestration:
- Installs Bun dependencies
- Runs Angular CLI production build
- Copies assets to static directory
- Patches index.html with correct paths

### build-dist.sh

Distribution package builder:
- Creates platform-specific packages
- Prepares executables for distribution
- Generates archives (ZIP/TAR.GZ)

### post-build.sh

Post-build processing:
- Executable renaming
- Platform-specific adjustments
- Final asset organization

## Runtime Files

### app.config.toml

Application configuration loaded at startup.

### app.db

SQLite database file created on first run.

### application.log

Runtime log file with application events.

## File Naming Conventions

### Rust Files
- snake_case for modules and functions
- PascalCase for structs and enums
- Trait files named after the trait

### TypeScript Files
- kebab-case for component files
- PascalCase for classes
- camelCase for functions and variables

### Configuration Files
- TOML for application config
- JSON for package manifests
- TypeScript for build configs
