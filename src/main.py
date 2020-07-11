import requests
import os
import time
import praw as praw
import pprint
import configparser
import MySQLdb
from datetime import datetime
import logging
import sys


subreddit_names = ["formula1", "formula1point5", "f1feederseries"]


def send_to_mysql(host, username, password, database, users, users_total):
    mysql_db = MySQLdb.connect(host=host, user=username, passwd=password, db=database, connect_timeout=5)
    cursor = mysql_db.cursor()
    sql = 'INSERT INTO f1stats (time, f1, f1_5, f1feeder, f1_subs, f1_5_subs, f1feeder_subs) VALUES (%s, %s, %s, %s, %s, %s, %s)'
    val = (time.time(), users[subreddit_names[0]], users[subreddit_names[1]], users[subreddit_names[2]], users_total[subreddit_names[0]], users_total[subreddit_names[1]], users_total[subreddit_names[2]])
    cursor.execute(sql, val)
    mysql_db.commit()
    mysql_db.close()


if __name__ == "__main__":
    paths = ['config', '../config', '../../config', '/app/config']
    for p in paths:
        if os.path.isdir(p):
            os.chdir(p)

    print(os.path.abspath('.'))
    for file in os.listdir():
        print(file)

    if os.getenv('debug', None) is not None:
        level = logging.DEBUG
        frmt = "[%(asctime)s] [%(levelname)s]: %(message)s [%(funcName)s]"
    else:
        level = logging.INFO
        frmt = "[%(asctime)s] [%(levelname)s]: %(message)s"
    logging.basicConfig(stream=sys.stdout, level=level, format=frmt, datefmt="%H:%M:%S")
    logging.debug("DEBUG MODE ENABLED!")

    config = configparser.ConfigParser()
    config.read(["mysql.ini", "../mysql.ini", "../config/mysql.ini"])
    pp = pprint.PrettyPrinter(indent=4)
    reddit = praw.Reddit('f1statbot', user_agent='windows:f1statbot:v0.0.1 (by /u/lshallo)')

    rf1_subs = 0
    while True:
        time_pre = time.time()
        users = {}
        users_total = {}
        for name in subreddit_names:
            sub = reddit.subreddit(name)
            users[name] = sub.accounts_active
            users_total[name] = sub.subscribers

        rf1_subs = users_total[subreddit_names[0]]

        success = {}
        act_time = time.time()

        for section in config.sections():
            if section.startswith('mysql'):
                try:
                    send_to_mysql(config[section]['host'],
                                  config[section]['user'],
                                  config[section]['password'],
                                  config[section]['database'],
                                  users, users_total)
                    success[section] = True
                except Exception as exception:
                    success[section] = False
                    print(repr(exception))

            if section.startswith('http'):
                try:
                    resp = requests.post(config[section]['url'],
                                         data={
                                             'time': act_time,
                                             'f1': users[subreddit_names[0]],
                                             'f1_5': users[subreddit_names[1]],
                                             'f1feeder': users[subreddit_names[2]],
                                             'f1_subs': users_total[subreddit_names[0]],
                                             'f1_5_subs': users_total[subreddit_names[1]],
                                             'f1feeder_subs': users_total[subreddit_names[2]],
                                             'token': config[section]['token'],
                                             'uid': config[section]['uid']
                                         },
                                         timeout=10)
                    if resp.status_code == 200 and 'ok' in resp.text.lower():
                        success[section] = True
                except Exception as exception:
                    success[section] = False
                    print(repr(exception))

        time_post = time.time()
        run_time = time_post - time_pre

        if not all(v is True for v in success.values()) or datetime.now().minute % 15 == 0:
            logging.info("{} | {} | time: {}s".format(users, success, run_time))
        else:
            logging.debug("{} | {} | time: {}s".format(users, success, run_time))

        try:
            requests.post(config['hc']['hc-url'], timeout=10)
        except Exception as e:
            print(repr(e))

        run_time = run_time if run_time < 60 else 60
        if int(users[subreddit_names[0]]) > rf1_subs * 0.02:
            time.sleep(60 - run_time)
        else:
            time.sleep(300 - run_time)
