FROM node:18-bullseye

RUN apt-get update && apt-get install -y \
    nscd \
    libnss3 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libatspi2.0-0 

RUN apt-get install -y libxfixes3

WORKDIR /usr/src/app

RUN wget https://github.com/eugeneware/ffmpeg-static/releases/download/b6.0/ffmpeg-linux-x64

RUN chmod +x ffmpeg-linux-x64

RUN mv ffmpeg-linux-x64 ffmpeg

RUN mv ffmpeg /usr/local/bin/

ENV FFMPEG_PATH=ffmpeg

RUN wget https://github.com/eugeneware/ffmpeg-static/releases/download/b6.0/ffprobe-linux-x64

RUN chmod +x ffprobe-linux-x64

RUN mv ffprobe-linux-x64 ffprobe

RUN mv ffprobe /usr/local/bin/

ENV FFPROBE_PATH=ffprobe

COPY package*.json ./

COPY . ./

RUN npm install

RUN npx puppeteer browsers install chrome

RUN apt-get update && apt-get install -y nscd libnss3

RUN ffmpeg -version

CMD service nscd start && npm run serve