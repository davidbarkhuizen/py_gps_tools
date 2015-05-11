var Event = Object.freeze({

	TRACK_LOADED : guid(),

	// ------------------------------

	PLOT_ELEVATION : guid(),

	GPX_FILE_IMPORT_FAILED : guid(),
	GPX_FILE_IMPORT_SUCCEEDED : guid(),
	GPX_FILE_IMPORT_PROCESS_COMPLETED : guid(),

	MAP_REFRESH : guid(),
	
	MAP_ZOOM_IN : guid(),
	MAP_ZOOM_OUT : guid(),
	MAP_SELECTION_BEGUN : guid(),
	CANCEL_MAP_SELECTION : guid(),

	INFO_TEXT_UPDATE : guid(),
});

var Command = Object.freeze({
	REMOVE_TRACK : guid(),
	REFRESH_WAYPOINTS : guid()
});