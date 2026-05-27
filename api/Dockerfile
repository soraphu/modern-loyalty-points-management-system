FROM node:20-alpine AS base

WORKDIR /deepoints/api

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 3000

RUN ["npm", "run", "build"]

RUN ["npx", "prisma", "generate"]

CMD ["npm", "run", "start"]