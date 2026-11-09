# Dedicated runtime for encrypted isolated-staging backups.
# PostgreSQL 18 client tools are supplied by the official PostgreSQL image.
FROM postgres:18-bookworm

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       awscli ca-certificates gnupg python3 \
    && aws --version | grep -Eq '^aws-cli/2\.' \
    && psql --version | grep -q ' 18\.' \
    && pg_dump --version | grep -q ' 18\.' \
    && rm -rf /var/lib/apt/lists/*

COPY scripts/staging-encrypted-backup.sh /usr/local/bin/staging-encrypted-backup
RUN chmod 0755 /usr/local/bin/staging-encrypted-backup

# No application server, migration runner, or restore target is included.
ENTRYPOINT ["bash", "/usr/local/bin/staging-encrypted-backup"]
