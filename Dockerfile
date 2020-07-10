FROM python:3.8-alpine

WORKDIR /app
COPY . /app


RUN apk add --update --no-cache mariadb-connector-c-dev \
	&& apk add --no-cache --virtual .build-deps \
		mariadb-dev \
		gcc \
		musl-dev \
	&& pip install -r requirements.txt \
	&& apk del .build-deps

CMD cd src/ && python -u main.py
