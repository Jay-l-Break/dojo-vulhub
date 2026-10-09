FROM dpage/pgadmin4:5.4@sha256:eeb04723e964047baf204219e82e365c800a1e78a78fff0d8c09967cac12d395

COPY web/ /pgadmin4/
COPY --chmod=755 docker-entrypoint-local.sh /usr/local/bin/docker-entrypoint-local.sh

ENV PGADMIN_DEFAULT_EMAIL=admin@example.com \
    PGADMIN_LISTEN_ADDRESS=0.0.0.0 \
    PGADMIN_LISTEN_PORT=80

EXPOSE 80
ENTRYPOINT ["/usr/local/bin/docker-entrypoint-local.sh"]
