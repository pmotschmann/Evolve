FROM --platform=$BUILDPLATFORM node:20-alpine as builder

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

FROM nginx:1.27.1-alpine3.20-slim

COPY --from=builder /app/lib/ /usr/share/nginx/html/lib/
COPY --from=builder /app/font/ /usr/share/nginx/html/font/
COPY --from=builder /app/evolved.ico /app/evolved-light.ico /usr/share/nginx/html/
COPY --from=builder /app/index.html /app/save.html /app/wiki.html /usr/share/nginx/html/
COPY --from=builder /app/strings/ /usr/share/nginx/html/strings/
COPY --from=builder /app/evolve/ /usr/share/nginx/html/evolve/

