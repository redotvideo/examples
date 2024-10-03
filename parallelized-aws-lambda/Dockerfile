   FROM docker.io/revideo/aws-lambda-base-image:latest
   
   COPY ./revideo-project/ ./

   RUN npm install

   RUN node node_modules/puppeteer/install.mjs

   RUN npx tsc && cp dist/lambda.js ./

   ENV ROLLUP_CACHE=/tmp/rollup_cache

   ENV FFMPEG_PATH=/var/task/node_modules/@ffmpeg-installer/linux-x64/ffmpeg

   ENV HOME=/tmp

   ENV DONT_WRITE_TO_META_FILES=true

   CMD ["lambda.handler"]