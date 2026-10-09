FROM python:3.12-alpine

RUN apk add --no-cache chromium
COPY server.py /victim/server.py
EXPOSE 9222
CMD ["python", "/victim/server.py"]
