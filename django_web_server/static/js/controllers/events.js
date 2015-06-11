var Event = Object.freeze({

	DEBUG_ERROR : guid(),

	GPX_FILE_IMPORT_SUCCEEDED : guid(),
	GPX_FILE_IMPORT_PROCESS_COMPLETED : guid(),
	GPXS_LOADED : guid(),

	TRACKS_LOADED : guid(),
	TRACK_DELETED : guid(),

	TRACK_SELECTED : guid(),
	MAP_SELECTION_BEGUN : guid(),

	WAYPOINTS_LOADED : guid(),
	WAYPOINTS_UNLOADED : guid(),

	WAYPOINT_EDITED : guid(),
	WAYPOINT_DELETED : guid(),

	GPX_EDITED : guid(),
});

var Command = Object.freeze({
	
	LOAD_GPX : guid(),
	UPDATE_WAYPOINT_NAME : guid(),

	LOAD_TRACKS : guid(),
	LOAD_WAYPOINTS : guid(),

	DELETE_TRACK : guid(),
	DELETE_TRKSEG_SECTION : guid(),

	// ---------------------------------------------------------

	EXPORT_WAYPOINTS : guid(),
	EXPORT_MAP : guid(),
	EXPORT_TRACKS : guid(),

	EXPORT_CANVAS : guid(),

	GOTO_VIEW : guid(),
});