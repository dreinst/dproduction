# Image produksi D'Production untuk app Coolify dproduction di VPS.
#
# Env build (build arg). Nilainya ikut tertanam di bundle browser, jadi hanya boleh berisi data publik:
#   NEXT_PUBLIC_SITE_URL (bawaan https://www.dpro.events), NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
#   NEXT_PUBLIC_GOOGLE_ADS_ID, NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL, NEXT_PUBLIC_GOOGLE_ADS_WA_CONVERSION_LABEL.
# Env runtime (rahasia, di Coolify jangan dicentang sebagai build variable):
#   DATABASE_URL dan JWT_SECRET (minimal 32 karakter). Keduanya tidak pernah menjadi ARG atau ENV di file ini.
# Volume: pasang volume persisten ke /app/uploads. Isinya gambar unggahan admin dan ikut backup harian ke NAS.
# Saat container start, prisma migrate deploy jalan dulu, baru next start. Kalau migrasi gagal, next tidak dijalankan.

FROM node:24-slim AS base
# Schema engine Prisma (dipakai migrate deploy) butuh libssl, yang tidak ada di image slim.
# Healthcheck Coolify menjalankan curl atau wget di dalam container, keduanya juga tidak ada di image slim.
RUN apt-get update && apt-get install -y --no-install-recommends openssl curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_SITE_URL=https://www.dpro.events
ARG NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
ARG NEXT_PUBLIC_GOOGLE_ADS_ID
ARG NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL
ARG NEXT_PUBLIC_GOOGLE_ADS_WA_CONVERSION_LABEL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=$NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION \
    NEXT_PUBLIC_GOOGLE_ADS_ID=$NEXT_PUBLIC_GOOGLE_ADS_ID \
    NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL=$NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL \
    NEXT_PUBLIC_GOOGLE_ADS_WA_CONVERSION_LABEL=$NEXT_PUBLIC_GOOGLE_ADS_WA_CONVERSION_LABEL \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build && npm prune --omit=dev --no-audit --no-fund

FROM base AS runtime
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    UPLOAD_DIR=/app/uploads
# next.config.ts tetap disalin karena sebagian opsi (misalnya poweredByHeader) dibaca lagi saat next start.
COPY --from=build --chown=node:node /app/package.json /app/prisma.config.ts /app/next.config.ts ./
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/node_modules ./node_modules
RUN mkdir /app/uploads && chown node:node /app/uploads
USER node
EXPOSE 3000
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && exec node_modules/.bin/next start -H 0.0.0.0 -p 3000"]
