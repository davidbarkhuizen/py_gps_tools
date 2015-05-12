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
  
    # track    
    gpx_track = gpx.Track()
    
    ## track name    
    gpx_track.name = find('trk/name').text
    
    ## track segments    
    track_segments = findall('trk/trkseg')
    
    for track_segment in track_segments:
        
        gpx_tracksegment = gpx.TrackSegment()
        
        for track_point in track_segment:
          
            lat = float(track_point.get('lat'))
            lon = float(track_point.get('lon'))
            elevation = float(track_point.find(ns + 'ele').text)
            time = datetime.datetime.strptime((track_point.find(ns + 'time').text), DATE_TIME_FORMAT)
            
            gpx_trackpoint = gpx.TrackPoint(lat, lon, elevation, time)
            
            gpx_tracksegment.trackpoints.append(gpx_trackpoint) 

        gpx_tracksegment.trackpoints = sorted(gpx_tracksegment.trackpoints, key=lambda x : x.time)

        gpx_track.tracksegments.append(gpx_tracksegment)

        return gpx_track

def write_to_csv_file(gpx_track, dest_file_path):
    
    f = open(dest_file_path, 'tw')
    f.write('time, latitude, longitude, elevation' + '\n')
    for segment in gpx_track.segments:
        for point in segment.points:
            f.write('%s,%f,%f,%f' % (point.time, point.lat, point.lon, point.ele) + '\n')
    f.close()

def main():
    xml_tree, dest_file_path = construct_xml_tree_from_file_arguments()
    gpx_track = construct_datastruct_from_xml_string(xml_tree)
    write_to_csv_file(gpx_track, dest_file_path)

if __name__ == '__main__':
    main()
