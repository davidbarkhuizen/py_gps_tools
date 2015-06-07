var Event = Object.freeze({

	DEBUG_ERROR : guid(),

	GPX_FILE_IMPORT_SUCCEEDED : guid(),
	GPX_FILE_IMPORT_PROCESS_COMPLETED : guid(),
	GPXS_LOADED : guid(),

	TRACKS_LOADED : guid(),
	TRACKS_UNLOADED : guid(),

	TRACK_SELECTED : guid(),

	WAYPOINTS_LOADED : guid(),
	WAYPOINTS_UNLOADED : guid(),

	WAYPOINT_EDITED : guid(),
	WAYPOINT_DELETED : guid(),
});

var Command = Object.freeze({
	
	LOAD_GPX : guid(),
	LOAD_TRACKS : guid(),
	LOAD_WAYPOINTS : guid(),

	// ----------------------------

	UNLOAD_TRACK : guid(),

	EXPORT_WAYPOINTS : guid(),
	EXPORT_MAP : guid(),
	EXPORT_TRACKS : guid(),

	EXPORT_CANVAS : guid(),

	GOTO_VIEW : guid(),
});