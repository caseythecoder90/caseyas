# Build context: repository root.  docker build -f docker/frontend.Dockerfile .
FROM node:24-alpine AS build
WORKDIR /ui
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

FROM nginx:1.27-alpine
# The entrypoint renders /etc/nginx/templates/*.template into /etc/nginx/conf.d
RUN rm /etc/nginx/conf.d/default.conf
COPY docker/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /ui/dist /usr/share/nginx/html
ENV AUTH_HOST=auth.caseylovesyas.com
ENV MEDIA_HOST=media.invalid
EXPOSE 80
