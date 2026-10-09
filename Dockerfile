FROM dpage/pgadmin4:8.10@sha256:ab92b145c617f3c48ff54ed2cd765210a12e7b4f0d0da7897d944b2a90203910

COPY web/ /pgadmin4/
COPY seed_public/servers.json /pgadmin4/servers.json
COPY --chmod=755 local-entrypoint.sh /usr/local/bin/local-entrypoint.sh
ENTRYPOINT ["/usr/local/bin/local-entrypoint.sh"]
