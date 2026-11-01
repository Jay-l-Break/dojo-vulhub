FROM dpage/pgadmin4:9.10@sha256:5db07bd334fd801c982dd74a1bbc8d98b81a3684dac21efa9e368c677811c98c

COPY web/ /pgadmin4/
COPY seed_public/servers.json /pgadmin4/servers.json
COPY --chmod=755 local-entrypoint.sh /usr/local/bin/local-entrypoint.sh
ENTRYPOINT ["/usr/local/bin/local-entrypoint.sh"]
