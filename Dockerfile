FROM sylhare/jekyll:latest

WORKDIR /app
COPY ./ /app

RUN bundle install

EXPOSE 4000

#ENTRYPOINT [ "bundle", "exec", "jekyll" ]

CMD ["bundle", "exec", "jekyll", "serve","--host", "0.0.0.0"]
