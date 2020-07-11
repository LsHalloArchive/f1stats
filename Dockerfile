FROM python:3.8-alpine

WORKDIR /app
COPY . /app

RUN pip3 install -r requirements.txt

CMD cd src/ && python3 -u main.py
