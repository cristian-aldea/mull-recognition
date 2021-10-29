FROM nginx:stable-alpine

COPY dist/ /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/nginx.conf
