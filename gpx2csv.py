# parse arguments for source file load 
import argparse
import os.path

import xml.etree.ElementTree as ET

DATE_TIME_FORMAT = '%Y-%m-%dT%H:%M:%SZ'

import core.gpx as gpx

def construct_xml_tree_from_file_arguments():

    argparser = argparse.ArgumentParser(description='convert .gpx file to .csv')
    
    argparser.add_argument('source_file', metavar='N', help='source .gpx file')
    argparser.add_argument('--dest', dest='dest_path', help='destination path')
    
    args = argparser.parse_args()
    
    # get dest path, default to current working directory if not supplied
    
    dest_file_path = None
    dest_file_path = args.dest_path
    if dest_file_path == None:
        dest_file_path = os.getcwd()
    
    # attempt load of source file
    
    print(args.source_file)
   
    # construct dest file path from source file
    
    path, source_file_name = os.path.split(args.source_file)
    dest_file_path = dest_file_path + '/' + source_file_name.replace('.gpx', '.csv')
    
    tree = ET.parse(args.source_file)
    
    return tree, dest_file_path

def construct_datastruct_from_xml_string(xml_tree):
    
    import datetime
    
    root = xml_tree.getroot()
    
    root_tag_text = str(root)
    ns = root_tag_text[root_tag_text.find('{') : root_tag_text.find('}') + 1]
    
    token = '/'
    
    def find(path):
        paths = path.split(token)        
        
        xpath = ''        
        for p in paths:
            xpath = xpath + token + ns + p        
        xpath = xpath[len(token):]
        
        return root.find(xpath)
    
    def findall(path):
        paths = path.split(token)        
        
        xpath = ''        
        for p in paths:
            xpath = xpath + token + ns + p        
        xpath = xpath[len(token):]
        
        return root.findall(xpath)
    
    # metadata time
    
    metadata_time_stamp_string = find('metadata/time').text
    meta_data_time = datetime.datetime.strptime(metadata_time_stamp_string, DATE_TIME_FORMAT)    
  
    print('metadata - time @ %s' % meta_data_time)
  
    # track info
    
    ## track name
    
    track_name = find('trk/name').text
    print('track name - %s' % track_name)
    
    ## track segments
    
    track_segments = findall('trk/trkseg')
    print('track segment count = %i ' % len(track_segments))
    
    for track_segment in track_segments:
        for track_point in track_segment:
          
            lat = float(track_point.get('lat'))
            print('lat %f' % lat)
            
            lon = float(track_point.get('lon'))
            print('lon %f' % lon)            
            
            elevation = float(track_point.find(ns + 'ele').text)
            print('elevation %f' % elevation)
            
            time = datetime.datetime.strptime((track_point.find(ns + 'time').text), DATE_TIME_FORMAT)
            print(time)
            
            track_point = gpx.TrackPoint(lat, lon, elevation, time) 
  
def write_to_csv_file(data_struct, dest_file_path):
    return None

def main():
    xml_tree, dest_file_path = construct_xml_tree_from_file_arguments()
    data_struct = construct_datastruct_from_xml_string(xml_tree)
    write_to_csv_file(data_struct, dest_file_path)

if __name__ == '__main__':
    main()
