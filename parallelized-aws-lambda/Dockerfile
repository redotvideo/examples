   FROM docker.io/revideo/aws-lambda-base-image:latest

   ENV ROLLUP_CACHE=/tmp/rollup_cache \
       FFMPEG_PATH=/var/task/node_modules/@ffmpeg-installer/linux-x64/ffmpeg \
       HOME=/tmp \
       DONT_WRITE_TO_META_FILES=true

   COPY ./revideo-project/package*.json ./

   RUN npm install

   RUN node node_modules/puppeteer/install.mjs

   COPY ./revideo-project/ ./

   RUN npx tsc && cp -r dist/* ./

   CMD ["lambda.handler"]
