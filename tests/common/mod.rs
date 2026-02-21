// Common test utilities for integration tests

use std::sync::Arc;
use tempfile::TempDir;

use rustwebui_app::core::infrastructure::database::Database;
use rustwebui_app::core::infrastructure::config::AppConfig;

/// Test fixture for database tests
pub struct DatabaseFixture {
    pub db: Arc<Database>,
    pub _temp_dir: TempDir, // Keep temp dir alive
}

impl DatabaseFixture {
    /// Create a new database fixture with an in-memory or temp database
    pub fn new() -> Self {
        let temp_dir = TempDir::new().expect("Failed to create temp directory");
        let db_path = temp_dir.path().join("test.db");
        
        let db = Database::new(db_path.to_str().unwrap())
            .expect("Failed to create test database");
        
        db.init().expect("Failed to initialize database schema");
        
        Self {
            db: Arc::new(db),
            _temp_dir: temp_dir,
        }
    }
    
    /// Create a fixture with sample data
    pub fn with_sample_data() -> Self {
        let fixture = Self::new();
        fixture.db.insert_sample_data().expect("Failed to insert sample data");
        fixture
    }
}

impl Default for DatabaseFixture {
    fn default() -> Self {
        Self::new()
    }
}

/// Test fixture for configuration tests
pub struct ConfigFixture {
    pub config: AppConfig,
    pub _temp_dir: TempDir,
}

impl ConfigFixture {
    pub fn new() -> Self {
        let temp_dir = TempDir::new().expect("Failed to create temp directory");
        let config_path = temp_dir.path().join("test.config.toml");
        
        let config_content = r#"
[app]
name = "Test App"
version = "0.0.1"

[database]
path = "test.db"
create_sample_data = false

[logging]
level = "debug"
file = "test.log"
append = false
"#;
        
        std::fs::write(&config_path, config_content).expect("Failed to write test config");
        
        let config = AppConfig::from_file(config_path.to_str().unwrap())
            .expect("Failed to load test config");
        
        Self {
            config,
            _temp_dir: temp_dir,
        }
    }
}

impl Default for ConfigFixture {
    fn default() -> Self {
        Self::new()
    }
}
