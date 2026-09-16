FROM --platform=linux/arm64 postgis/postgis:16-3.4
LABEL author="Dawid Kalbarczyk"
RUN apt-get update && apt-get install -y postgresql-16-pgrouting && rm -rf /var/lib/apt/lists/*
COPY ./docker/postgres/init-scripts /docker-entrypoint-initdb.d/