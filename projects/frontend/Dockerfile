FROM nginx:1.15.2-alpine

# Add bash
RUN apk add --no-cache bash

# Nginx clear
RUN rm -r /usr/share/nginx/html/*
RUN rm -rf /etc/nginx/conf.d

COPY projects/frontend/build/  /usr/share/nginx/html/
COPY projects/frontend/env.sh /usr/share/nginx/html/
COPY projects/frontend/config/nginx /etc/nginx/conf.d

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