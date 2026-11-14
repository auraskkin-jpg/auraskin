use std::{env, error::Error, path::Path, sync::Arc, time::Duration as StdDuration};

use argon2::Argon2;
use axum::{
    Json, Router,
    extract::{DefaultBodyLimit, Path as AxumPath, State},
    http::{HeaderMap, HeaderValue, Method, StatusCode, header},
    response::{IntoResponse, Response},
    routing::{get, post, put},
};
use chrono::{Duration, Utc};
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation, decode, encode};
use password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString, rand_core::OsRng};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use sqlx::{
    SqlitePool,
    sqlite::{SqliteConnectOptions, SqlitePoolOptions},
};
use tower_http::cors::CorsLayer;
use uuid::Uuid;

#[derive(Clone)]
struct AppState {
    pool: SqlitePool,
    jwt_secret: Arc<String>,
}

#[derive(Debug)]
struct ApiError(StatusCode, String);

impl ApiError {
    fn bad_request(message: impl Into<String>) -> Self {
        Self(StatusCode::BAD_REQUEST, message.into())
    }

    fn unauthorized() -> Self {
        Self(
            StatusCode::UNAUTHORIZED,
            "E-mail ou mot de passe invalide.".into(),
        )
    }

    fn internal() -> Self {
        Self(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Erreur interne du serveur.".into(),
        )
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        (self.0, Json(json!({ "error": self.1 }))).into_response()
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    role: String,
    exp: usize,
    token_version: i64,
}

#[derive(Serialize)]
struct UserResponse {
    id: String,
    name: String,
    email: String,
    role: String,
    #[serde(skip_serializing)]
    token_version: i64,
}

#[derive(Serialize)]
struct AuthResponse {
    token: String,
    user: UserResponse,
}

#[derive(Deserialize)]
struct RegisterRequest {
    name: String,
    email: String,
    password: String,
}

#[derive(Deserialize)]
struct LoginRequest {
    email: String,
    password: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UpdateAdminAccountRequest {
    current_password: String,
    email: String,
    new_password: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UpdateAccountRequest {
    current_password: String,
    name: String,
    email: String,
    new_password: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct TrackPageViewRequest {
    visitor_id: String,
    page_path: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UpdateOrderStatusRequest {
    status: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AnalyticsResponse {
    today: TrafficMetrics,
    last_7_days: TrafficMetrics,
    last_30_days: TrafficMetrics,
    daily: Vec<DailyTraffic>,
    popular_pages: Vec<PopularPage>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct TrafficMetrics {
    visitors: i64,
    page_views: i64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DailyTraffic {
    date: String,
    visitors: i64,
    page_views: i64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct PopularPage {
    path: String,
    page_views: i64,
    visitors: i64,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct OrderItemRequest {
    product_id: i64,
    quantity: i64,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateOrderRequest {
    name: String,
    phone: String,
    address: String,
    city_code: String,
    delivery_type: String,
    promo_code: Option<String>,
    items: Vec<OrderItemRequest>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct OrderItem {
    product_id: i64,
    brand: String,
    name: String,
    vol: String,
    price: f64,
    quantity: i64,
    img: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct OrderResponse {
    id: String,
    customer_id: Option<String>,
    customer_name: String,
    phone: String,
    address: String,
    city_code: String,
    delivery_type: String,
    payment_method: String,
    items: Vec<OrderItem>,
    subtotal: f64,
    discount: f64,
    delivery_fee: f64,
    total: f64,
    status: String,
    created_at: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    dotenvy::dotenv().ok();

    let jwt_secret = required_env("JWT_SECRET")?;
    if jwt_secret.len() < 32 {
        return Err("JWT_SECRET doit contenir au moins 32 caractères.".into());
    }
    let admin_email = required_env("ADMIN_EMAIL")?.trim().to_lowercase();
    let admin_password = required_env("ADMIN_PASSWORD")?;
    let admin_reset_password = env::var("ADMIN_RESET_PASSWORD")
        .ok()
        .filter(|value| !value.trim().is_empty());
    let database_path = env::var("DATABASE_PATH").unwrap_or_else(|_| "aura_skin.db".into());
    eprintln!("Base de données SQLite : {database_path}");
    let cors_origin =
        env::var("API_CORS_ORIGIN").unwrap_or_else(|_| "http://localhost:3000".into());
    let cors_origin: HeaderValue = cors_origin.parse()?;

    let options = SqliteConnectOptions::new()
        .filename(Path::new(&database_path))
        .create_if_missing(true)
        .foreign_keys(true)
        .busy_timeout(StdDuration::from_secs(5));
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(options)
        .await?;

    initialize_database(&pool).await?;
    seed_products(&pool).await?;
    seed_reviews(&pool).await?;
    seed_admin(
        &pool,
        &admin_email,
        &admin_password,
        admin_reset_password.as_deref(),
    )
    .await?;

    let state = AppState {
        pool,
        jwt_secret: Arc::new(jwt_secret),
    };
    let cors = CorsLayer::new()
        .allow_origin(cors_origin)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers([header::AUTHORIZATION, header::CONTENT_TYPE]);
    let app = Router::new()
        .route("/api/health", get(health))
        .route("/api/analytics/page-view", post(record_page_view))
        .route("/api/products", get(list_products))
        .route("/api/reviews", get(list_reviews))
        .route("/api/site-texts", get(list_site_texts))
        .route("/api/auth/register", post(register))
        .route("/api/auth/login", post(login))
        .route("/api/auth/me", get(current_user))
        .route("/api/account", put(update_account))
        .route("/api/orders", post(create_order))
        .route("/api/orders/me", get(my_orders))
        .route("/api/admin/products", post(create_product))
        .route(
            "/api/admin/products/{id}",
            put(update_product).delete(delete_product),
        )
        .route("/api/admin/reviews", post(create_review))
        .route(
            "/api/admin/reviews/{id}",
            put(update_review).delete(delete_review),
        )
        .route("/api/admin/account", put(update_admin_account))
        .route("/api/admin/site-texts", put(update_site_texts))
        .route("/api/admin/analytics", get(get_analytics))
        .route("/api/admin/orders", get(list_orders))
        .route("/api/admin/orders/{id}/status", put(update_order_status))
        .layer(cors)
        .layer(DefaultBodyLimit::max(12 * 1024 * 1024))
        .with_state(state);

    let address = env::var("API_ADDRESS").unwrap_or_else(|_| "127.0.0.1:8080".into());
    let listener = tokio::net::TcpListener::bind(&address).await?;
    println!("Aura Skin API prête sur http://{address}");
    axum::serve(listener, app).await?;
    Ok(())
}

fn required_env(key: &str) -> Result<String, Box<dyn Error>> {
    env::var(key).map_err(|_| format!("La variable {key} est obligatoire.").into())
}

async fn initialize_database(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY,
            data TEXT NOT NULL
        )",
    )
    .execute(pool)
    .await?;
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('customer', 'admin')),
            token_version INTEGER NOT NULL DEFAULT 0
        )",
    )
    .execute(pool)
    .await?;
    let has_token_version: Option<i64> = sqlx::query_scalar(
        "SELECT 1 FROM pragma_table_info('users') WHERE name = 'token_version' LIMIT 1",
    )
    .fetch_optional(pool)
    .await?;
    if has_token_version.is_none() {
        sqlx::query(
            "ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0",
        )
        .execute(pool)
        .await?;
    }
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            customer_id TEXT REFERENCES users(id),
            payload TEXT NOT NULL,
            created_at TEXT NOT NULL
        )",
    )
    .execute(pool)
    .await?;
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY,
            data TEXT NOT NULL
        )",
    )
    .execute(pool)
    .await?;
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS page_views (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visitor_id TEXT NOT NULL,
            page_path TEXT NOT NULL,
            visited_at TEXT NOT NULL
        )",
    )
    .execute(pool)
    .await?;
    sqlx::query(
        "CREATE INDEX IF NOT EXISTS page_views_visited_at_idx ON page_views(visited_at)",
    )
    .execute(pool)
    .await?;
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS app_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )",
    )
    .execute(pool)
    .await?;
    Ok(())
}

async fn seed_products(pool: &SqlitePool) -> Result<(), Box<dyn Error>> {
    let seeded: Option<String> =
        sqlx::query_scalar("SELECT value FROM app_settings WHERE key = 'products_seeded'")
            .fetch_optional(pool)
            .await?;
    if seeded.is_some() {
        return Ok(());
    }
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM products")
        .fetch_one(pool)
        .await?;
    if count == 0 {
        let products: Vec<Value> =
            serde_json::from_str(include_str!("../../src/data/basmaglowProducts.json"))?;
        for product in products {
            let id = product["id"]
                .as_i64()
                .ok_or("Produit initial sans identifiant valide.")?;
            sqlx::query("INSERT INTO products (id, data) VALUES (?, ?)")
                .bind(id)
                .bind(serde_json::to_string(&product)?)
                .execute(pool)
                .await?;
        }
    }
    sqlx::query("INSERT OR IGNORE INTO app_settings (key, value) VALUES ('products_seeded', 'true')")
        .execute(pool)
        .await?;
    Ok(())
}

async fn seed_reviews(pool: &SqlitePool) -> Result<(), Box<dyn Error>> {
    let seeded: Option<String> =
        sqlx::query_scalar("SELECT value FROM app_settings WHERE key = 'reviews_seeded'")
                .fetch_optional(pool)
                .await?;
    if seeded.is_some() {
        return Ok(());
    }
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM reviews")
        .fetch_one(pool)
        .await?;
    if count == 0 {
        let reviews: Vec<Value> =
            serde_json::from_str(include_str!("../../src/data/basmaglowReviews.json"))?;
        for review in reviews {
            let id = review["id"]
                .as_i64()
                .ok_or("Avis initial sans identifiant valide.")?;
            sqlx::query("INSERT INTO reviews (id, data) VALUES (?, ?)")
                .bind(id)
                .bind(serde_json::to_string(&review)?)
                .execute(pool)
                .await?;
        }
    }
    sqlx::query("INSERT OR IGNORE INTO app_settings (key, value) VALUES ('reviews_seeded', 'true')")
        .execute(pool)
        .await?;
    Ok(())
}

async fn seed_admin(
    pool: &SqlitePool,
    email: &str,
    password: &str,
    reset_password: Option<&str>,
) -> Result<(), Box<dyn Error>> {
    let admin: Option<(String, String)> = sqlx::query_as(
        "SELECT id, password_hash FROM users WHERE role = 'admin' LIMIT 1",
    )
    .fetch_optional(pool)
    .await?;

    eprintln!(
        "Compte admin existant : {} | ADMIN_RESET_PASSWORD : {}",
        if admin.is_some() { "oui" } else { "non" },
        if reset_password.is_some() { "défini" } else { "non défini" }
    );

    if let Some(reset_password) = reset_password {
        validate_password(reset_password)
            .map_err(|message| format!("ADMIN_RESET_PASSWORD: {message}"))?;
        let applied_reset_hash: Option<String> = sqlx::query_scalar(
            "SELECT value FROM app_settings WHERE key = 'admin_reset_password_hash'",
        )
        .fetch_optional(pool)
        .await?;

        if admin.is_some()
            && applied_reset_hash
                .as_deref()
                .is_some_and(|hash| password_matches(reset_password, hash))
        {
            return Ok(());
        }

        let hash = hash_password(reset_password)?;
        if let Some((admin_id, _)) = admin {
            sqlx::query(
                "UPDATE users
                 SET email = ?, password_hash = ?, token_version = token_version + 1
                 WHERE id = ?",
            )
            .bind(email)
            .bind(&hash)
            .bind(admin_id)
            .execute(pool)
            .await?;
        } else {
            sqlx::query(
                "INSERT INTO users (id, name, email, password_hash, role)
                 VALUES (?, 'Aura Skin Admin', ?, ?, 'admin')",
            )
            .bind(Uuid::new_v4().to_string())
            .bind(email)
            .bind(&hash)
            .execute(pool)
            .await?;
        }

        sqlx::query(
            "INSERT OR REPLACE INTO app_settings (key, value)
             VALUES ('admin_reset_password_hash', ?)",
        )
        .bind(hash)
        .execute(pool)
        .await?;
        eprintln!("ADMIN_RESET_PASSWORD appliqué : identifiants administrateur mis à jour.");
    } else if admin.is_none() {
        validate_password(password).map_err(|message| format!("ADMIN_PASSWORD: {message}"))?;
        let hash = hash_password(password)?;
        sqlx::query(
            "INSERT INTO users (id, name, email, password_hash, role)
             VALUES (?, 'Aura Skin Admin', ?, ?, 'admin')",
        )
        .bind(Uuid::new_v4().to_string())
        .bind(email)
        .bind(hash)
        .execute(pool)
        .await?;
        eprintln!("Compte administrateur créé pour {email}.");
    }
    Ok(())
}

fn password_matches(password: &str, hash: &str) -> bool {
    PasswordHash::new(hash).is_ok_and(|parsed| {
        Argon2::default()
            .verify_password(password.as_bytes(), &parsed)
            .is_ok()
    })
}

async fn health() -> Json<Value> {
    Json(json!({ "status": "ok" }))
}

async fn list_site_texts(State(state): State<AppState>) -> Result<Json<Value>, ApiError> {
    let rows = sqlx::query_as::<_, (String, String)>(
        "SELECT key, value FROM app_settings WHERE key LIKE 'text:%' ORDER BY key",
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|_| ApiError::internal())?;

    let mut texts = serde_json::Map::new();
    for (key, value) in rows {
        if let Some(name) = key.strip_prefix("text:") {
            texts.insert(name.to_string(), Value::String(value));
        }
    }
    Ok(Json(Value::Object(texts)))
}

async fn update_site_texts(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(input): Json<Value>,
) -> Result<Json<Value>, ApiError> {
    require_admin(&headers, &state).await?;
    let texts = input
        .get("texts")
        .and_then(Value::as_object)
        .ok_or_else(|| ApiError::bad_request("Format des textes invalide."))?;

    let mut transaction = state.pool.begin().await.map_err(|_| ApiError::internal())?;
    for (key, value) in texts {
        let value = value
            .as_str()
            .ok_or_else(|| ApiError::bad_request("Texte invalide."))?;
        if key.is_empty() || key.len() > 120 || value.len() > 3_000_000 {
            return Err(ApiError::bad_request(
                "Texte trop long ou clé invalide.",
            ));
        }
        let database_key = format!("text:{key}");
        if value.trim().is_empty() {
            sqlx::query("DELETE FROM app_settings WHERE key = ?")
                .bind(&database_key)
                .execute(&mut *transaction)
                .await
                .map_err(|_| ApiError::internal())?;
        } else {
            sqlx::query(
                "INSERT INTO app_settings (key, value) VALUES (?, ?)
                 ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            )
            .bind(&database_key)
            .bind(value)
            .execute(&mut *transaction)
            .await
            .map_err(|_| ApiError::internal())?;
        }
    }
    transaction.commit().await.map_err(|_| ApiError::internal())?;
    Ok(Json(json!({ "status": "ok" })))
}

async fn list_products(State(state): State<AppState>) -> Result<Json<Vec<Value>>, ApiError> {
    let rows = sqlx::query_scalar::<_, String>("SELECT data FROM products ORDER BY id")
        .fetch_all(&state.pool)
        .await
        .map_err(|_| ApiError::internal())?;
    let products = rows
        .into_iter()
        .map(|row| serde_json::from_str(&row).map_err(|_| ApiError::internal()))
        .collect::<Result<Vec<Value>, _>>()?;
    Ok(Json(products))
}

async fn list_reviews(State(state): State<AppState>) -> Result<Json<Vec<Value>>, ApiError> {
    let rows = sqlx::query_scalar::<_, String>("SELECT data FROM reviews ORDER BY id")
        .fetch_all(&state.pool)
        .await
        .map_err(|_| ApiError::internal())?;
    let reviews = rows
        .into_iter()
        .map(|row| serde_json::from_str(&row).map_err(|_| ApiError::internal()))
        .collect::<Result<Vec<Value>, _>>()?;
    Ok(Json(reviews))
}

async fn record_page_view(
    State(state): State<AppState>,
    Json(input): Json<TrackPageViewRequest>,
) -> Result<StatusCode, ApiError> {
    let visitor_id = Uuid::parse_str(&input.visitor_id)
        .map_err(|_| ApiError::bad_request("Identifiant visiteur invalide."))?
        .to_string();
    let page_path = input.page_path.trim();
    if !page_path.starts_with('/')
        || page_path.starts_with("//")
        || page_path.len() > 200
        || page_path.chars().any(char::is_control)
        || page_path == "/ikrame"
        || page_path.starts_with("/ikrame/")
        || page_path.starts_with("/api/")
    {
        return Err(ApiError::bad_request("Chemin de page invalide."));
    }

    sqlx::query("INSERT INTO page_views (visitor_id, page_path, visited_at) VALUES (?, ?, ?)")
        .bind(visitor_id)
        .bind(page_path)
        .bind(Utc::now().to_rfc3339())
        .execute(&state.pool)
        .await
        .map_err(|_| ApiError::internal())?;
    Ok(StatusCode::NO_CONTENT)
}

async fn register(
    State(state): State<AppState>,
    Json(input): Json<RegisterRequest>,
) -> Result<Json<AuthResponse>, ApiError> {
    let name = input.name.trim();
    let email = input.email.trim().to_lowercase();
    if name.is_empty() || name.len() > 120 || !valid_email(&email) {
        return Err(ApiError::bad_request("Nom ou adresse e-mail invalide."));
    }
    validate_password(&input.password).map_err(ApiError::bad_request)?;
    let existing: Option<String> = sqlx::query_scalar("SELECT id FROM users WHERE email = ?")
        .bind(&email)
        .fetch_optional(&state.pool)
        .await
        .map_err(|_| ApiError::internal())?;
    if existing.is_some() {
        return Err(ApiError(
            StatusCode::CONFLICT,
            "Cette adresse e-mail est déjà utilisée.".into(),
        ));
    }

    let id = Uuid::new_v4().to_string();
    let password_hash = hash_password(&input.password).map_err(|_| ApiError::internal())?;
    sqlx::query(
        "INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, 'customer')",
    )
    .bind(&id)
    .bind(name)
    .bind(&email)
    .bind(password_hash)
    .execute(&state.pool)
    .await
    .map_err(|_| ApiError::internal())?;

    auth_response(
        &state,
        UserResponse {
            id,
            name: name.into(),
            email,
            role: "customer".into(),
            token_version: 0,
        },
    )
    .map(Json)
}

async fn login(
    State(state): State<AppState>,
    Json(input): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, ApiError> {
    let email = input.email.trim().to_lowercase();
    let row = sqlx::query_as::<_, (String, String, String, String, String, i64)>(
        "SELECT id, name, email, password_hash, role, token_version FROM users WHERE email = ?",
    )
    .bind(&email)
    .fetch_optional(&state.pool)
    .await
    .map_err(|_| ApiError::internal())?;
    let Some(row) = row else {
        eprintln!("Échec de connexion : e-mail inconnu.");
        return Err(ApiError::unauthorized());
    };
    let (id, name, email, password_hash, role, token_version) = row;
    let parsed_hash = PasswordHash::new(&password_hash).map_err(|_| ApiError::internal())?;
    if Argon2::default()
        .verify_password(input.password.as_bytes(), &parsed_hash)
        .is_err()
    {
        eprintln!("Échec de connexion : mot de passe incorrect.");
        return Err(ApiError::unauthorized());
    }
    auth_response(
        &state,
        UserResponse {
            id,
            name,
            email,
            role,
            token_version,
        },
    )
    .map(Json)
}

async fn current_user(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<UserResponse>, ApiError> {
    let claims = required_claims(&headers, &state).await?;
    let row = sqlx::query_as::<_, (String, String, String, String, i64)>(
        "SELECT id, name, email, role, token_version FROM users WHERE id = ?",
    )
    .bind(&claims.sub)
    .fetch_optional(&state.pool)
    .await
    .map_err(|_| ApiError::internal())?
    .ok_or_else(ApiError::unauthorized)?;
    Ok(Json(UserResponse {
        id: row.0,
        name: row.1,
        email: row.2,
        role: row.3,
        token_version: row.4,
    }))
}

async fn create_order(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(input): Json<CreateOrderRequest>,
) -> Result<(StatusCode, Json<OrderResponse>), ApiError> {
    let customer_id = optional_claims(&headers, &state)
        .await?
        .map(|claims| claims.sub);
    let name = input.name.trim();
    let phone = input.phone.trim();
    let address = input.address.trim();
    if name.is_empty() || name.len() > 120 || address.is_empty() || address.len() > 500 {
        return Err(ApiError::bad_request(
            "Les informations de livraison sont invalides.",
        ));
    }
    let phone_digits = phone.chars().filter(char::is_ascii_digit).count();
    if phone_digits < 9 || phone_digits > 15 {
        return Err(ApiError::bad_request("Numéro de téléphone invalide."));
    }
    if input.items.is_empty() || input.items.len() > 100 {
        return Err(ApiError::bad_request(
            "Le panier est vide ou trop volumineux.",
        ));
    }
    if input.delivery_type != "home" && input.delivery_type != "desk" {
        return Err(ApiError::bad_request("Mode de livraison invalide."));
    }
    let city_fee = city_delivery_fee(&input.city_code, &input.delivery_type)
        .ok_or_else(|| ApiError::bad_request("Ville de livraison invalide."))?;

    let mut items = Vec::with_capacity(input.items.len());
    for requested in input.items {
        if !(1..=50).contains(&requested.quantity) {
            return Err(ApiError::bad_request("Quantité de produit invalide."));
        }
        let product_json: Option<String> =
            sqlx::query_scalar("SELECT data FROM products WHERE id = ?")
                .bind(requested.product_id)
                .fetch_optional(&state.pool)
                .await
                .map_err(|_| ApiError::internal())?;
        let product: Value = serde_json::from_str(
            &product_json
                .ok_or_else(|| ApiError::bad_request("Un produit du panier n'existe plus."))?,
        )
        .map_err(|_| ApiError::internal())?;
        let price = product["sale"]
            .as_f64()
            .filter(|price| *price > 0.0)
            .or_else(|| product["price"].as_f64())
            .filter(|price| price.is_finite() && *price >= 0.0)
            .ok_or_else(ApiError::internal)?;
        if price == 0.0 {
            return Err(ApiError::bad_request(
                "Un produit du panier n'a pas encore de prix.",
            ));
        }
        items.push(OrderItem {
            product_id: requested.product_id,
            brand: product["brand"].as_str().unwrap_or("").to_owned(),
            name: product["name"].as_str().unwrap_or("").to_owned(),
            vol: product["vol"].as_str().unwrap_or("").to_owned(),
            price,
            quantity: requested.quantity,
            img: product["img"].as_str().unwrap_or("").to_owned(),
        });
    }

    let subtotal = items
        .iter()
        .map(|item| item.price * item.quantity as f64)
        .sum::<f64>();
    let promo_code = input.promo_code.unwrap_or_default().trim().to_uppercase();
    let discount = match promo_code.as_str() {
        "AURA10" | "GLOW10" | "BASMA10" => (subtotal * 0.1).round(),
        "GLOW50" if subtotal >= 300.0 => 50.0,
        "" => 0.0,
        _ => return Err(ApiError::bad_request("Code promotionnel invalide.")),
    };
    let delivery_fee = if subtotal >= 1000.0 { 0.0 } else { city_fee };
    let id = format!(
        "AURA-{}",
        Uuid::new_v4().simple().to_string()[..8].to_uppercase()
    );
    let created_at = Utc::now().to_rfc3339();
    let order = OrderResponse {
        id,
        customer_id,
        customer_name: name.to_owned(),
        phone: phone.to_owned(),
        address: address.to_owned(),
        city_code: input.city_code,
        delivery_type: input.delivery_type,
        payment_method: "cash_on_delivery".into(),
        items,
        subtotal,
        discount,
        delivery_fee,
        total: (subtotal - discount).max(0.0) + delivery_fee,
        status: "pending".into(),
        created_at,
    };
    sqlx::query("INSERT INTO orders (id, customer_id, payload, created_at) VALUES (?, ?, ?, ?)")
        .bind(&order.id)
        .bind(&order.customer_id)
        .bind(serde_json::to_string(&order).map_err(|_| ApiError::internal())?)
        .bind(&order.created_at)
        .execute(&state.pool)
        .await
        .map_err(|_| ApiError::internal())?;
    Ok((StatusCode::CREATED, Json(order)))
}

async fn my_orders(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<Vec<Value>>, ApiError> {
    let claims = required_claims(&headers, &state).await?;
    let rows = sqlx::query_scalar::<_, String>(
        "SELECT payload FROM orders WHERE customer_id = ? ORDER BY created_at DESC",
    )
    .bind(claims.sub)
    .fetch_all(&state.pool)
    .await
    .map_err(|_| ApiError::internal())?;
    parse_json_rows(rows).map(Json)
}

async fn list_orders(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<Vec<Value>>, ApiError> {
    require_admin(&headers, &state).await?;
    let rows =
        sqlx::query_scalar::<_, String>("SELECT payload FROM orders ORDER BY created_at DESC")
            .fetch_all(&state.pool)
            .await
            .map_err(|_| ApiError::internal())?;
    parse_json_rows(rows).map(Json)
}

async fn update_order_status(
    State(state): State<AppState>,
    headers: HeaderMap,
    AxumPath(id): AxumPath<String>,
    Json(input): Json<UpdateOrderStatusRequest>,
) -> Result<Json<Value>, ApiError> {
    require_admin(&headers, &state).await?;
    let allowed = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if !allowed.contains(&input.status.as_str()) {
        return Err(ApiError::bad_request("Statut de commande invalide."));
    }

    let payload: Option<String> = sqlx::query_scalar("SELECT payload FROM orders WHERE id = ?")
        .bind(&id)
        .fetch_optional(&state.pool)
        .await
        .map_err(|_| ApiError::internal())?;
    let payload = payload.ok_or_else(|| ApiError(StatusCode::NOT_FOUND, "Commande introuvable.".into()))?;

    let mut order: Value = serde_json::from_str(&payload).map_err(|_| ApiError::internal())?;
    order["status"] = Value::String(input.status);

    sqlx::query("UPDATE orders SET payload = ? WHERE id = ?")
        .bind(serde_json::to_string(&order).map_err(|_| ApiError::internal())?)
        .bind(&id)
        .execute(&state.pool)
        .await
        .map_err(|_| ApiError::internal())?;

    Ok(Json(order))
}

async fn get_analytics(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<AnalyticsResponse>, ApiError> {
    require_admin(&headers, &state).await?;

    let (visitors, page_views) = sqlx::query_as::<_, (i64, i64)>(
        "SELECT COUNT(DISTINCT visitor_id), COUNT(*)
         FROM page_views
         WHERE date(visited_at) = date('now')",
    )
    .fetch_one(&state.pool)
    .await
    .map_err(|_| ApiError::internal())?;
    let today = TrafficMetrics {
        visitors,
        page_views,
    };

    let (visitors, page_views) = sqlx::query_as::<_, (i64, i64)>(
        "SELECT COUNT(DISTINCT visitor_id), COUNT(*)
         FROM page_views
         WHERE datetime(visited_at) >= datetime('now', '-7 days')",
    )
    .fetch_one(&state.pool)
    .await
    .map_err(|_| ApiError::internal())?;
    let last_7_days = TrafficMetrics {
        visitors,
        page_views,
    };

    let (visitors, page_views) = sqlx::query_as::<_, (i64, i64)>(
        "SELECT COUNT(DISTINCT visitor_id), COUNT(*)
         FROM page_views
         WHERE datetime(visited_at) >= datetime('now', '-30 days')",
    )
    .fetch_one(&state.pool)
    .await
    .map_err(|_| ApiError::internal())?;
    let last_30_days = TrafficMetrics {
        visitors,
        page_views,
    };

    let daily = sqlx::query_as::<_, (String, i64, i64)>(
        "WITH RECURSIVE days(day) AS (
            SELECT date('now', '-13 days')
            UNION ALL
            SELECT date(day, '+1 day') FROM days WHERE day < date('now')
        )
        SELECT days.day, COUNT(DISTINCT page_views.visitor_id), COUNT(page_views.id)
        FROM days
        LEFT JOIN page_views ON date(page_views.visited_at) = days.day
        GROUP BY days.day
        ORDER BY days.day",
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|_| ApiError::internal())?
    .into_iter()
    .map(|(date, visitors, page_views)| DailyTraffic {
        date,
        visitors,
        page_views,
    })
    .collect();

    let popular_pages = sqlx::query_as::<_, (String, i64, i64)>(
        "SELECT page_path, COUNT(*), COUNT(DISTINCT visitor_id)
         FROM page_views
         WHERE datetime(visited_at) >= datetime('now', '-30 days')
         GROUP BY page_path
         ORDER BY COUNT(*) DESC
         LIMIT 10",
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|_| ApiError::internal())?
    .into_iter()
    .map(|(path, page_views, visitors)| PopularPage {
        path,
        page_views,
        visitors,
    })
    .collect();

    Ok(Json(AnalyticsResponse {
        today,
        last_7_days,
        last_30_days,
        daily,
        popular_pages,
    }))
}

async fn create_product(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(mut product): Json<Value>,
) -> Result<(StatusCode, Json<Value>), ApiError> {
    require_admin(&headers, &state).await?;
    validate_product(&product)?;
    let id = match product["id"].as_i64() {
        Some(id) if id > 0 => id,
        _ => sqlx::query_scalar::<_, i64>("SELECT COALESCE(MAX(id), 0) + 1 FROM products")
            .fetch_one(&state.pool)
            .await
            .map_err(|_| ApiError::internal())?,
    };
    product["id"] = json!(id);
    sqlx::query("INSERT INTO products (id, data) VALUES (?, ?)")
        .bind(id)
        .bind(serde_json::to_string(&product).map_err(|_| ApiError::internal())?)
        .execute(&state.pool)
        .await
        .map_err(|error| {
            if matches!(error, sqlx::Error::Database(ref database_error) if database_error.is_unique_violation()) {
                ApiError(StatusCode::CONFLICT, "Cet identifiant produit existe déjà.".into())
            } else {
                ApiError::internal()
            }
        })?;
    Ok((StatusCode::CREATED, Json(product)))
}

async fn update_product(
    State(state): State<AppState>,
    headers: HeaderMap,
    AxumPath(id): AxumPath<i64>,
    Json(mut product): Json<Value>,
) -> Result<Json<Value>, ApiError> {
    require_admin(&headers, &state).await?;
    validate_product(&product)?;
    product["id"] = json!(id);
    let result = sqlx::query("UPDATE products SET data = ? WHERE id = ?")
        .bind(serde_json::to_string(&product).map_err(|_| ApiError::internal())?)
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|_| ApiError::internal())?;
    if result.rows_affected() == 0 {
        return Err(ApiError(
            StatusCode::NOT_FOUND,
            "Produit introuvable.".into(),
        ));
    }
    Ok(Json(product))
}

async fn delete_product(
    State(state): State<AppState>,
    headers: HeaderMap,
    AxumPath(id): AxumPath<i64>,
) -> Result<StatusCode, ApiError> {
    require_admin(&headers, &state).await?;
    let result = sqlx::query("DELETE FROM products WHERE id = ?")
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|_| ApiError::internal())?;
    if result.rows_affected() == 0 {
        return Err(ApiError(
            StatusCode::NOT_FOUND,
            "Produit introuvable.".into(),
        ));
    }
    Ok(StatusCode::NO_CONTENT)
}

async fn create_review(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(mut review): Json<Value>,
) -> Result<(StatusCode, Json<Value>), ApiError> {
    require_admin(&headers, &state).await?;
    validate_review(&review)?;
    let id = match review["id"].as_i64() {
        Some(id) if id > 0 => id,
        _ => sqlx::query_scalar::<_, i64>("SELECT COALESCE(MAX(id), 0) + 1 FROM reviews")
            .fetch_one(&state.pool)
            .await
            .map_err(|_| ApiError::internal())?,
    };
    review["id"] = json!(id);
    sqlx::query("INSERT INTO reviews (id, data) VALUES (?, ?)")
        .bind(id)
        .bind(serde_json::to_string(&review).map_err(|_| ApiError::internal())?)
        .execute(&state.pool)
        .await
        .map_err(|_| ApiError::internal())?;
    Ok((StatusCode::CREATED, Json(review)))
}

async fn update_review(
    State(state): State<AppState>,
    headers: HeaderMap,
    AxumPath(id): AxumPath<i64>,
    Json(mut review): Json<Value>,
) -> Result<Json<Value>, ApiError> {
    require_admin(&headers, &state).await?;
    validate_review(&review)?;
    review["id"] = json!(id);
    let result = sqlx::query("UPDATE reviews SET data = ? WHERE id = ?")
        .bind(serde_json::to_string(&review).map_err(|_| ApiError::internal())?)
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|_| ApiError::internal())?;
    if result.rows_affected() == 0 {
        return Err(ApiError(StatusCode::NOT_FOUND, "Avis introuvable.".into()));
    }
    Ok(Json(review))
}

async fn delete_review(
    State(state): State<AppState>,
    headers: HeaderMap,
    AxumPath(id): AxumPath<i64>,
) -> Result<StatusCode, ApiError> {
    require_admin(&headers, &state).await?;
    let result = sqlx::query("DELETE FROM reviews WHERE id = ?")
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|_| ApiError::internal())?;
    if result.rows_affected() == 0 {
        return Err(ApiError(StatusCode::NOT_FOUND, "Avis introuvable.".into()));
    }
    Ok(StatusCode::NO_CONTENT)
}

async fn update_admin_account(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(input): Json<UpdateAdminAccountRequest>,
) -> Result<Json<AuthResponse>, ApiError> {
    let claims = require_admin(&headers, &state).await?;
    let (id, name, password_hash, token_version) =
        sqlx::query_as::<_, (String, String, String, i64)>(
            "SELECT id, name, password_hash, token_version FROM users WHERE id = ? AND role = 'admin'",
        )
        .bind(&claims.sub)
        .fetch_optional(&state.pool)
        .await
        .map_err(|_| ApiError::internal())?
        .ok_or_else(ApiError::unauthorized)?;

    let parsed_hash = PasswordHash::new(&password_hash).map_err(|_| ApiError::internal())?;
    if Argon2::default()
        .verify_password(input.current_password.as_bytes(), &parsed_hash)
        .is_err()
    {
        return Err(ApiError::unauthorized());
    }

    let email = input.email.trim().to_lowercase();
    if !valid_email(&email) {
        return Err(ApiError::bad_request("Adresse e-mail invalide."));
    }
    let new_password = input.new_password.unwrap_or_default();
    let password_hash = if new_password.is_empty() {
        password_hash
    } else {
        validate_password(&new_password).map_err(ApiError::bad_request)?;
        hash_password(&new_password).map_err(|_| ApiError::internal())?
    };
    sqlx::query("UPDATE users SET email = ?, password_hash = ?, token_version = token_version + 1 WHERE id = ?")
        .bind(&email)
        .bind(password_hash)
        .bind(&id)
        .execute(&state.pool)
        .await
        .map_err(|error| {
            if matches!(error, sqlx::Error::Database(ref database_error) if database_error.is_unique_violation()) {
                ApiError(StatusCode::CONFLICT, "Cette adresse e-mail est déjà utilisée.".into())
            } else {
                ApiError::internal()
            }
        })?;

    auth_response(
        &state,
        UserResponse {
            id,
            name,
            email,
            role: "admin".into(),
            token_version: token_version + 1,
        },
    )
    .map(Json)
}

async fn update_account(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(input): Json<UpdateAccountRequest>,
) -> Result<Json<AuthResponse>, ApiError> {
    let claims = required_claims(&headers, &state).await?;
    let (id, role, password_hash, token_version) =
        sqlx::query_as::<_, (String, String, String, i64)>(
            "SELECT id, role, password_hash, token_version FROM users WHERE id = ?",
        )
        .bind(&claims.sub)
        .fetch_optional(&state.pool)
        .await
        .map_err(|_| ApiError::internal())?
        .ok_or_else(ApiError::unauthorized)?;

    let parsed_hash = PasswordHash::new(&password_hash).map_err(|_| ApiError::internal())?;
    if Argon2::default()
        .verify_password(input.current_password.as_bytes(), &parsed_hash)
        .is_err()
    {
        return Err(ApiError::unauthorized());
    }

    let name = input.name.trim();
    if name.is_empty() || name.len() > 120 {
        return Err(ApiError::bad_request("Nom invalide."));
    }
    let email = input.email.trim().to_lowercase();
    if !valid_email(&email) {
        return Err(ApiError::bad_request("Adresse e-mail invalide."));
    }
    let new_password = input.new_password.unwrap_or_default();
    let password_hash = if new_password.is_empty() {
        password_hash
    } else {
        validate_password(&new_password).map_err(ApiError::bad_request)?;
        hash_password(&new_password).map_err(|_| ApiError::internal())?
    };
    sqlx::query(
        "UPDATE users SET name = ?, email = ?, password_hash = ?, token_version = token_version + 1 WHERE id = ?",
    )
    .bind(name)
    .bind(&email)
    .bind(password_hash)
    .bind(&id)
    .execute(&state.pool)
    .await
    .map_err(|error| {
        if matches!(error, sqlx::Error::Database(ref database_error) if database_error.is_unique_violation()) {
            ApiError(StatusCode::CONFLICT, "Cette adresse e-mail est déjà utilisée.".into())
        } else {
            ApiError::internal()
        }
    })?;

    auth_response(
        &state,
        UserResponse {
            id,
            name: name.to_owned(),
            email,
            role,
            token_version: token_version + 1,
        },
    )
    .map(Json)
}

fn validate_product(product: &Value) -> Result<(), ApiError> {
    if !product.is_object()
        || product["name"].as_str().unwrap_or("").trim().is_empty()
        || product["brand"].as_str().unwrap_or("").trim().is_empty()
    {
        return Err(ApiError::bad_request(
            "Les champs nom et marque du produit sont requis.",
        ));
    }
    for field in ["price", "sale"] {
        let price = product[field]
            .as_f64()
            .ok_or_else(|| ApiError::bad_request("Les prix doivent être des nombres positifs."))?;
        if !price.is_finite() || price < 0.0 {
            return Err(ApiError::bad_request(
                "Les prix doivent être des nombres positifs.",
            ));
        }
    }
    let tag = product["tag"].as_str().unwrap_or("");
    if !["", "new", "promo", "best", "soldout", "packs"].contains(&tag) {
        return Err(ApiError::bad_request("Tag de produit invalide."));
    }
    Ok(())
}

fn validate_review(review: &Value) -> Result<(), ApiError> {
    if !review.is_object()
        || review["name"].as_str().unwrap_or("").trim().is_empty()
        || review["wilaya"].as_str().unwrap_or("").trim().is_empty()
        || review["date"].as_str().unwrap_or("").trim().is_empty()
        || review["comment"].as_str().unwrap_or("").trim().is_empty()
        || !(1..=5).contains(&review["rating"].as_i64().unwrap_or_default())
    {
        return Err(ApiError::bad_request(
            "Les informations de l’avis sont invalides.",
        ));
    }
    Ok(())
}

fn city_delivery_fee(city_code: &str, _delivery_type: &str) -> Option<f64> {
    // Livraison partout au Maroc : 19 DH à Casablanca, 40 DH pour toutes les autres villes.
    let fee = match city_code {
        "CAS" => 19.0,
        "RAB" | "SAL" | "MOH" | "RAK" | "TNG" | "FEZ" | "AGA" | "MEK" | "OUJ" | "KEN" | "TET"
        | "JAD" | "NAD" | "SAF" | "BEN" | "KHO" | "ESS" | "TAZ" | "LAR" | "BER" | "EUN"
        | "VIL" | "AUT" => 40.0,
        _ => return None,
    };
    Some(fee)
}

fn valid_email(email: &str) -> bool {
    email.len() <= 254
        && email.split_once('@').is_some_and(|(local, domain)| {
            !local.is_empty()
                && domain.contains('.')
                && !domain.starts_with('.')
                && !domain.ends_with('.')
        })
}

fn validate_password(password: &str) -> Result<(), String> {
    if password.chars().count() < 10 || password.len() > 128 {
        return Err("Le mot de passe doit contenir entre 10 et 128 caractères.".into());
    }
    Ok(())
}

fn hash_password(password: &str) -> Result<String, password_hash::Error> {
    let salt = SaltString::generate(&mut OsRng);
    Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map(|hash| hash.to_string())
}

fn auth_response(state: &AppState, user: UserResponse) -> Result<AuthResponse, ApiError> {
    let claims = Claims {
        sub: user.id.clone(),
        role: user.role.clone(),
        exp: (Utc::now() + Duration::hours(24)).timestamp() as usize,
        token_version: user.token_version,
    };
    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(state.jwt_secret.as_bytes()),
    )
    .map_err(|_| ApiError::internal())?;
    Ok(AuthResponse { token, user })
}

fn bearer_token(headers: &HeaderMap) -> Result<Option<&str>, ApiError> {
    match headers.get(header::AUTHORIZATION) {
        None => Ok(None),
        Some(value) => value
            .to_str()
            .ok()
            .and_then(|value| value.strip_prefix("Bearer "))
            .filter(|token| !token.is_empty())
            .map(Some)
            .ok_or_else(ApiError::unauthorized),
    }
}

async fn optional_claims(
    headers: &HeaderMap,
    state: &AppState,
) -> Result<Option<Claims>, ApiError> {
    let Some(token) = bearer_token(headers)? else {
        return Ok(None);
    };
    let claims = decode::<Claims>(
        token,
        &DecodingKey::from_secret(state.jwt_secret.as_bytes()),
        &Validation::default(),
    )
    .map_err(|_| ApiError::unauthorized())?
    .claims;
    let token_version: Option<i64> =
        sqlx::query_scalar("SELECT token_version FROM users WHERE id = ?")
            .bind(&claims.sub)
            .fetch_optional(&state.pool)
            .await
            .map_err(|_| ApiError::internal())?;
    if token_version != Some(claims.token_version) {
        return Err(ApiError::unauthorized());
    }
    Ok(Some(claims))
}

async fn required_claims(headers: &HeaderMap, state: &AppState) -> Result<Claims, ApiError> {
    optional_claims(headers, state)
        .await?
        .ok_or_else(ApiError::unauthorized)
}

async fn require_admin(headers: &HeaderMap, state: &AppState) -> Result<Claims, ApiError> {
    let claims = required_claims(headers, state).await?;
    if claims.role != "admin" {
        return Err(ApiError(
            StatusCode::FORBIDDEN,
            "Accès réservé à l'administration.".into(),
        ));
    }
    Ok(claims)
}

fn parse_json_rows(rows: Vec<String>) -> Result<Vec<Value>, ApiError> {
    rows.into_iter()
        .map(|row| serde_json::from_str(&row).map_err(|_| ApiError::internal()))
        .collect()
}
