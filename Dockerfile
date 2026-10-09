FROM python:3.6-slim@sha256:2cfebc27956e6a55f78606864d91fe527696f9e32a724e6f9702b5f9602d0474

WORKDIR /app
RUN pip install --no-cache-dir pytz==2021.3
COPY app.py proof.py urls.py ./
COPY vendor ./vendor
ENV PYTHONPATH=/app/vendor
EXPOSE 80
CMD ["python", "app.py", "runserver", "0.0.0.0:80"]
