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
from google.appengine.ext.webapp import template #also added

class MainHandler(webapp2.RequestHandler):
    def get(self):
        self.response.write('Hello world!')

class PhaserTutorialHandler(webapp2.RequestHandler):
    def get(self):
        #self.response.write('Phaer Tutorial')
        path = os.path.join(os.path.dirname(__file__), 'part1.html') 
        self.response.write(template.render(path, {'datetime': datetime.datetime.now().time()}))    

class PhaserGemmatchHandler(webapp2.RequestHandler):
    def get(self):
        path = os.path.join(os.path.dirname(__file__), 'gemmatch.html')
        self.response.write(template.render(path, {'datetime': datetime.datetime.now().time()}))

class KangHanByulMakerHandler(webapp2.RequestHandler):
    def get(self):
        path = os.path.join(os.path.dirname(__file__), 'slack_kanghanbyul.html')
        self.response.write(template.render(path, {}))

class DrawCallTestHandler(webapp2.RequestHandler):
    def get(self):
        sizeIndex = self.request.get('sizeIndex', default_value = "1")
        drawCount = self.request.get('drawCount', default_value = "0")
        autoPlayTimeOffset = self.request.get('autoPlayTimeOffset', default_value = "5000")
        autoPlayIncrAnimCount = self.request.get('autoPlayIncrAnimCount', default_value = "50")
        autoPlayStopCount = self.request.get('autoPlayStopCount', default_value = "1000")

        logging.warning("sizeIndex = " + sizeIndex)
        logging.warning("drawCount = " + drawCount)
        logging.warning("autoPlayTimeOffset = " + autoPlayTimeOffset)
        logging.warning("autoPlayIncrAnimCount = " + autoPlayIncrAnimCount)
        logging.warning("autoPlayStopCount = " + autoPlayStopCount)

        sizeDict = {"1" : (360, 640), "2" : (480, 854), "3" : (600, 1067), "4" : (720, 1280)}

        if sizeIndex not in sizeDict.keys():
            logging.warning("sizeIndex(" + sizeIndex + ") not in sizeDict")
            sizeIndex = "1"

        path = os.path.join(os.path.dirname(__file__), 'frame_test.html')
        self.response.write(template.render(path, {
            'width': sizeDict[sizeIndex][0]
            , 'height': sizeDict[sizeIndex][1]
            , 'drawCount': drawCount
            , 'autoPlayTimeOffset': autoPlayTimeOffset
            , 'autoPlayIncrAnimCount': autoPlayIncrAnimCount
            , 'autoPlayStopCount': autoPlayStopCount
        }))
        
app = webapp2.WSGIApplication([
    ('/', MainHandler), 
    ('/tutorial', PhaserTutorialHandler),
    ('/gemmatch', PhaserGemmatchHandler),
    ('/slack_kanghanbyul', KangHanByulMakerHandler),
    ('/frame-test', DrawCallTestHandler),
], debug=True)
