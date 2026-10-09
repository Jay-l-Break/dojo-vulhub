FROM vulhub/django:3.0.3@sha256:ecf4f3a7efe50953e9b8b725767d43d7d434669a0af5f39a11efda1dfaedda04

WORKDIR /app
RUN pip install --no-cache-dir psycopg2-binary==2.8.6
COPY app.py site_urls.py serve.py seed_database.py entrypoint.sh ./
COPY xss ./xss
COPY vendor ./vendor
ENV PYTHONPATH=/app/vendor
EXPOSE 80
CMD ["bash", "/app/entrypoint.sh"]
