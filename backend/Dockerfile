FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm run build && \
    ( [ -f dist/main.js ] || [ -f dist/src/main.js ] ) || \
    ( echo 'ERROR: build did not produce dist/main.js or dist/src/main.js'; ls -la dist || true; exit 1 )

RUN if [ -f dist/src/main.js ]; then \
        mkdir -p /tmpdist && mv dist /tmpdist && mkdir -p dist && \
        mv /tmpdist/dist/src/main.js dist/main.js && \
        find /tmpdist/dist -mindepth 1 -maxdepth 1 ! -name src -exec mv -t dist {} + ; \
    fi

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
RUN corepack enable && corepack prepare pnpm@9 --activate

COPY package.json pnpm-lock.yaml ./
COPY --from=deps  /app/node_modules ./node_modules
COPY --from=build /app/dist         ./dist

RUN pnpm prune --prod

USER node
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:8080/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "dist/main.js"]
