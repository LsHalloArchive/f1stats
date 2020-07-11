### Scripts to get and write data from or to a database (mariadb, mysql)
**writeData.php** is used to write data to a (local) database is you don't have access directly to the db (e.g. a free hoster)  
**getData.php** is used by the javascript on the client to retrieve the data from your database  

#### you need to create a file ``credentials.ini`` to enable both ``writeData.php`` and ``getData.php``
**!!! IMPORTANT: copy .htaccess or ensure otherwise that credentials.ini is not accessible on the webserver!!!**
**credentials.ini**
```ini
host=localhost # likely
user=USER382861 # username for database
password=superduperpassword123 # password for database; avoid ini breaking chars!
database=dn_name_123 # database name (will be create if not existent; check user for appropriate permissions)#
uid=some_random_string_match_with_mysql.ini # only needed if writeData.php is used
token=some_random_string_match_with_mysql.ini # only needed if writeData.php is used
```
**!!! IMPORTANT: copy .htaccess or ensure otherwise that credentials.ini is not accessible on the webserver!!!**
