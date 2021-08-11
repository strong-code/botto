FROM alpine

RUN apk add --update nodejs npm

WORKDIR /botto

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 6697/tcp
EXPOSE 5432/tcp

ENV DB_HOST=172.17.0.1

CMD ["node" "botto.js"] 
