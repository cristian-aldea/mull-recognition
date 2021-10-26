FROM node:16 as build

COPY ./ /mull-recognition

WORKDIR /mull-recognition

RUN npm ci
RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /mull-recognition/dist/ /usr/share/nginx/html

COPY docker/mull-recognition/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
