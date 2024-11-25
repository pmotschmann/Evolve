# Global ARGs
ARG BUILDER_IMAGE=node:16.20
ARG NGINX_IMAGE=nginx:1.26.1-alpine
ARG WORKSPACE=/workspace
ARG WEB_PATH=/usr/share/nginx/html

# Builder
FROM $BUILDER_IMAGE as builder
ARG WORKSPACE

WORKDIR $WORKSPACE
COPY ./ $WORKSPACE/
RUN npm install \
    && npm run build \
    && rm -rf dist \
    && mkdir dist \
    && cp -r *.html *.ico LICENSE evolve lib font strings wiki dist

# Web server
FROM $NGINX_IMAGE
ARG WORKSPACE
ARG WEB_PATH

COPY --from=builder $WORKSPACE/dist $WEB_PATH
