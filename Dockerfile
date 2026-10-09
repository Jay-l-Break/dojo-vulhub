FROM python:2.7@sha256:cfa62318c459b1fde9e0841c619906d15ada5910d625176e24bf692cf8a2601d AS builder

RUN pip install --no-cache-dir \
    'setuptools==44.1.0' \
    'Scrapy==0.10.4.2364' \
    'Twisted==17.9.0' \
    'zope.interface==4.6.0' \
    'incremental==16.10.1' \
    'Automat==0.6.0' \
    'attrs==21.4.0' \
    'constantly==15.1.0' \
    'hyperlink==21.0.0' \
    'idna==2.10' \
    'typing==3.7.4.1' \
    'six==1.14.0'

FROM python:2.7-slim@sha256:6c1ffdff499e29ea663e6e67c9b6b9a3b401d554d2c9f061f9a45344e3992363

COPY --from=builder /usr/local/lib/python2.7/site-packages/ /usr/local/lib/python2.7/site-packages/
COPY scrapyd /opt/scrapyd-source/scrapyd
COPY scrapyd.conf /opt/scrapyd/scrapyd.conf
ENV PYTHONPATH=/opt/scrapyd-source
WORKDIR /opt/scrapyd
RUN mkdir -p eggs logs dbs
EXPOSE 80
CMD ["python", "-c", "from scrapyd.app import application; from twisted.application.service import IService; from twisted.internet import reactor; app=application(); IService(app).startService(); reactor.run()"]
