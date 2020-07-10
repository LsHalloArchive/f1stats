FROM python:3.8-alpine

RUN apk add --no-cache py3-mysqlclient py3-mysqldb py3-pymysql

WORKDIR /app
COPY . /app


#RUN apk add --update --no-cache mariadb-connector-c-dev \
	#&& apk add --no-cache --virtual .build-deps \
	#	mariadb-dev \
	#	gcc \
	#	musl-dev \
	#&& pip install -r requirements.txt \
	#&& apk del .build-deps

RUN pip3 install -r requirements.txt

CMD cd src/ && python3 -u main.py
