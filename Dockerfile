FROM python:3.9-slim@sha256:2d97f6910b16bd338d3060f261f53f144965f755599aab1acda1e13cf1731b1b

WORKDIR /app
RUN pip install --no-cache-dir PyMySQL==1.0.2 sqlparse==0.5.3 asgiref==3.8.1 pytz==2025.2
COPY app.py seed_public.py entrypoint.sh collection.json ./
COPY vuln ./vuln
COPY vendor ./vendor
ENV PYTHONPATH=/app/vendor
EXPOSE 80
CMD ["bash", "/app/entrypoint.sh"]
