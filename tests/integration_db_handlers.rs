// Integration tests for database handlers
// Tests the full flow from frontend call to backend response

mod common;

use rustwebui_app::core::infrastructure::database::Database;
use std::sync::Arc;

/// Test database CRUD operations
#[cfg(test)]
mod database_operations {
    use super::*;
    use crate::common::DatabaseFixture;

    #[test]
    fn test_create_user() {
        let fixture = DatabaseFixture::new();
        
        let result = fixture.db.insert_user("Test User", "test@example.com", "User", "Active");
        
        assert!(result.is_ok(), "Create user should succeed");
        let user_id = result.unwrap();
        assert!(user_id > 0, "User ID should be positive");
    }

    #[test]
    fn test_get_all_users_empty() {
        let fixture = DatabaseFixture::new();
        
        let result = fixture.db.get_all_users();
        
        assert!(result.is_ok(), "Get users should succeed");
        let users = result.unwrap();
        assert!(users.is_empty(), "Should return empty list for new database");
    }

    #[test]
    fn test_get_all_users_with_data() {
        let fixture = DatabaseFixture::with_sample_data();
        
        let result = fixture.db.get_all_users();
        
        assert!(result.is_ok(), "Get users should succeed");
        let users = result.unwrap();
        assert!(!users.is_empty(), "Should return users from sample data");
    }

    #[test]
    fn test_update_user() {
        let fixture = DatabaseFixture::new();
        
        // Create a user first
        let user_id = fixture.db.insert_user("Original", "original@example.com", "User", "Active")
            .expect("Failed to create user");
        
        // Update the user
        let result = fixture.db.update_user(
            user_id,
            Some("Updated".to_string()),
            None,
            None,
            None,
        );
        
        assert!(result.is_ok(), "Update user should succeed");
        let rows_updated = result.unwrap();
        assert_eq!(rows_updated, 1, "Should update exactly one row");
        
        // Verify the update
        let users = fixture.db.get_all_users().expect("Failed to get users");
        let updated_user = users.iter().find(|u| u.id == user_id).expect("User not found");
        assert_eq!(updated_user.name, "Updated", "Name should be updated");
    }

    #[test]
    fn test_delete_user() {
        let fixture = DatabaseFixture::new();
        
        // Create a user first
        let user_id = fixture.db.insert_user("To Delete", "delete@example.com", "User", "Active")
            .expect("Failed to create user");
        
        // Delete the user
        let result = fixture.db.delete_user(user_id);
        
        assert!(result.is_ok(), "Delete user should succeed");
        let rows_deleted = result.unwrap();
        assert_eq!(rows_deleted, 1, "Should delete exactly one row");
        
        // Verify deletion
        let users = fixture.db.get_all_users().expect("Failed to get users");
        let deleted_user = users.iter().find(|u| u.id == user_id);
        assert!(deleted_user.is_none(), "User should be deleted");
    }

    #[test]
    fn test_get_user_by_id() {
        let fixture = DatabaseFixture::new();
        
        let user_id = fixture.db.insert_user("Lookup User", "lookup@example.com", "User", "Active")
            .expect("Failed to create user");
        
        let result = fixture.db.get_user_by_id(user_id);
        
        assert!(result.is_ok(), "Get user by ID should succeed");
        let user = result.unwrap();
        assert!(user.is_some(), "Should find the user");
        let user = user.unwrap();
        assert_eq!(user.name, "Lookup User", "Should return correct user");
    }

    #[test]
    fn test_get_user_by_id_not_found() {
        let fixture = DatabaseFixture::new();
        
        let result = fixture.db.get_user_by_id(99999);
        
        assert!(result.is_ok(), "Get user by ID should succeed (even if not found)");
        let user = result.unwrap();
        assert!(user.is_none(), "Should return None for non-existent user");
    }

    #[test]
    fn test_database_stats() {
        let fixture = DatabaseFixture::with_sample_data();
        
        let stats = fixture.db.get_stats();
        
        assert!(stats.total_users >= 1, "Should have at least one user from sample data");
        assert!(stats.created_at > 0, "Should have valid creation timestamp");
    }
}

/// Test database constraint violations
#[cfg(test)]
mod database_constraints {
    use super::*;
    use crate::common::DatabaseFixture;

    #[test]
    fn test_unique_email_constraint() {
        let fixture = DatabaseFixture::new();
        
        // Create first user
        let result1 = fixture.db.insert_user("User 1", "unique@example.com", "User", "Active");
        assert!(result1.is_ok(), "First insert should succeed");
        
        // Try to create user with same email
        let result2 = fixture.db.insert_user("User 2", "unique@example.com", "User", "Active");
        assert!(result2.is_err(), "Second insert with same email should fail");
    }

    #[test]
    fn test_required_fields() {
        let fixture = DatabaseFixture::new();
        
        // Empty name should fail
        let result = fixture.db.insert_user("", "empty@example.com", "User", "Active");
        assert!(result.is_err(), "Insert with empty name should fail");
    }
}

/// Test database initialization
#[cfg(test)]
mod database_initialization {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_database_creation() {
        let temp_dir = TempDir::new().expect("Failed to create temp directory");
        let db_path = temp_dir.path().join("new.db");
        
        let db = Database::new(db_path.to_str().unwrap());
        
        assert!(db.is_ok(), "Database should be created successfully");
    }

    #[test]
    fn test_database_schema_initialization() {
        let temp_dir = TempDir::new().expect("Failed to create temp directory");
        let db_path = temp_dir.path().join("init.db");
        
        let db = Database::new(db_path.to_str().unwrap())
            .expect("Failed to create database");
        
        let result = db.init();
        
        assert!(result.is_ok(), "Schema initialization should succeed");
    }

    #[test]
    fn test_sample_data_creation() {
        let temp_dir = TempDir::new().expect("Failed to create temp directory");
        let db_path = temp_dir.path().join("sample.db");
        
        let db = Database::new(db_path.to_str().unwrap())
            .expect("Failed to create database");
        
        db.init().expect("Failed to initialize schema");
        let result = db.insert_sample_data();
        
        assert!(result.is_ok(), "Sample data insertion should succeed");
        
        // Verify sample data was created
        let users = db.get_all_users().expect("Failed to get users");
        assert!(!users.is_empty(), "Sample data should include users");
    }
}
