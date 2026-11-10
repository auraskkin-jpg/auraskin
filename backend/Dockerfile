FROM rust:1-bookworm AS build

WORKDIR /workspace

RUN apt-get update \
    && apt-get install -y --no-install-recommends pkg-config libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/Cargo.toml backend/Cargo.lock ./backend/
COPY backend/src ./backend/src
COPY src/data/basmaglowProducts.json src/data/basmaglowReviews.json ./src/data/

WORKDIR /workspace/backend
RUN cargo build --release --locked

FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates libsqlite3-0 \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 10001 aura \
    && useradd --system --uid 10001 --gid aura --home-dir /nonexistent --shell /usr/sbin/nologin aura \
    && mkdir -p /data \
    && chown aura:aura /data

COPY --from=build /workspace/backend/target/release/aura-skin-api /usr/local/bin/aura-skin-api

ENV API_ADDRESS=0.0.0.0:8080
ENV DATABASE_PATH=/data/aura_skin.db

VOLUME ["/data"]
EXPOSE 8080
USER aura

CMD ["/usr/local/bin/aura-skin-api"]
