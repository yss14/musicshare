FROM node:current-buster-slim

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./ /usr/src/app/

RUN	npm install --silent

RUN npx lerna bootstrap --scope @musicshare/backend --include-dependencies
RUN npx lerna run build --scope @musicshare/backend --include-dependencies

ENV NODE_ENV production
EXPOSE 4000

CMD ["node", "projects/backend/build/index.js"]