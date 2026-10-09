FROM node:12-alpine@sha256:d4b15b3d48f42059a15bd659be60afe21762aae9d6cbea6f124440895c27db68

WORKDIR /app
COPY packages/server/ /app/
COPY runtime/server-yarn.lock /app/yarn.lock
RUN yarn install --frozen-lockfile --ignore-engines --ignore-scripts --production=false --non-interactive \
    && node node_modules/electron/install.js \
    && yarn cache clean

ENV PORT=80 NODE_ENV=production BUDIBASE_ENVIRONMENT=PRODUCTION CLOUD=
EXPOSE 80
CMD ["node", "src/index.js"]
