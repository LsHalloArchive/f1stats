# f1stats (Discontinued)
Due to recent reddit API changes the current active users cannot be queried accurately enough to make this project worthwhile.
That's why I've decided to discontinue it.

##### Provides user statistics for the f1 subreddit. (Including [r/Formula1Point5](https://reddit.com/r/formula1point5) and [r/F1FeederSeries](https://reddit.com/r/f1feederseries))
---
## View the statistics:
#### [----](#)
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

Additionally you will need to adjust the data url(s) in chartloader.js and compare.js to your own domain
