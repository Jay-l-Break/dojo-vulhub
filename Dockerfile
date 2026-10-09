FROM apache/superset:1.5.0@sha256:8f1865a6ff43b1471d271901fc9d5feac84b8cbfdeb3b35d35cbbdcde3b751b3
LABEL dojo.vulnerability="superset-002"

COPY --chown=superset:superset superset /app/superset

RUN superset db upgrade \
    && superset fab create-admin \
       --username admin \
       --firstname Superset \
       --lastname Admin \
       --email admin@superset.com \
       --password "$(python -c 'import secrets; print(secrets.token_urlsafe(32))')" \
    && superset init

USER root
ENV SUPERSET_PORT=80
EXPOSE 80
CMD ["/usr/bin/run-server.sh"]
