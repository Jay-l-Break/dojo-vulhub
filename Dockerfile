FROM python:3.7-slim-buster@sha256:9bd2bfc822a533f99cbe6b1311d5bf0ff136f776ebac9b985407829f17278935 AS python3

FROM python:2.7-slim@sha256:6c1ffdff499e29ea663e6e67c9b6b9a3b401d554d2c9f061f9a45344e3992363

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY vendor/Flask-0.1.tar.gz ./vendor/Flask-0.1.tar.gz
RUN pip install --no-cache-dir --no-deps ./vendor/Flask-0.1.tar.gz

COPY --from=python3 /usr/local/bin/python3.7 /usr/local/bin/python3.7
COPY --from=python3 /usr/local/lib/python3.7 /usr/local/lib/python3.7
COPY --from=python3 /usr/local/lib/libpython3.7m.so.1.0 /usr/local/lib/libpython3.7m.so.1.0
RUN ln -s python3.7 /usr/local/bin/python3 && ldconfig

COPY app.py ./

EXPOSE 80
CMD ["python", "app.py"]
