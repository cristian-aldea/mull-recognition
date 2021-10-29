FROM node:16 as build

COPY ./ /mull-recognition

WORKDIR /mull-recognition

RUN npm ci
RUN npm run build-prod

FROM nginx:stable-alpine

COPY --from=build /mull-recognition/dist/ /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/nginx.conf
