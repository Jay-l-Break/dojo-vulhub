FROM dpage/pgadmin4:9.2@sha256:52cb72a9e3da275324ca0b9bb3891021366d501aad375db34584a7bca8ce02ff

COPY web/ /pgadmin4/
COPY seed_public/servers.json /pgadmin4/servers.json
COPY --chmod=755 local-entrypoint.sh /usr/local/bin/local-entrypoint.sh
ENTRYPOINT ["/usr/local/bin/local-entrypoint.sh"]
