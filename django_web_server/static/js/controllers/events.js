var Event = Object.freeze({

	AJAX_ERROR : guid(),

	GPX_FILE_IMPORT_SUCCEEDED : guid(),
	GPX_FILE_IMPORT_PROCESS_COMPLETED : guid(),

	TRACK_SELECTED : guid(),

	TRACK_LOADED : guid(),
	TRACK_UNLOADED : guid(),

	WAYPOINTS_LOADED : guid(),

	WAYPOINT_EDITED : guid(),
	WAYPOINT_DELETED : guid(),
	WAYPOINT_UNLOADED : guid(),

	MAP_ZOOM_IN : guid(),
	MAP_ZOOM_OUT : guid(),
	MAP_SELECTION_BEGUN : guid(),
	CANCEL_MAP_SELECTION : guid(),
});

var Command = Object.freeze({
	
	LOAD_TRACK : guid(),
	UNLOAD_TRACK : guid(),

	EXPORT_WAYPOINTS : guid(),
	
	// should not be a command.  trigger should be local to map
	//
	AREA_SELECT_WAYPOINTS : guid(),
});