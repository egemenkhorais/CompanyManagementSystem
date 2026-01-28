# Temel imajı Node 22 yaptık
FROM node:22-alpine

# Bcrypt için gerekli araçlar
RUN apk add --no-cache python3 make g++

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]