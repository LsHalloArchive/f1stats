import time
import praw as praw
import pprint
import configparser
import requests
import MySQLdb

subreddit_names = ["formula1", "formula1point5", "f1feederseries"]


def send_to_mysql(host, username, password, database, users):
    mysql_db = MySQLdb.connect(host=host, user=username,
                               passwd=password, db=database, connect_timeout=5)
    cursor = mysql_db.cursor()
    sql = 'INSERT INTO f1stats (time, f1, f1_5, f1feeder) VALUES (%s, %s, %s, %s)'
    val = (time.time(), users[subreddit_names[0]], users[subreddit_names[1]], users[subreddit_names[2]])
    cursor.execute(sql, val)
    mysql_db.commit()
    mysql_db.close()


if __name__ == "__main__":
    config = configparser.ConfigParser()
    config.read("mysql.ini")
    pp = pprint.PrettyPrinter(indent=4)
    reddit = praw.Reddit('f1statbot', user_agent='windows:f1statbot:v0.0.1 (by /u/lshallo)')

    while True:
        time_pre = time.time()
        users = {}
        for name in subreddit_names:
            sub = reddit.subreddit(name)
            users[name] = sub.accounts_active

        lima = False
        ac = False
        remote = False
        webhost = False

        # Insert into remote db
        try:
            send_to_mysql(config['mysql.lima']['host'],
                          config['mysql.lima']['user'],
                          config['mysql.lima']['password'],
                          config['mysql.lima']['database'],
                          users)
            lima = True
        except Exception as exception:
            print(repr(exception))

        # Insert into remote backup db
        try:
            send_to_mysql(config['mysql.ac']['host'],
                          config['mysql.ac']['user'],
                          config['mysql.ac']['password'],
                          config['mysql.ac']['database'],
                          users)
            ac = True
        except Exception as exception:
            print(repr(exception))

        # Insert into remote backup backup db
        try:
            send_to_mysql(config['mysql.remote']['host'],
                          config['mysql.remote']['user'],
                          config['mysql.remote']['password'],
                          config['mysql.remote']['database'],
                          users)
            remote = True
        except Exception as exception:
            print(repr(exception))

        # Insert into remote backup backup backup db
        try:
            requests.post("https://f1status.000webhostapp.com/writeData.php",
                          data={
                              'time': time.time(),
                              'f1': users[subreddit_names[0]],
                              'f1_5': users[subreddit_names[1]],
                              'f1feeder': users[subreddit_names[2]],
                              'token': config['mysql.000']['token'],
                              'uid': config['mysql.000']['uid']
                          },
                          timeout=5)
            webhost = True
        except Exception as exception:
            print(repr(exception))

        time_post = time.time()
        run_time = time_post - time_pre

        print("F1: " + str(users[subreddit_names[0]]) + "  F1.5: " + str(
            users[subreddit_names[1]]) + "  F1Feeder: " + str(
            users[subreddit_names[2]]) + " | lima: {}; ac: {}; 000: {}; remote: {}; time: {}s".format(
            lima, ac, webhost, remote, run_time))

        run_time = run_time if run_time < 60 else 60
        time.sleep(60 - run_time)
