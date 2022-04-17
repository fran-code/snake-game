FROM node:alpine
WORKDIR '/app'
COPY package.json ./
COPY tsconfig.json ./
COPY config-overrides.js ./
RUN npm install
COPY . .
CMD ["npm", "start"]