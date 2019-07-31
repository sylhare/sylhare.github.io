FROM ruby:2.5-alpine

WORKDIR /app
COPY ./ /app

RUN apk add --no-cache build-base gcc bash cmake git
RUN gem install jekyll
RUN gem install bundler
RUN bundle install

EXPOSE 4000

#ENTRYPOINT [ "bundle", "exec", "jekyll" ]

CMD ["bundle", "exec", "jekyll", "serve","--host", "0.0.0.0"]
