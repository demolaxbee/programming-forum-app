FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

RUN mkdir -p /app/uploads

CMD ["npm", "run", "dev"] 