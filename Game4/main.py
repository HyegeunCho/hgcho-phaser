#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import webapp2
import os #added
import datetime
import logging
import json
from google.appengine.ext.webapp import template #also added
from google.appengine.ext import ndb
        

class UserInfo(ndb.Model):
    userId = ndb.StringProperty()
    name = ndb.StringProperty()
    topScore = ndb.IntegerProperty(default=0)
    date = ndb.DateTimeProperty(auto_now_add=True)

    def dump(self):
        return json.dumps({'id':self.userId, 'name':self.name, 'topScore':self.topScore, 'date':self.date.strftime("%Y-%m-%d %H:%M:%S")})

class AnipangHandler(webapp2.RequestHandler):
    def get(self):
        path = os.path.join(os.path.dirname(__file__), 'index.html')
        self.response.write(template.render(path, {}))        

class UserInitHandler(webapp2.RequestHandler):
    def get(self):
        self.response.write("stz-phaser-proto : UserInitHandler")

    def post(self):
        logging.info(self.request.body)
        data = json.loads(self.request.body)

        user = ndb.Key(UserInfo, data['id']).get()
        if user is None:
            user = UserInfo(id=data['id'], userId=data['id'], name=data['name'])
            user.put()
        self.response.headers.add_header("Access-Control-Allow-Origin", "*")
        self.response.out.write(user.dump())

class UpdateScoreHandler(webapp2.RequestHandler):
    def get(self):
        self.response.write("stz-phaser-proto : UpdateScoreHandler")

    def post(self):
        logging.info(self.request.body)
        data = json.loads(self.request.body)

        user = ndb.Key(UserInfo, data['id']).get()

        self.response.headers.add_header("Access-Control-Allow-Origin", "*")
        if user is None:
            self.response.out.write(json.dumps({'code':404, 'message':"no user data, please init"}))
        else:
            user.topScore = data['topScore']
            user.put()
            self.response.out.write(user.dump())


app = webapp2.WSGIApplication([
#    ('/', AnipangHandler),
    ('/init', UserInitHandler),
    ('/update/score', UpdateScoreHandler),
], debug=True)
