import argparse

def get_file_paths_from_args(description='from --source to --dest'):

    argparser = argparse.ArgumentParser(description)
    
    argparser.add_argument('--source', dest='source_path', help='source .gpx file')
    argparser.add_argument('--dest', dest='dest_path', help='destination path')
    
    args = argparser.parse_args()
    
    return args.source_path, args.dest_path

def load(filepath):
    s = None
    with open(filepath, 'r') as f:
        s = f.read()
    return s

def main():
    source_path, dest_path = get_file_paths_from_args()
    print(source_path, dest_path)
    
    s = load(source_path)
    
    s = s.replace(' ', '')
    s = s.replace('\r', '')
    s = s.replace('\n', '')

    s = s.replace('<?xmlversion="1.0"?><History><Run><Track>', '<gpx creator="eTrex 20" version="1.1" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www8.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/WaypointExtension/v1 http://www8.garmin.com/xmlschemas/WaypointExtensionv1.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd"><metadata><link href="http://www.garmin.com"><text>Garmin International</text></link><time>2012-09-16T16:50:02Z</time></metadata><trk><name>converted track</name><trkseg>')
    s = s .replace('</Track></Run></History>', '</trkseg></trk></gpx>')

    s = s.replace('<Trackpoint><Position><Latitude>', '<trkpt lat="')
    s = s.replace('</Latitude><Longitude>', '" lon="')
    s = s.replace('</Longitude><Altitude>', '"><ele>')
    s = s.replace('</Altitude></Position><Time>', '</ele><time>')
    s = s.replace('</Time></Trackpoint>', '</time></trkpt>')
    '''
    s = s.replace('', '')
    s = s.replace('', '')
    s = s.replace('', '')
    s = s.replace('', '')
    '''
    with open(dest_path, 'w') as f:
        f.write(s)

    print('done')

main()