FROM mongo:4.0@sha256:4ca81c89ad08f4cfa9906005126112bffe8fb363800466ef5e50f6238f6f6af1 AS mongo

FROM rocketchat/rocket.chat@sha256:e67d37e623235cd7dd098717e8a988a103e1402d9f6272a53bf13e65b6ac9cb5

USER root
RUN sed -i 's|deb.debian.org/debian|archive.debian.org/debian|g;s|security.debian.org/debian-security|archive.debian.org/debian-security|g;/buster-updates/d' /etc/apt/sources.list \
    && apt-get -o Acquire::Check-Valid-Until=false update -qq \
    && apt-get install -y -qq --no-install-recommends libcurl4 libssl1.1 libldap-2.4-2 \
    && rm -rf /var/lib/apt/lists/*
COPY --from=mongo /usr/bin/mongod /usr/local/bin/mongod
COPY --from=mongo /usr/bin/mongo /usr/local/bin/mongo
COPY --from=mongo /lib/x86_64-linux-gnu/libcrypto.so.1.0.0 /opt/mongo/lib/libcrypto.so.1.0.0
COPY --from=mongo /lib/x86_64-linux-gnu/libssl.so.1.0.0 /opt/mongo/lib/libssl.so.1.0.0
COPY --from=mongo /usr/lib/x86_64-linux-gnu/libcurl.so.4.4.0 /opt/mongo/lib/libcurl.so.4
COPY --from=mongo /usr/lib/x86_64-linux-gnu/libidn.so.11.6.15 /opt/mongo/lib/libidn.so.11
WORKDIR /app/bundle
COPY bridge.js start.sh ./
COPY seed_public/user.json ./seed_public/user.json
RUN chmod 755 start.sh
EXPOSE 80
CMD ["bash", "start.sh"]
