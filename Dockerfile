FROM sylhare/type-on-strap:v2.0.1

WORKDIR /app
COPY ./ /app

EXPOSE 4000

CMD ["bundle", "exec", "jekyll", "serve","--host", "0.0.0.0"]
