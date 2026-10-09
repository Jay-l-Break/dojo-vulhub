FROM python:3.6.15-slim-buster@sha256:e10aa83604948c6d8d9f72a9a20193d84bb2dbe550b725eb5208387117fde065

RUN python -m pip install --no-cache-dir 'salt==2018.3.0rc1' --no-deps \
    && python -m pip install --no-cache-dir \
       'Jinja2==2.11.3' 'MarkupSafe==2.0.1' 'msgpack-python==0.5.6' \
       'PyYAML==6.0.1' 'requests==2.27.1' 'tornado==4.5.3' \
       'pyzmq==25.1.2' 'pycryptodome==3.18.0'
COPY salt /usr/local/lib/python3.6/site-packages/salt
COPY gateway.py /usr/local/bin/gateway.py
COPY start.sh /usr/local/bin/start-saltstack.sh
RUN chmod 755 /usr/local/bin/start-saltstack.sh && mkdir -p /srv/salt
EXPOSE 80 4505 4506
CMD ["/usr/local/bin/start-saltstack.sh"]
