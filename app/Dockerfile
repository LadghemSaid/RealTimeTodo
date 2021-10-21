# build environment
FROM node:14-alpine as build
WORKDIR /
ENV PATH /node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --silent
COPY . ./
EXPOSE 80

RUN npm run build

# production environment
FROM nginx:stable-alpine
COPY --from=build . /usr/share/nginx/html
# new
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf
RUN ["nginx", "-g", "daemon off;"]
CMD ["node", "server.js"]