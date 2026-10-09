FROM node:12-stretch@sha256:01627afeb110b3054ba4a1405541ca095c8bfca1cb6f2be9479c767a2711879e

RUN printf 'deb http://archive.debian.org/debian stretch main\n' > /etc/apt/sources.list \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get -o Acquire::Check-Valid-Until=false update \
    && apt-get install -y --no-install-recommends \
      xvfb xauth libgconf-2-4 libgtk2.0-0 libgtk-3-0 libnss3 libasound2 \
      libxss1 libatk1.0-0 libx11-xcb1 libxcomposite1 libxcursor1 \
      libxdamage1 libxi6 libxtst6 libxrandr2 libgbm1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY main.js index.html start.sh ./
EXPOSE 80
CMD ["bash", "start.sh"]
