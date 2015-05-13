import xml.etree.ElementTree as ET

class X(object):

    def __init__(self, xml_string):

        self.xml_string = xml_string

        self.root = ET.fromstring(xml_string)

        self.root_tag_text = str(self.root)
        self.ns = self.root_tag_text[self.root_tag_text.find('{') : self.root_tag_text.find('}') + 1]

        self.token = '/'

    def to_xpath(self, path):
        xpath = ''        
        for p in path.split(self.token):
            xpath = xpath + self.token + self.ns + p        
        xpath = xpath[len(self.token):]
        return xpath

    def find(self, path):
        return self.root.find(self.to_xpath(path))

    def findall(self, path):
        return self.root.findall(self.to_xpath(path))