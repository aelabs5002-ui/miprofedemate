FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json ./
COPY package-lock.json* ./
COPY pnpm-lock.yaml* ./
COPY yarn.lock* ./

RUN rm -rf node_modules
RUN rm -rf dist
RUN rm -rf .vite
RUN npm install

COPY . .

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN rm -rf dist
RUN npm run build
RUN node -e "const fs=require('fs'); const id=new Date().toISOString(); fs.writeFileSync('dist/build.txt', 'BUILD_ID=' + id + '\nBUILD_SOURCE=docker\n'); let html = fs.readFileSync('dist/index.html', 'utf8'); html = html.replace('</head>', '<!-- BUILD_ID: ' + id + ' --></head>'); fs.writeFileSync('dist/index.html', html);"
RUN ls -la dist

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
