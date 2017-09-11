FROM node:6

ARG DDBTable

RUN npm install --production

RUN mkdir -p /data/app/msgproj
WORKDIR /data/app/msgproj
ADD . /data/app/msgproj

ENV PORT 80
EXPOSE 80

CMD ["node", "./server.js"]
