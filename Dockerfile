FROM node:16-bullseye-slim@sha256:503446c15c6236291222f8192513c2eb56a02a8949cbadf4fe78cce19815c734

WORKDIR /app
COPY app/package.json app/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY app/pages ./pages
RUN npm run build

ENV NODE_ENV=production
EXPOSE 80
CMD ["./node_modules/.bin/next", "start", "-p", "80"]
