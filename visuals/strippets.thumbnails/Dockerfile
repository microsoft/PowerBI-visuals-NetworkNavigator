FROM uncharted/stories-components:latest

# Set phantomjs bin location to be picked up by karma-phantomjs-launcher plugin
ENV PHANTOMJS_BIN /usr/bin/phantomjs

WORKDIR /app

ADD package.json .npmrc /dependencies/

RUN cd /dependencies && npm install -q

CMD ./thumbnails.sh --ci -b