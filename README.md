# f1stats [![Netlify Status](https://api.netlify.com/api/v1/badges/7c14b8c4-7a4a-4b6a-b9c5-72872cfb5592/deploy-status)](https://app.netlify.com/sites/formula1stats/deploys) ![Data Gatherer](https://hc.lshallo.eu/badge/5f3352a1-fde9-4116-af2d-0c3248da52a1/8Gw1KNKQ/data-gatherer.svg) ![Build Status](https://jenkins.lshallo.eu/buildStatus/icon?job=reddit-stats)
##### Provides user statistics for the f1 subreddit. (Including [r/Formula1Point5](https://reddit.com/r/formula1point5) and [r/F1FeederSeries](https://reddit.com/r/f1feederseries))
---
## View the statistics:
#### [https://lshallo.github.io/f1stats/](https://lshallo.github.io/f1stats/)
---
I've created this project based on this reddit [post](https://www.reddit.com/r/formula1/comments/d1s3lj/rformula1_active_user_count_during_the_italian/)  
This project logs the active users once every minute using the reddit api at [https://reddit.com/r/formula1/about.json](https://reddit.com/r/formula1/about.json)

Enjoy!

If you have any suggestions create an issue or write me on reddit. I'm [u/lshallo](https://www.reddit.com/user/lshallo)

## Running your own version
Easy version with docker-compose:  

**docker-compose.yml**
```yaml
version: '3'
services:
  reddit-stats:
    build: .
    restart: unless-stopped
    volumes:
      - /opt/f1stats/config:/app/config # adjust path
    # environment: # optional; uncomment for more verbose output
    #  - debug: True

  mysql:
    image: mariadb
    restart: unless-stopped
    environment:
      - MYSQL_ROOT_PASSWORD: example # change me
```

**/opt/f1stats/config/mysql.ini**
```ini
# you can use mysql hosts or write directly to http (to not expose an external mysql instance)
# needs to begin with mysql.[something]
[mysql.friendlyname]
host=mysql
password=seeAbove
user=root # not recommended
database=f1stats # create manually

# alternatively you can write to a php script which will enter the data into the database
# must begin with http.[something]
[http.friendlyname]
url=http://mydomain.com/writeData.php # see external for writeData.php | include protocol (http)
uid=randomcharacters # change to your liking
token=randomcharacters # change to your liking
```

**/opt/f1stats/config/praw.ini**
```ini
# how to generate reddit oauth: https://praw.readthedocs.io/en/v7.1.0/getting_started/quick_start.html
[f1stats]
client_id=yourclientid
client_secret=yourclientsecret
password=redditpassword123
username=redditusernamewow
user_agent=your_reddit_guideline_appropriate_user_agent
```