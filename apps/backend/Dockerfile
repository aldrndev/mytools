FROM node:20-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy all files (respecting .dockerignore)
COPY . .

# Install dependencies
RUN pnpm install

EXPOSE 3001

# Run in dev mode
CMD ["pnpm", "--filter", "@pdf-editor/backend", "dev"]
