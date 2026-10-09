FROM python:3.6-slim@sha256:2cfebc27956e6a55f78606864d91fe527696f9e32a724e6f9702b5f9602d0474

RUN pip install --disable-pip-version-check --no-cache-dir \
    multidict==3.3.2 \
    yarl==0.18.0 \
    async_timeout==1.4.0 \
    chardet==3.0.4 \
    idna==3.10

WORKDIR /src
COPY setup.py setup.cfg MANIFEST.in README.rst CHANGES.rst LICENSE.txt /src/
COPY aiohttp /src/aiohttp
RUN pip install --disable-pip-version-check --no-cache-dir --no-deps .

WORKDIR /app
COPY app.py /app/app.py
COPY static /app/static

EXPOSE 80
CMD ["python", "app.py"]
