var Event = Object.freeze({

	DEBUG_ERROR : guid(),
	SERVER_UPDATED : guid(),
	DATA_MODEL_CHANGED : guid(),
	MAP_SELECTION_BEGUN : guid(),
});

var Command = Object.freeze({

	// MODAL
	//
	OPEN_UNSAVED_CHANGES_MODAL : guid(),

	// NAVIGATION
	//
	GOTO_VIEW : guid(),

	// GPX
	//
	LOAD_GPX : guid(),
	UNLOAD_GPX : guid(),
	//
	UPDATE_GPX_FILENAME : guid(),
	UPDATE_GPX_NAME : guid(),
	UPDATE_GPX_DESC : guid(),

	// WAYPOINT
	//
	UPDATE_WAYPOINT_NAME : guid(),
	COPY_WAYPOINTS_TO_GPX : guid(),
	SELECT_WAYPOINTS : guid(),
	// DELETE_WAYPOINT

	// TRACK
	//
	UPDATE_TRACK_NAME : guid(),
	DELETE_TRACK : guid(),
	COPY_TRACK_TO_GPX : guid(),

	// TRACK SEGMENT
	//
	DELETE_TRKSEG_SECTION : guid(),

	// EXPORT
	//
	EXPORT_GPX : guid(),	
	EXPORT_TRACKS : guid(),
	EXPORT_WAYPOINTS : guid(),
	EXPORT_MAP : guid(),
	EXPORT_CANVAS : guid(),
});