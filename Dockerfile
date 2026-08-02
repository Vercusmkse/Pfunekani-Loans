# --- Stage 1: Cargo Chef Base ---
FROM rust:bookworm AS chef
RUN cargo install cargo-chef
WORKDIR /usr/src/village_loans

# --- Stage 2: Planner ---
# Computes a lockfile recipe to isolate dependency metadata
FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# --- Stage 3: Builder ---
# Builds and caches dependencies separately from application code
FROM chef AS builder
COPY --from=planner /usr/src/village_loans/recipe.json recipe.json
# Build & cache dependency layer
RUN cargo chef cook --release --recipe-path recipe.json

# Copy actual source code and SQLx preparation data
COPY . .

# Enable offline compile mode for SQLx so it uses sqlx-data.json / .sqlx directory
ENV SQLX_OFFLINE=true

RUN cargo build --release

# --- Stage 4: Runtime ---
FROM debian:bookworm-slim AS runtime

# Create a non-root system user for security
RUN groupadd --gid 10001 appgroup && \
    useradd --uid 10001 --gid appgroup --shell /bin/bash --create-home appuser

ENV TZ=Etc/UTC
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    tzdata \
    libssl3 \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built binary from builder stage
COPY --from=builder /usr/src/village_loans/target/release/village_loans /usr/local/bin/village_loans

# Copy migrations folder for runtime execution if needed
COPY --from=builder /usr/src/village_loans/migrations ./migrations

# Switch to non-root user
USER appuser

EXPOSE 3000

ENTRYPOINT ["village_loans"]