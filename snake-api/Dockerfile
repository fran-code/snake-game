# Usually to select particular version instead of latest
FROM node:12.9.0 as base
WORKDIR '/app'
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3003 3004
CMD ["npm", "run", "start-docker"]