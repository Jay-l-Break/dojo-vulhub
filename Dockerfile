FROM node:8.5.0

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --production
COPY app.js ./
COPY static ./static

EXPOSE 80
CMD ["npm", "start"]
