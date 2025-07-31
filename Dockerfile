FROM alpine

RUN apk add --update nodejs npm

WORKDIR /botto

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 6697/tcp
EXPOSE 5432/tcp

CMD ["node", "botto.js"] 
