use log::info;
use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};
use webui_rs::webui;

// ==================== System Info ====================
pub fn get_system_info() -> serde_json::Value {
    let mut sysinfo = serde_json::Map::new();

    // Hostname and username
    sysinfo.insert("hostname".to_string(), serde_json::json!(
        hostname::get().unwrap_or_else(|_| "unknown".into()).to_string_lossy()
    ));
    sysinfo.insert("username".to_string(), serde_json::json!(
        whoami::username().unwrap_or_else(|_| "unknown".to_string())
    ));

    // OS and architecture
    sysinfo.insert("os".to_string(), serde_json::json!(format!(
        "{} {}",
        std::env::consts::OS,
        std::env::consts::ARCH
    )));
    sysinfo.insert("arch".to_string(), serde_json::json!(std::env::consts::ARCH));

    // CPU count
    sysinfo.insert("cpu_count".to_string(), serde_json::json!(
        num_cpus::get()
    ));

    // Rust version
    sysinfo.insert("rust_version".to_string(), serde_json::json!(
        env!("CARGO_PKG_VERSION").to_string()
    ));

    // App version
    sysinfo.insert("app_version".to_string(), serde_json::json!(
        env!("CARGO_PKG_VERSION").to_string()
    ));

    // Build time (from compile time)
    sysinfo.insert("build_time".to_string(), serde_json::json!(
        option_env!("BUILD_TIME").unwrap_or("unknown").to_string()
    ));

    serde_json::Value::Object(sysinfo)
}

// ==================== Memory Info ====================
pub fn get_memory_info() -> serde_json::Value {
    let mut mem = serde_json::Map::new();

    // Try to read from /proc/meminfo on Linux
    if let Ok(content) = std::fs::read_to_string("/proc/meminfo") {
        let mut total_kb = 0u64;
        let mut available_kb = 0u64;

        for line in content.lines() {
            let parts: Vec<&str> = line.split(':').collect();
            if parts.len() == 2 {
                let key = parts[0].trim();
                let value = parts[1].split_whitespace().next();

                match key {
                    "MemTotal" => total_kb = parse_mem_value_kb(value),
                    "MemAvailable" => available_kb = parse_mem_value_kb(value),
                    _ => {}
                }
            }
        }

        let total_mb = total_kb / 1024;
        let available_mb = available_kb / 1024;
        let used_mb = total_mb - available_mb;
        let percent_used = if total_mb > 0 { (used_mb as f64 / total_mb as f64) * 100.0 } else { 0.0 };

        mem.insert("total_mb".to_string(), serde_json::json!(total_mb));
        mem.insert("used_mb".to_string(), serde_json::json!(used_mb));
        mem.insert("free_mb".to_string(), serde_json::json!(available_mb));
        mem.insert("percent_used".to_string(), serde_json::json!(percent_used.round() as u32));
    } else {
        // Fallback for non-Linux systems
        mem.insert("total_mb".to_string(), serde_json::json!(0));
        mem.insert("used_mb".to_string(), serde_json::json!(0));
        mem.insert("free_mb".to_string(), serde_json::json!(0));
        mem.insert("percent_used".to_string(), serde_json::json!(0));
    }

    serde_json::Value::Object(mem)
}

fn parse_mem_value_kb(value: Option<&str>) -> u64 {
    match value {
        Some(v) => v.parse::<u64>().unwrap_or(0),
        None => 0,
    }
}

// ==================== Process Info ====================
pub fn get_process_info() -> serde_json::Value {
    let mut proc = serde_json::Map::new();

    // Current process ID
    let pid = std::process::id();
    proc.insert("pid".to_string(), serde_json::json!(pid));

    // Process name
    proc.insert("name".to_string(), serde_json::json!(
        std::env::current_exe()
            .ok()
            .and_then(|p| p.file_name().map(|s| s.to_string_lossy().to_string()))
            .unwrap_or_else(|| "unknown".to_string())
    ));

    // CPU and memory usage from /proc/self
    if let Ok(stat_content) = std::fs::read_to_string("/proc/self/stat") {
        let parts: Vec<&str> = stat_content.split_whitespace().collect();
        if parts.len() >= 24 {
            // CPU time (utime + stime)
            let utime: u64 = parts[13].parse().unwrap_or(0);
            let stime: u64 = parts[14].parse().unwrap_or(0);
            let total_time = utime + stime;
            
            // Get system uptime
            if let Ok(uptime_content) = std::fs::read_to_string("/proc/uptime") {
                if let Some(uptime_str) = uptime_content.split_whitespace().next() {
                    if let Ok(uptime_secs) = uptime_str.parse::<f64>() {
                        // Rough CPU usage estimate
                        let cpu_percent = (total_time as f64 / uptime_secs) * 100.0 / num_cpus::get() as f64;
                        proc.insert("cpu_percent".to_string(), serde_json::json!(cpu_percent.min(100.0).round() as u32));
                    }
                }
            }
        }
    } else {
        proc.insert("cpu_percent".to_string(), serde_json::json!(0));
    }

    // Memory from /proc/self/status
    if let Ok(status_content) = std::fs::read_to_string("/proc/self/status") {
        for line in status_content.lines() {
            if line.starts_with("VmRSS:") {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 2 {
                    if let Ok(rss_kb) = parts[1].parse::<u64>() {
                        proc.insert("memory_mb".to_string(), serde_json::json!(rss_kb / 1024));
                    }
                }
                break;
            }
        }
    } else {
        proc.insert("memory_mb".to_string(), serde_json::json!(0));
    }

    // Thread count
    if let Ok(status_content) = std::fs::read_to_string("/proc/self/status") {
        for line in status_content.lines() {
            if line.starts_with("Threads:") {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 2 {
                    proc.insert("threads".to_string(), serde_json::json!(
                        parts[1].parse::<u32>().unwrap_or(1)
                    ));
                }
                break;
            }
        }
    } else {
        proc.insert("threads".to_string(), serde_json::json!(1));
    }

    // Uptime
    let start_time = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    
    if let Ok(uptime_content) = std::fs::read_to_string("/proc/uptime") {
        if let Some(uptime_str) = uptime_content.split_whitespace().next() {
            if let Ok(uptime_secs) = uptime_str.parse::<f64>() {
                proc.insert("uptime_seconds".to_string(), serde_json::json!(uptime_secs as u64));
                
                // Calculate start time
                let start = start_time.saturating_sub(uptime_secs as u64);
                proc.insert("start_time".to_string(), serde_json::json!(
                    format_timestamp(start)
                ));
            }
        }
    } else {
        proc.insert("uptime_seconds".to_string(), serde_json::json!(0));
        proc.insert("start_time".to_string(), serde_json::json!("unknown"));
    }

    serde_json::Value::Object(proc)
}

fn format_timestamp(secs: u64) -> String {
    // Simple timestamp formatting
    format!("{}", secs)
}

// ==================== Network Info ====================
pub fn get_network_info() -> serde_json::Value {
    let mut network = serde_json::Map::new();
    let mut interfaces = Vec::new();

    // Try to get network interfaces using ip command
    if let Ok(output) = Command::new("ip").args(["-o", "addr"]).output() {
        if let Ok(stdout) = String::from_utf8(output.stdout) {
            for line in stdout.lines() {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 4 {
                    let name = parts[1].trim_end_matches(':').to_string();
                    let ip = parts[3].split('/').next().unwrap_or("").to_string();
                    
                    // Get MAC address
                    let mac = get_mac_address(&name).unwrap_or_else(|| "unknown".to_string());
                    
                    // Check if interface is up
                    let is_up = parts.get(2).map_or(false, |&s| s.contains("UP"));

                    interfaces.push(serde_json::json!({
                        "name": name,
                        "ip": ip,
                        "mac": mac,
                        "is_up": is_up,
                    }));
                }
            }
        }
    }

    network.insert("interfaces".to_string(), serde_json::Value::Array(interfaces));
    network.insert("default_port".to_string(), serde_json::json!(0));
    network.insert("is_webui_bound".to_string(), serde_json::json!(true));

    serde_json::Value::Object(network)
}

fn get_mac_address(interface: &str) -> Option<String> {
    if let Ok(output) = Command::new("cat")
        .arg(format!("/sys/class/net/{}/address", interface))
        .output()
    {
        if let Ok(stdout) = String::from_utf8(output.stdout) {
            return Some(stdout.trim().to_string());
        }
    }
    None
}

// ==================== Database Info ====================
pub fn get_database_info() -> serde_json::Value {
    let mut db = serde_json::Map::new();

    // Default database path
    let db_path = std::env::var("DATABASE_PATH")
        .unwrap_or_else(|_| "./app.db".to_string());
    
    db.insert("path".to_string(), serde_json::json!(db_path));

    // Check if database file exists and get size
    if let Ok(metadata) = std::fs::metadata(&db_path) {
        db.insert("size_kb".to_string(), serde_json::json!(metadata.len() / 1024));
    } else {
        db.insert("size_kb".to_string(), serde_json::json!(0));
    }

    // Placeholder for table info (would need actual DB connection)
    db.insert("table_count".to_string(), serde_json::json!(0));
    db.insert("tables".to_string(), serde_json::json!(Vec::<serde_json::Value>::new()));
    db.insert("connection_pool_size".to_string(), serde_json::json!(10));
    db.insert("active_connections".to_string(), serde_json::json!(1));

    serde_json::Value::Object(db)
}

// ==================== Config Info ====================
pub fn get_config_info() -> serde_json::Value {
    let mut config = serde_json::Map::new();

    config.insert("app_name".to_string(), serde_json::json!(
        env!("CARGO_PKG_NAME").to_string()
    ));
    config.insert("version".to_string(), serde_json::json!(
        env!("CARGO_PKG_VERSION").to_string()
    ));
    config.insert("log_level".to_string(), serde_json::json!(
        std::env::var("RUST_LOG").unwrap_or_else(|_| "info".to_string())
    ));
    config.insert("log_file".to_string(), serde_json::json!(
        std::env::var("LOG_FILE").unwrap_or_else(|_| "./app.log".to_string())
    ));
    config.insert("database_path".to_string(), serde_json::json!(
        std::env::var("DATABASE_PATH").unwrap_or_else(|_| "./app.db".to_string())
    ));
    config.insert("port".to_string(), serde_json::json!(0));
    config.insert("debug_mode".to_string(), serde_json::json!(
        std::env::var("DEBUG").is_ok()
    ));
    config.insert("features".to_string(), serde_json::json!(Vec::<String>::new()));

    serde_json::Value::Object(config)
}

// ==================== Logs ====================
pub fn get_logs() -> serde_json::Value {
    serde_json::json!({
        "logs": Vec::<serde_json::Value>::new(),
        "count": 0,
    })
}

// ==================== Setup Handlers ====================
pub fn setup_sysinfo_handlers(window: &mut webui::Window) {
    // System info
    window.bind("get_system_info", |event| {
        info!("get_system_info called from frontend");
        let sysinfo = get_system_info();
        let response = serde_json::json!({ "data": sysinfo });
        let js = format!(
            "window.dispatchEvent(new CustomEvent('get_system_info_response', {{ detail: {} }}))",
            response
        );
        webui::Window::from_id(event.window).run_js(&js);
    });

    // Memory info
    window.bind("get_memory_info", |event| {
        info!("get_memory_info called from frontend");
        let mem_info = get_memory_info();
        let response = serde_json::json!({ "data": mem_info });
        let js = format!(
            "window.dispatchEvent(new CustomEvent('get_memory_info_response', {{ detail: {} }}))",
            response
        );
        webui::Window::from_id(event.window).run_js(&js);
    });

    // Process info
    window.bind("get_process_info", |event| {
        info!("get_process_info called from frontend");
        let proc_info = get_process_info();
        let response = serde_json::json!({ "data": proc_info });
        let js = format!(
            "window.dispatchEvent(new CustomEvent('get_process_info_response', {{ detail: {} }}))",
            response
        );
        webui::Window::from_id(event.window).run_js(&js);
    });

    // Network info
    window.bind("get_network_info", |event| {
        info!("get_network_info called from frontend");
        let net_info = get_network_info();
        let response = serde_json::json!({ "data": net_info });
        let js = format!(
            "window.dispatchEvent(new CustomEvent('get_network_info_response', {{ detail: {} }}))",
            response
        );
        webui::Window::from_id(event.window).run_js(&js);
    });

    // Database info
    window.bind("get_database_info", |event| {
        info!("get_database_info called from frontend");
        let db_info = get_database_info();
        let response = serde_json::json!({ "data": db_info });
        let js = format!(
            "window.dispatchEvent(new CustomEvent('get_database_info_response', {{ detail: {} }}))",
            response
        );
        webui::Window::from_id(event.window).run_js(&js);
    });

    // Config info
    window.bind("get_config_info", |event| {
        info!("get_config_info called from frontend");
        let config_info = get_config_info();
        let response = serde_json::json!({ "data": config_info });
        let js = format!(
            "window.dispatchEvent(new CustomEvent('get_config_info_response', {{ detail: {} }}))",
            response
        );
        webui::Window::from_id(event.window).run_js(&js);
    });

    // Logs
    window.bind("get_logs", |event| {
        info!("get_logs called from frontend");
        let logs = get_logs();
        let response = serde_json::json!({ "data": logs });
        let js = format!(
            "window.dispatchEvent(new CustomEvent('get_logs_response', {{ detail: {} }}))",
            response
        );
        webui::Window::from_id(event.window).run_js(&js);
    });

    info!("System info handlers set up successfully");
}