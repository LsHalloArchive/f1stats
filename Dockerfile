FROM python:3.7-alpine

COPY . /app

WORKDIR /app

RUN apk add --update --no-cache mariadb-connector-c-dev \
	&& apk add --no-cache --virtual .build-deps \
		mariadb-dev \
		gcc \
		musl-dev \
	&& pip install -r requirements.txt \
	&& apk del .build-deps

CMD python -u src/main.py
