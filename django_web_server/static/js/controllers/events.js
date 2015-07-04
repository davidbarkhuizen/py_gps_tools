var Event = Object.freeze({

	DATA_MODEL_CHANGED : guid(),

	DEBUG_ERROR : guid(),

	GPX_FILE_IMPORT_SUCCEEDED : guid(),
	GPX_FILE_IMPORT_PROCESS_COMPLETED : guid(),

	MAP_SELECTION_BEGUN : guid(),
});

var Command = Object.freeze({

	// NAVIGATION
	//
	GOTO_VIEW : guid(),

	// GPX
	//
	LOAD_GPX : guid(),
	UNLOAD_GPX : guid(),
	EXPORT_GPX : guid(),	
	//
	UPDATE_GPX_FILENAME : guid(),
	UPDATE_GPX_NAME : guid(),
	UPDATE_GPX_DESC : guid(),

	// WAYPOINT
	//
	LOAD_WAYPOINTS : guid(),	
	EXPORT_WAYPOINTS : guid(),
	//
	UPDATE_WAYPOINT_NAME : guid(),
	COPY_WAYPOINTS_TO_GPX : guid(),
	SELECT_WAYPOINTS : guid(),

	// TRACK
	//
	UNLOAD_TRACK : guid(),
	EXPORT_TRACKS : guid(),
	//
	COPY_TRACK_TO_GPX : guid(),

	// TRACK SEGMENT
	//
	DELETE_TRKSEG_SECTION : guid(),

	// MAP
	//
	EXPORT_MAP : guid(), // TODO how do these differ ?
	EXPORT_CANVAS : guid(),
});