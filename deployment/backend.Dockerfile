FROM docker.elastic.co/kibana/kibana:6.7.0@sha256:84718c5dfaad5cd8949f2c8129d033730218f7af4f3ffd15acdb2e84b523caab

COPY --chmod=755 entrypoint.sh /usr/local/bin/kibana003-entrypoint

CMD ["/usr/local/bin/kibana003-entrypoint"]
