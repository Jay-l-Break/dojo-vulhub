FROM python:2.7-slim-jessie@sha256:969a97a1cae4f1796104ebee4c4ec6ecb6bc81120d03498d56feebd5820cba93
LABEL dojo.vulnerability="supervisor-001"
WORKDIR /app
COPY . /app
ENV PYTHONPATH=/app
RUN pip install --disable-pip-version-check --no-cache-dir 'meld3==0.6.10' \
    && python setup.py install
COPY supervisord.conf /etc/supervisord.conf
EXPOSE 80
CMD ["/usr/local/bin/supervisord", "-n", "-c", "/etc/supervisord.conf"]
