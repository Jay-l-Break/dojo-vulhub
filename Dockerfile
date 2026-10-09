FROM redis:5-alpine@sha256:1a3c609295332f1ce603948142a132656c92a08149d7096e203058533c415b8c AS redis

FROM python:2.7-slim-jessie@sha256:969a97a1cae4f1796104ebee4c4ec6ecb6bc81120d03498d56feebd5820cba93
WORKDIR /app
COPY --from=redis /usr/local/bin/redis-server /usr/local/bin/redis-server
COPY --from=redis /lib/ld-musl-x86_64.so.1 /lib/ld-musl-x86_64.so.1
COPY . /app
RUN pip install --disable-pip-version-check --no-cache-dir \
    'django==1.2.7' 'carrot==0.10.0' 'anyjson==0.3.3' \
    'simplejson==3.17.6' 'redis==2.10.6' \
    && cd /app/ghettoq && python setup.py install \
    && cd /app && pip install --no-deps .
ENV PYTHONPATH=/app:/app/ghettoq DJANGO_SETTINGS_MODULE=compat_settings
EXPOSE 80
CMD ["python", "/app/worker_health.py"]
