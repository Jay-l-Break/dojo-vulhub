FROM python:3.10-slim-bookworm

RUN pip install --no-cache-dir \
    "huggingface-hub==0.20.3" \
    "fastapi==0.104.1" \
    "pydantic==2.4.2" \
    "starlette==0.27.0" \
    "jinja2==3.1.2" \
    "anyio<4" \
    "gradio==4.0.0"

WORKDIR /app
COPY gradio /app/gradio
COPY app.py /app/app.py

EXPOSE 80
CMD ["python", "app.py"]
