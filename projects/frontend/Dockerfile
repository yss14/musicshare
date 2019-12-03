# => Build container
FROM node:alpine as builder
WORKDIR /app

COPY . .

RUN apk add --no-cache make gcc g++ python && \
	npm install --silent && \
	apk del make gcc g++ python

ENV SKIP_PREFLIGHT_CHECK true

RUN npx lerna bootstrap --scope @musicshare/frontend --include-filtered-dependencies
RUN npx lerna run build --scope @musicshare/frontend --include-filtered-dependencies

RUN rm -r -f node_modules
RUN rm -r -f projects/frontend/node_modules

# => Run container
FROM nginx:1.15.2-alpine

# Add bash
RUN apk add --no-cache bash

# Nginx clear
RUN rm -r /usr/share/nginx/html/*
RUN rm -rf /etc/nginx/conf.d

# Static build
RUN mkdir app
COPY --from=builder /app/projects/frontend /app

WORKDIR /app

RUN cp -r build/* /usr/share/nginx/html/
RUN cp env.sh /usr/share/nginx/html/
RUN cp .env /usr/share/nginx/html/
RUN cp -r config/nginx /etc/nginx/conf.d

# Default port exposure
EXPOSE 80

# Initialize environment variables into filesystem
WORKDIR /usr/share/nginx/html

RUN ls

# Run script which initializes env vars to fs
RUN chmod +x env.sh
# RUN ./env.sh

# Start Nginx server
CMD ["/bin/bash", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]