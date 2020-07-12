import requests
import os
import time
import praw as praw
import pprint
import configparser
import mysql.connector
import logging
import sys

from mysql.connector import errorcode

subreddit_names = ["formula1", "formula1point5", "f1feederseries"]


def create_database(host, username, password, db_name):
    logging.info("Database '{}' does not seem to exist. Trying to create database '{}'".format(db_name, db_name))
    try:
        cnx = mysql.connector.connect(user=username, password=password, host=host)
        cursor = cnx.cursor()
        cursor.execute("CREATE DATABASE {} DEFAULT CHARACTER SET 'utf8'".format(db_name))
        cnx.commit()
        cursor.close()
        cnx.close()
    except mysql.connector.Error as err:
        logging.error("Failed creating database: {}".format(err))
        exit(-1)
    else:
        cnx.close()


def create_table(host, username, password, database):
    table_name = 'f1stats'
    logging.info("Table '{}' does not seem to exist. Trying to create table '{}'".format(table_name, table_name))

    sql = '''
    CREATE TABLE `f1stats` (
      `id` bigint(20) UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
      `time` bigint(20) NOT NULL,
      `f1` int(10) UNSIGNED NOT NULL,
      `f1_5` int(10) UNSIGNED NOT NULL,
      `f1feeder` int(10) UNSIGNED NOT NULL,
      `f1_subs` int(10) UNSIGNED NOT NULL,
      `f1_5_subs` int(10) UNSIGNED NOT NULL,
      `f1feeder_subs` int(10) UNSIGNED NOT NULL
    );
    '''

    try:
        cnx = mysql.connector.connect(user=username, password=password, host=host, database=database)
        cursor = cnx.cursor()
        cursor.execute(sql)
        cnx.commit()
        cursor.close()
        cnx.close()
    except mysql.connector.Error as err:
        logging.error("Table creation failed! Please check your setup and try again!")
        logging.error(repr(err))
        exit(-1)


def send_to_mysql(host, username, password, database, users, users_total):
    unsuccessful = True
    while unsuccessful:
        logging.debug("Inserting data into '{}'".format(host))
        try:
            cnx = mysql.connector.connect(user=username, password=password, host=host, database=database)
            cursor = cnx.cursor()
            sql = 'INSERT INTO f1stats (time, f1, f1_5, f1feeder, f1_subs, f1_5_subs, f1feeder_subs) VALUES (%s, %s, %s, %s, %s, %s, %s)'
            val = (time.time(), users[subreddit_names[0]], users[subreddit_names[1]], users[subreddit_names[2]],
                   users_total[subreddit_names[0]], users_total[subreddit_names[1]], users_total[subreddit_names[2]])
            cursor.execute(sql, val)
            cnx.commit()
            cursor.close()
            cnx.close()
            unsuccessful = False
        except mysql.connector.Error as err:
            if err.errno == errorcode.ER_BAD_DB_ERROR:
                create_database(host, username, password, database)
            elif err.errno == errorcode.ER_BAD_TABLE_ERROR or err.errno == errorcode.ER_NO_SUCH_TABLE:
                create_table(host, username, password, database)
            else:
                logging.error('Unknown error in creating database. Please check your setup')
                logging.error(err)
                exit(-1)
        else:
            cnx.close()


if __name__ == "__main__":
    if os.getenv('debug', None) is not None:
        level = logging.DEBUG
        frmt = "[%(asctime)s] [%(levelname)s]: %(message)s [%(funcName)s]"
    else:
        level = logging.INFO
        frmt = "[%(asctime)s] [%(levelname)s]: %(message)s"
    logging.basicConfig(stream=sys.stdout, level=level, format=frmt, datefmt="%H:%M:%S")
    logging.debug("DEBUG MODE ENABLED!")

    paths = ['config', '../config', '../../config', '/app/config']
    for p in paths:
        if os.path.isdir(p):
            os.chdir(p)

    logging.debug(os.path.abspath('.'))
    for file in os.listdir():
        logging.debug(file)

    config = configparser.ConfigParser()
    config.read(["mysql.ini", "../mysql.ini", "../config/mysql.ini"])
    pp = pprint.PrettyPrinter(indent=4)
    reddit = praw.Reddit('f1stats')
    logging.debug('PRAW config:\n\tusername: {usr}\n\tpw: {pw}\n\tclient_id: {cid}\n\tclient_token: {ct}\n\tuser_agent: {ua}'.format(usr=reddit.config.username,
                                                                                                                                     pw=reddit.config.password,
                                                                                                                                     cid=reddit.config.client_id,
                                                                                                                                     ct=reddit.config.client_secret,
                                                                                                                                     ua=reddit.config.user_agent))

    logging.info('Reddit stats started. If you see no output right away everything is working properly!\nThere should be at least one status message every 15min.')
    rf1_subs = 0
    run = 0
    while True:
        run += 1
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
                    logging.error(repr(exception))

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
                    logging.error(repr(exception))

        time_post = time.time()
        run_time = time_post - time_pre

        if not all(v is True for v in success.values()) or run % 3 == 0:
            run = 0
            logging.info("{} | {} | time: {}s".format(users, success, run_time))
        else:
            logging.debug("{} | {} | time: {}s".format(users, success, run_time))

        try:
            if 'hc' in config.sections():
                requests.post(config['hc']['hc-url'], timeout=10)
        except Exception as e:
            logging.error(repr(e))

        run_time = run_time if run_time < 60 else 60
        if int(users[subreddit_names[0]]) > rf1_subs * 0.02:
            time.sleep(60 - run_time)
        else:
            time.sleep(300 - run_time)
