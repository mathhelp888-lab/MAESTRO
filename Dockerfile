FROM node:lts-bullseye-slim

EXPOSE 9002

ENV LLM_PROVIDER="ollama"

WORKDIR /app

# Copy project files
COPY . .

# Install production + dev deps so genkit and tsc are available
RUN npm install

# Start genkit in background and then exec the Next dev server in the foreground.
# Using sh -lc lets us background genkit and use exec so PID 1 is the Next process.
ENTRYPOINT ["sh", "-lc", "npm run genkit:dev & exec npm run dev"]