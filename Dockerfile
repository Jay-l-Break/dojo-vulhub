FROM node:12-buster-slim
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --production --no-audit --no-fund
COPY . ./
ENV VCAP_APP_PORT=80
EXPOSE 80
CMD ["node", "app.js"]
