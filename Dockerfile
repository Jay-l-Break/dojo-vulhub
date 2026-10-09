FROM langflowai/langflow:1.0.0@sha256:28b05397c20ff82276d43cd5e66ccb81000cd9026949f0e14f667ebbfebef2fd

USER root
COPY src/backend/base/langflow /app/.venv/lib/python3.12/site-packages/langflow
COPY src/backend/langflow/version /app/.venv/lib/python3.12/site-packages/langflow/version
ENV LANGFLOW_HOST=0.0.0.0
ENV LANGFLOW_PORT=80
ENV DO_NOT_TRACK=true
EXPOSE 80
ENTRYPOINT ["python", "-m", "langflow", "run"]
CMD ["--host", "0.0.0.0", "--port", "80"]
