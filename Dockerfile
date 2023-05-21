FROM node:18.15-alpine3.17 As build

RUN wget -qO /bin/pnpm "https://github.com/pnpm/pnpm/releases/download/v8.0.0/pnpm-linuxstatic-x64" &&  \
    chmod +x /bin/pnpm &&  \
    apk add --update --no-cache openssl1.1-compat
WORKDIR /usr/src/app
COPY --chown=node:node package.json pnpm-lock.yaml .npmrc ./
RUN npm config set -- '//gitlab.sello.uz/api/v4/projects/114/packages/npm/:_authToken' "_TOKEN_"
RUN pnpm install --frozen-lockfile
COPY --chown=node:node . .
RUN npx prisma generate
RUN pnpm build
RUN pnpm prune --prod

FROM node:18.15-alpine3.17 As production
ARG SENTRY_ENVIRONMENT=production
ENV APP_RELEASE_TAG=_APP_RELEASE_TAG_
ENV SENTRY_ENVIRONMENT=${SENTRY_ENVIRONMENT}
ENV TZ='Etc/Universal'
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
HEALTHCHECK --interval=30s --timeout=10s --retries=5 \
    CMD curl --fail --silent -X GET http://localhost:3000/health/check || exit 1
EXPOSE 3000
CMD ["node", "dist/main.js"]