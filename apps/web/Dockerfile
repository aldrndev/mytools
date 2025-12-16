FROM node:20-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY . .

RUN pnpm install

EXPOSE 5173

# Run in dev mode, exposed to host
CMD ["pnpm", "--filter", "@pdf-editor/web", "dev", "--host"]
