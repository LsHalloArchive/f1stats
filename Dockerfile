FROM python:3.8-alpine

RUN apk add --no-cache mariadb-connector-c-dev py3-mysqlclient libffi-dev libevent-dev; \
    apk add --no-cache --virtual .build-deps \
        build-base \
        mariadb-dev; \
    pip install mysqlclient

WORKDIR /app
COPY . /app

RUN pip3 install -r requirements.txt
RUN apk del .build-deps

CMD cd src/ && python3 -u main.py
