var Event = Object.freeze({

	AJAX_ERROR : guid(),

	GPX_FILE_IMPORT_SUCCEEDED : guid(),
	GPX_FILE_IMPORT_PROCESS_COMPLETED : guid(),

	TRACK_SELECTED : guid(),

	TRACK_LOADED : guid(),
	TRACK_UNLOADED : guid(),

	WAYPOINTS_LOADED : guid(),
	WAYPOINTS_UNLOADED : guid(),
	WAYPOINT_EDITED : guid(),
	WAYPOINT_DELETED : guid(),
});

var Command = Object.freeze({
	
	LOAD_TRACK : guid(),
	UNLOAD_TRACK : guid(),

	EXPORT_WAYPOINTS : guid(),

	GOTO_VIEW : guid(),
});