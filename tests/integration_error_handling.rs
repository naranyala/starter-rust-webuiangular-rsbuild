// Integration tests for error handling
// Tests error creation, conversion, and serialization

use rustwebui_app::core::error::{AppError, ErrorValue, ErrorCode};
use std::collections::HashMap;

#[cfg(test)]
mod error_value_tests {
    use super::*;

    #[test]
    fn test_error_value_creation() {
        let error = ErrorValue::new(ErrorCode::DbNotFound, "User not found");
        
        assert_eq!(error.code, ErrorCode::DbNotFound);
        assert_eq!(error.message, "User not found");
        assert!(error.details.is_none());
        assert!(error.field.is_none());
    }

    #[test]
    fn test_error_value_with_details() {
        let error = ErrorValue::new(ErrorCode::DbQueryFailed, "Query failed")
            .with_details("SQL syntax error at line 1");
        
        assert_eq!(error.code, ErrorCode::DbQueryFailed);
        assert_eq!(error.message, "Query failed");
        assert_eq!(error.details, Some("SQL syntax error at line 1".to_string()));
    }

    #[test]
    fn test_error_value_with_field() {
        let error = ErrorValue::new(ErrorCode::ValidationFailed, "Invalid input")
            .with_field("email");
        
        assert_eq!(error.code, ErrorCode::ValidationFailed);
        assert_eq!(error.field, Some("email".to_string()));
    }

    #[test]
    fn test_error_value_with_context() {
        let error = ErrorValue::new(ErrorCode::ResourceNotFound, "Not found")
            .with_context("resource", "user")
            .with_context("id", "123");
        
        assert_eq!(error.code, ErrorCode::ResourceNotFound);
        
        let context = error.context.expect("Context should exist");
        assert_eq!(context.get("resource"), Some(&"user".to_string()));
        assert_eq!(context.get("id"), Some(&"123".to_string()));
    }

    #[test]
    fn test_error_value_chaining() {
        let error = ErrorValue::new(ErrorCode::DbConstraintViolation, "Constraint failed")
            .with_details("Unique constraint on email")
            .with_field("email")
            .with_cause("Duplicate entry")
            .with_context("table", "users");
        
        assert_eq!(error.code, ErrorCode::DbConstraintViolation);
        assert!(error.details.is_some());
        assert!(error.field.is_some());
        assert!(error.cause.is_some());
        assert!(error.context.is_some());
    }
}

#[cfg(test)]
mod error_serialization {
    use super::*;
    use serde_json;

    #[test]
    fn test_error_value_to_response() {
        let error = ErrorValue::new(ErrorCode::ValidationFailed, "Invalid email")
            .with_field("email");
        
        let response = error.to_response();
        
        assert_eq!(response["code"], "VALIDATION_FAILED");
        assert_eq!(response["message"], "Invalid email");
        assert_eq!(response["field"], "email");
    }

    #[test]
    fn test_error_value_json_serialization() {
        let error = ErrorValue::new(ErrorCode::DbNotFound, "User not found")
            .with_context("user_id", "42");
        
        let json = serde_json::to_string(&error).expect("Failed to serialize");
        
        assert!(json.contains("DB_NOT_FOUND"));
        assert!(json.contains("User not found"));
        assert!(json.contains("user_id"));
    }

    #[test]
    fn test_error_value_json_deserialization() {
        let json = r#"{
            "code": "INTERNAL_ERROR",
            "message": "Something went wrong",
            "details": "Technical details"
        }"#;
        
        let error: ErrorValue = serde_json::from_str(json).expect("Failed to deserialize");
        
        assert_eq!(error.code, ErrorCode::InternalError);
        assert_eq!(error.message, "Something went wrong");
        assert_eq!(error.details, Some("Technical details".to_string()));
    }

    #[test]
    fn test_error_code_serialization() {
        let code = ErrorCode::DbConnectionFailed;
        let json = serde_json::to_string(&code).expect("Failed to serialize");
        
        assert_eq!(json, "\"DB_CONNECTION_FAILED\"");
    }
}

#[cfg(test)]
mod app_error_tests {
    use super::*;

    #[test]
    fn test_app_error_database() {
        let error_value = ErrorValue::new(ErrorCode::DbQueryFailed, "Query failed");
        let app_error = AppError::Database(error_value.clone());
        
        assert!(matches!(app_error, AppError::Database(_)));
        assert_eq!(app_error.to_value().code, ErrorCode::DbQueryFailed);
    }

    #[test]
    fn test_app_error_validation() {
        let error_value = ErrorValue::new(ErrorCode::ValidationFailed, "Invalid input");
        let app_error = AppError::Validation(error_value);
        
        assert!(matches!(app_error, AppError::Validation(_)));
        assert_eq!(app_error.to_value().code, ErrorCode::ValidationFailed);
    }

    #[test]
    fn test_app_error_not_found() {
        let error_value = ErrorValue::new(ErrorCode::ResourceNotFound, "Not found");
        let app_error = AppError::NotFound(error_value);
        
        assert!(matches!(app_error, AppError::NotFound(_)));
        assert_eq!(app_error.to_value().code, ErrorCode::ResourceNotFound);
    }

    #[test]
    fn test_app_error_to_json() {
        let error_value = ErrorValue::new(ErrorCode::InternalError, "System error");
        let app_error = AppError::LockPoisoned(error_value);
        
        let json = app_error.to_json();
        
        assert_eq!(json["code"], "INTERNAL_ERROR");
        assert_eq!(json["message"], "System error");
    }
}

#[cfg(test)]
mod error_helpers {
    use super::*;
    use rustwebui_app::core::error::errors;

    #[test]
    fn test_db_not_found_helper() {
        let err = errors::db_not_found("User", 123);
        
        assert!(matches!(err, AppError::NotFound(_)));
        let value = err.to_value();
        assert_eq!(value.code, ErrorCode::DbNotFound);
        assert!(value.message.contains("User not found: 123"));
    }

    #[test]
    fn test_validation_failed_helper() {
        let err = errors::validation_failed("email", "Must be valid email format");
        
        assert!(matches!(err, AppError::Validation(_)));
        let value = err.to_value();
        assert_eq!(value.code, ErrorCode::ValidationFailed);
        assert_eq!(value.field, Some("email".to_string()));
        assert_eq!(value.message, "Must be valid email format");
    }

    #[test]
    fn test_not_found_helper() {
        let err = errors::not_found("Product", "SKU-123");
        
        assert!(matches!(err, AppError::NotFound(_)));
        let value = err.to_value();
        assert_eq!(value.code, ErrorCode::ResourceNotFound);
        assert!(value.message.contains("Product not found: SKU-123"));
    }

    #[test]
    fn test_internal_error_helper() {
        let err = errors::internal("Unexpected state");
        
        assert!(matches!(err, AppError::LockPoisoned(_)));
        let value = err.to_value();
        assert_eq!(value.code, ErrorCode::InternalError);
        assert_eq!(value.message, "Unexpected state");
    }
}

#[cfg(test)]
mod error_from_traits {
    use super::*;
    use rusqlite;

    #[test]
    fn test_from_rusqlite_error() {
        let sql_error = rusqlite::Error::SqliteFailure(
            rusqlite::ffi::Error::new(rusqlite::ffi::SQLITE_ERROR),
            Some("SQL error message".to_string()),
        );
        
        let app_error: AppError = sql_error.into();
        
        assert!(matches!(app_error, AppError::Database(_)));
        assert_eq!(app_error.to_value().code, ErrorCode::DbQueryFailed);
    }

    #[test]
    fn test_from_io_error() {
        let io_error = std::io::Error::new(std::io::ErrorKind::NotFound, "File not found");
        
        let app_error: AppError = io_error.into();
        
        assert!(matches!(app_error, AppError::Logging(_)));
        assert_eq!(app_error.to_value().code, ErrorCode::InternalError);
    }

    #[test]
    fn test_from_serde_json_error() {
        let json_error = serde_json::from_str::<serde_json::Value>("invalid json").unwrap_err();
        
        let app_error: AppError = json_error.into();
        
        assert!(matches!(app_error, AppError::Serialization(_)));
        assert_eq!(app_error.to_value().code, ErrorCode::SerializationFailed);
    }
}

#[cfg(test)]
mod to_app_result_tests {
    use super::*;
    use rustwebui_app::core::error::ToAppResult;

    #[test]
    fn test_option_to_app_result_some() {
        let value: Option<i32> = Some(42);
        let result = value.to_app_error("Expected value");
        
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 42);
    }

    #[test]
    fn test_option_to_app_result_none() {
        let value: Option<i32> = None;
        let result = value.to_app_error("Expected value");
        
        assert!(result.is_err());
        assert!(matches!(result.unwrap_err(), AppError::NotFound(_)));
    }

    #[test]
    fn test_result_to_app_result_ok() {
        let value: Result<i32, std::io::Error> = Ok(42);
        let result = value.to_app_error("Database operation");
        
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 42);
    }

    #[test]
    fn test_result_to_app_result_err() {
        let io_error = std::io::Error::new(std::io::ErrorKind::Other, "IO failed");
        let value: Result<i32, std::io::Error> = Err(io_error);
        let result = value.to_app_error("Database operation");
        
        assert!(result.is_err());
        assert!(matches!(result.unwrap_err(), AppError::Database(_)));
    }
}
