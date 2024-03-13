FROM node:18-alpine AS external-website

LABEL Developers="Shawn Wakeman"


WORKDIR /app


COPY . .


RUN npm ci

RUN npm run build

RUN rm -rf src/ static/ emailTemplates/ docker-compose.yml

USER node:node

CMD ["node","build/index.js"]