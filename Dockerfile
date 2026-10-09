FROM langflowai/langflow:1.3.0@sha256:8c124064a4410ceff7a7ffbee3aec393e3b9fb2e3e43a163b537074143a38ca5

USER root
COPY src/backend/base/langflow /app/.venv/lib/python3.12/site-packages/langflow
COPY src/backend/langflow/version /app/.venv/lib/python3.12/site-packages/langflow/version
COPY seed_public.py /app/seed_public.py
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod 755 /app/entrypoint.sh
ENV LANGFLOW_HOST=0.0.0.0
ENV LANGFLOW_PORT=80
ENV DO_NOT_TRACK=true
EXPOSE 80
ENTRYPOINT ["/app/entrypoint.sh"]
