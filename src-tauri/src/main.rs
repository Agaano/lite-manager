use reqwest::blocking::Client;
use reqwest::Method;
use serde::Serialize;
use serde_json::Value;
use std::collections::HashMap;
use std::error::Error;
use tauri::command;

#[derive(Debug, Serialize)]
struct HttpResponse {
    status: u16,
    headers: HashMap<String, String>,
    body: String,
}

#[command]
fn make_request(
    url: &str,
    method: &str,
    headers_json: &str,
    body_json: &str,
) -> Result<HttpResponse, String> {
    let client = Client::new();

    let req_method = match method.to_uppercase().as_str() {
        "GET" => Method::GET,
        "POST" => Method::POST,
        "PUT" => Method::PUT,
        "DELETE" => Method::DELETE,
        "HEAD" => Method::HEAD,
        "OPTIONS" => Method::OPTIONS,
        "PATCH" => Method::PATCH,
        _ => return Err(format!("Unsupported HTTP method: {}", method)),
    };

    let headers_map: HashMap<String, String> = serde_json::from_str(headers_json)
        .map_err(|e| format!("Invalid headers JSON: {}", e))?;

    let body_value: Value = serde_json::from_str(body_json)
        .map_err(|e| format!("Invalid body JSON: {}", e))?;

    let mut request = client.request(req_method.clone(), url);
    for (key, value) in &headers_map {
        request = request.header(key, value);
    }

    if req_method == Method::POST || req_method == Method::PUT || req_method == Method::PATCH {
        request = request.json(&body_value);
    }

    let response = request.send().map_err(|e| format!("Request failed: {}", e))?;

    let status = response.status().as_u16();
    let headers = response.headers()
        .iter()
        .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("").to_string()))
        .collect();
    let body = response.text().map_err(|e| format!("Failed to read response body: {}", e))?;

    Ok(HttpResponse { status, headers, body })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![make_request])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}