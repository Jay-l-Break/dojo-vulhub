FROM node:9.0.0

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --production
COPY app.js ./

EXPOSE 80
CMD ["npm", "start"]
