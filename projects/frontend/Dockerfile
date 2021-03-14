FROM nginx:1.15.2-alpine

# Add bash
RUN apk add --no-cache bash

# Nginx clear
RUN rm -r /usr/share/nginx/html/*
RUN rm -rf /etc/nginx/conf.d

# Static build
RUN mkdir app
COPY ./projects/frontend /app

WORKDIR /app

RUN cp -r build/* /usr/share/nginx/html/
RUN cp env.sh /usr/share/nginx/html/
#RUN cp config/prod.dummy.env /usr/share/nginx/html/.env
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