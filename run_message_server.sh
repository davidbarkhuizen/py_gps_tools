#!/bin/bash 

# $ crontab -e
# * * * * * /var/www/gpxmapsnet/run_message_server.sh

cd /var/www/gpxmapsnet/
python run_message_server.py

