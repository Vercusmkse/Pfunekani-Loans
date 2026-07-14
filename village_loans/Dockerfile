# --- Builder Stage ---
FROM rust:1.78 as builder

WORKDIR /usr/src/village_loans

# Install sqlx-cli
RUN cargo install sqlx-cli

# Copy source code
COPY . .

# Prepare sqlx cache
RUN cargo sqlx prepare

# Build the application
RUN cargo build --release

# --- Final Stage ---
FROM debian:buster-slim

# Set the timezone
ENV TZ=Etc/UTC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Copy the built binary from the builder stage
COPY --from=builder /usr/src/village_loans/target/release/village_loans /usr/local/bin/village_loans

# Copy migrations
COPY migrations ./migrations

# Expose the application port
EXPOSE 3000

# Run the application
CMD ["village_loans"]
