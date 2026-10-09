FROM debian:bookworm-slim@sha256:7c7b2c966bc9ee8cedfeef67e0e279108992c77681fa595db4a9d65c06ccc587

WORKDIR /usr/share/kibana
COPY . /usr/share/kibana/

EXPOSE 80
CMD ["./bin/kibana", "--server.host=0.0.0.0", "--server.port=80", "--elasticsearch.url=http://127.0.0.1:9200"]
