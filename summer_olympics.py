from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json
import os

app = Flask(__name__)

#MONGODB_HOST = 'localhost'
#MONGODB_PORT = 27017
MONGODB_URI = os.getenv("MONGODB_URI")

#DBS_NAME = 'summerolympics'
DBS_NAME =  os.getenv('MONGO_DB_NAME','summerolympics')

#COLLECTION_NAME = 'summer'
COLLECTION_NAME = os.getenv('MONGO_COLLECTION_NAME','projects')

FIELDS = {'Year': True, 'Country': True, 'Gender': True, 'Sport': True,
          'Medal': True,'_id': False}

@app.route("/")
def index():
   return render_template("index.html")

@app.route("/olympics/summer")
def olympics_summer():
    #connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    connection = MongoClient(MONGODB_URI)
    collection = connection[DBS_NAME][COLLECTION_NAME]
    summer = collection.find(projection=FIELDS)
    json_projects = []
    for project in summer:
        json_projects.append(project)
    json_projects = json.dumps(json_projects)
    connection.close()
    return json_projects


if __name__ == "__main__":
    app.run(debug=True)

