FROM python:3.6-slim@sha256:2cfebc27956e6a55f78606864d91fe527696f9e32a724e6f9702b5f9602d0474

WORKDIR /app
RUN pip install --no-cache-dir psycopg2-binary==2.8.6 pytz==2021.3
COPY app.py seed_public.py entrypoint.sh ./
COPY vuln ./vuln
COPY vendor ./vendor
ENV PYTHONPATH=/app/vendor
EXPOSE 80
CMD ["bash", "/app/entrypoint.sh"]
