FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# generate prisma client
FROM base AS generate
COPY --from=install /temp/dev/node_modules node_modules
COPY package.json prisma.config.ts ./
COPY prisma/ prisma/
RUN bun node_modules/.bin/prisma generate

# copy production dependencies and generated prisma client into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=generate /usr/src/app/generated generated
COPY package.json tsconfig.json prisma.config.ts ./
COPY prisma/ prisma/
COPY src/ src/

USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "src/index.ts" ]
