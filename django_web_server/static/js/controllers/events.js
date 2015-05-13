var Event = Object.freeze({

	AJAX_ERROR : guid(),

	TRACK_SELECTED : guid(),

	TRACK_LOADED : guid(),
	TRACK_UNLOADED : guid(),

	// --------------------------------------------------

	WAYPOINT_DELETED : guid(),
	
	// from GodController
	DATA_MODEL_CHANGED : guid(),	

	PLOT_ELEVATION : guid(),

	GPX_FILE_IMPORT_FAILED : guid(),
	GPX_FILE_IMPORT_SUCCEEDED : guid(),
	GPX_FILE_IMPORT_PROCESS_COMPLETED : guid(),

	MAP_ZOOM_IN : guid(),
	MAP_ZOOM_OUT : guid(),
	MAP_SELECTION_BEGUN : guid(),
	CANCEL_MAP_SELECTION : guid(),

	INFO_TEXT_UPDATE : guid(),
});

var Command = Object.freeze({
	LOAD_TRACK : guid(),
	UNLOAD_TRACK : guid(),
	REFRESH_WAYPOINTS : guid()
});