
var playerInstance;
const SEEK_JUMP_SECONDS = 5;
const TRICKPLAY_SPEED = 4;

// License server config
var VectorDrmConfig = { 'com.widevine.alpha':'https://drm-widevine-licensing.axtest.net/AcquireLicense', 'preferredKeysystem':'com.widevine.alpha'};
var ArtOfMotionDrmConfig = { 'com.microsoft.playready':'https://playready.directtaps.net/pr/svc/rightsmanager.asmx?PlayRight=1&ContentKey=EAtsIJQPd5pFiRUrV9Layw==', 'preferredKeysystem':'com.microsoft.playready'};
var AngelOneDrmConfig = { 'com.widevine.alpha':'https://cwip-shaka-proxy.appspot.com/no_auth', 'preferredKeysystem':'com.widevine.alpha'};

var playerVersion = "0.4";

/**
 * APP PLAYBACK FUNCTIONS
 */
function app_load(locator, keyPress)
{
	if(!keyPress) {
		changeFocus(Navbar.loadUrlButtonPos);
	}

	switch(document.getElementById("videoURLs").selectedIndex) {
		case 5:
				playerInstance.setDRMConfig(VectorDrmConfig);
				// Add custom HTTP Header
				break;
		case 6: 
				playerInstance.setDRMConfig(ArtOfMotionDrmConfig);
				break;
		case 7: 
				playerInstance.setDRMConfig(AngelOneDrmConfig);
				break;
		default:
				break;
	}
	playerInstance.load(locator, false);

	// load audio and text tracks after load
	loadAudioTextTracks();
}

function app_play(keyPress)
{
	if(!keyPress) {
		changeFocus(Navbar.playButtonPos);
	}
	playerInstance.play();
}

function app_pause(keyPress)
{
	if(!keyPress) {
		changeFocus(Navbar.pauseButtonPos);
	}
	playerInstance.pause();
}

function app_seek_back(keyPress)
{
	if(!keyPress) {
		changeFocus(Navbar.seekBackButtonPos);
	}
	playerInstance.seek(playerInstance.getCurrentPosition() - SEEK_JUMP_SECONDS);
}

function app_seek_front(keyPress)
{
	if(!keyPress) {
		changeFocus(Navbar.seekFrontButtonPos);
	}
	playerInstance.seek(playerInstance.getCurrentPosition() + SEEK_JUMP_SECONDS);
}

function app_rewind(keyPress)
{
	if(!keyPress) {
		changeFocus(Navbar.rewindButtonPos);
	}
	playerInstance.setPlaybackRate(-TRICKPLAY_SPEED);
}

function app_fast_forward(keyPress)
{
	if(!keyPress) {
		changeFocus(Navbar.fastButtonPos);
	}
	playerInstance.setPlaybackRate(TRICKPLAY_SPEED);
}

function user_input(keyPress)
{
	// Change focus to input bar irrespective of click or keypress navigation
	changeFocus(Navbar.URLInputPos);
}

function app_load_input(keyPress)
{
	if(!keyPress) {
		changeFocus(Navbar.loadButtonPos);
	}

	// Get User entered URL input
	var userURL = URLInput.value;
	playerInstance.load(userURL, false);

	// load audio and text tracks after load
	loadAudioTextTracks();
}

function app_switch_audioTrack(keyPress)
{
	if(!keyPress) {
		changeFocus(Navbar.audioTracksListPos);
	}
    var audioTrackLang =  document.getElementById("audioTracks").value; // get selected Audio track language
    console.log("Setting Audio track: " + audioTrackLang);
    playerInstance.setAudioLanguage(audioTrackLang);
}

function app_switch_textTrack(keyPress)
{
	if(!keyPress) {
		changeFocus(Navbar.textTracksListPos);
	}
    var trackIdx =  document.getElementById("textTracks").value; // get selected Audio track language
	playerInstance.setTextTrack(trackIdx);
	//playerInstance.setAudioLanguage(audioTrackLang);
}

// Get audio and Text tracks and populate the UI
function loadAudioTextTracks() {
	setTimeout(function() {
		// load audio tracks available
		var audioTracksAvailable = playerInstance.getAvailableAudioTracks();
		if(audioTracksAvailable != undefined)
		{
			// Remove exsisting options in list
			if(audioTracksList.options.length) {
				for(itemIndex = audioTracksList.options.length; itemIndex >= 0; itemIndex--) {
					audioTracksList.remove(itemIndex);
				}
			}

			// Iteratively adding all the options to audioTracks
			for (var trackNo = 0; trackNo < audioTracksAvailable.length; trackNo++) {
				var option = document.createElement("option");
				option.value = audioTracksAvailable[trackNo].language;
				option.text = "AUD: " + audioTracksAvailable[trackNo].language;
				audioTracksList.add(option);
			}
		}

		// load text tracks available
		var textTracksAvailable = playerInstance.getAvailableTextTracks();
		if(textTracksAvailable != undefined)
		{
			// Remove exsisting options in list
			if(textTracksList.options.length) {
				for(itemIndex = textTracksList.options.length; itemIndex >= 0; itemIndex--) {
					textTracksList.remove(itemIndex);
				}
			}

			// Iteratively adding all the options to textTracks
			for (var trackNo = 0; trackNo < textTracksAvailable.length; trackNo++) {
				var option = document.createElement("option");
				option.value = textTracksAvailable[trackNo].instreamId;
				if(textTracksAvailable[trackNo].type == "SUBTITLES") {
					option.text = "SUB: ";
				} else if(textTracksAvailable[trackNo].type == "CLOSED-CAPTIONS") {
					option.text = "CC: ";
				}
				option.text += textTracksAvailable[trackNo].language;
				textTracksList.add(option);
			}
		}

		// enable closed captioning
		playerInstance.setClosedCaptionStatus(true);
    }, 500);
		
}

// used by navigation handler
function onSelectVideoLocator()
{
	var locator = loadUrlButton.options[loadUrlButton.selectedIndex].value;
	app_load( locator );
}

// used by mouse click on audio track selection
function onSelectAudioLang()
{
	app_switch_audioTrack();
}

// used by mouse click on text track selection
function onSelectTextLang()
{
	app_switch_textTrack();
}

/**
 * KEY PRESS HANDLING
 */

function keyLeft() {
	//goto Previous button
	removeFocus();
	if ( currentPos > 0) {
		currentPos--;
	} else {
		currentPos =  components.length - 1;
	}
	currentObj =  components[ currentPos];
	addFocus();
}

function keyRight() {
	//goto Next button
	removeFocus();
	if ( currentPos <  components.length - 1) {
		currentPos++;
	} else {
		currentPos = 0;
	}
	currentObj =  components[ currentPos];
	addFocus();
}

function keyUp() {
	if ((components[currentPos] == loadUrlButton) && (dropDownListVisible)) {
		prevVideoSelect();
	} else if ((components[currentPos] == audioTracksList) && (audioListVisible)) {
		prevAudioSelect();
	} else if ((components[currentPos] == textTracksList) && (textListVisible)) {
		prevTextSelect();
	}
}

function keyDown() {
	if ((components[currentPos] == loadUrlButton) && (dropDownListVisible)) {
		nextVideoSelect();
	} else if ((components[currentPos] == audioTracksList) && (audioListVisible)) {
		nextAudioSelect();
	} else if ((components[currentPos] == textTracksList) && (textListVisible)) {
		nextTextSelect();
	}
}

// Move to previous video url in the selection list
function prevVideoSelect() {
	if (selectListIndex > 0) {
		selectListIndex--;
	} else {
		selectListIndex = loadUrlButton.options.length - 1;
	}
	this.loadUrlButton.options[selectListIndex].selected = true;
}

// Move to next video url in the selection list
function nextVideoSelect() {
	if (selectListIndex < loadUrlButton.options.length - 1) {
		selectListIndex++;
	} else {
		selectListIndex = 0;
	}
	loadUrlButton.options[selectListIndex].selected = true;
}

// Move to previous audio track in the selection list
function prevAudioSelect() {
	if (selectAudioListIndex > 0) {
		selectAudioListIndex--;
	} else {
		selectAudioListIndex = audioTracksList.options.length - 1;
	}
	audioTracksList.options[selectAudioListIndex].selected = true;
}

// Move to next audio track in the selection list
function nextAudioSelect() {
	if (selectAudioListIndex < audioTracksList.options.length - 1) {
		selectAudioListIndex++;
	} else {
		selectAudioListIndex = 0;
	}
	audioTracksList.options[selectAudioListIndex].selected = true;
}

// Move to previous text track in the selection list
function prevTextSelect() {
	if (selectTextListIndex > 0) {
		selectTextListIndex--;
	} else {
		selectTextListIndex = textTracksList.options.length - 1;
	}
	textTracksList.options[selectTextListIndex].selected = true;
}

// Move to next text track in the selection list
function nextTextSelect() {
	if (selectTextListIndex < textTracksList.options.length - 1) {
		selectTextListIndex++;
	} else {
		selectTextListIndex = 0;
	}
	textTracksList.options[selectTextListIndex].selected = true;
}


function showDropDown() {
	dropDownListVisible = true;
	var n = loadUrlButton.options.length;
	loadUrlButton.size = n;
}

function hideDropDown() {
	dropDownListVisible = false;
	loadUrlButton.size = 1;
	onSelectVideoLocator();
}

function showAudioDropDown() {
	audioListVisible = true;
	var n = this.audioTracksList.options.length;
	audioTracksList.size = n;
}

function hideAudioDropDown() {
	audioListVisible = false;
	audioTracksList.size = 1;
}

function showTextDropDown() {
	textListVisible = true;
	var n = this.textTracksList.options.length;
	textTracksList.size = n;
}

function hideTextDropDown() {
	textListVisible = false;
	textTracksList.size = 1;
}

function ok() {
	switch ( currentPos ) {
		case 0:
			if( dropDownListVisible ) {
				hideDropDown();
			} else {
				showDropDown();
			}
			break;
		case 1:
			app_play(true);
			break;
		case 2:
			app_pause(true);
			break;
		case 3:
			app_rewind(true);
			break;
		case 4:
			app_seek_back(true);
			break;
		case 5:
			app_seek_front(true);
			break;
		case 6:
			app_fast_forward(true);
			break;
		case 7:
			user_input(true);
			break;
		case 8:
			app_load_input(true);
			break;
		case 9:
			if( audioListVisible ) {
				hideAudioDropDown();
				app_switch_audioTrack(true);
			} else {
				showAudioDropDown();
			}
		case 10:
			if( textListVisible ) {
				hideTextDropDown();
				app_switch_textTrack(true);
			} else {
				showTextDropDown();
			}
			break;
		default:
			break;
	}
}

function addFocus() {
	if ( currentObj) {
		currentObj.classList.add("focus");
	} else {
		currentObj.focus();
	}
}

function removeFocus() {
	if ( currentObj) {
		currentObj.classList.remove("focus");
	} else {
		currentObj.blur();
	}
}

// Change focus on mouse click
function changeFocus(mousePosition) {
	removeFocus();
	currentPos =  mousePosition; 
	currentObj =  components[currentPos];
	addFocus();
}

keyEventHandler = function(e) {
	var keyCode = e.which || e.keyCode;
	//e.preventDefault();
	switch (keyCode) {
		case 37: // Left Arrow
			keyLeft();
			break;
		case 38: // Up Arrow
			keyUp();
			break;
		case 39: // Right Arrow
			keyRight();
			break;
		case 40: // Down Arrow
			keyDown();
			break;
		case 13: // Enter
		case 32:
			ok();
			break;
		default:
			break;
	}
	return false;
}

function enablePlayerUI(show) {
	if(show) { // Show UI
		document.getElementById('playbackButtonsNav').style.display = "block";
	} else { // Hide UI
		document.getElementById('playbackButtonsNav').style.display = "none";
	}
	
}

window.onload = function() {
	
	Navbar = {
		loadUrlButtonPos: 0,
		playButtonPos: 1,
		pauseButtonPos: 2,
		rewindButtonPos: 3,
		seekBackButtonPos: 4,
		seekFrontButtonPos: 5,
		fastButtonPos: 6,
		URLInputPos: 7,
		loadButtonPos: 8,
		audioTracksListPos: 9,
		textTracksListPos: 10
	}

	// Display current Argo Player version
	document.getElementById("versionText").innerHTML = playerVersion;

	// key navigation support; needed for remote control based navigation (no mouse/keyboard)
	document.addEventListener("keydown", keyEventHandler);
	loadUrlButton  = document.getElementById("videoURLs");
	playButton  = document.getElementById("playButton");
	pauseButton = document.getElementById("pauseButton");
	rewindButton = document.getElementById("rewindButton");
	seekBackButton = document.getElementById("seekBackButton");
	seekFrontButton = document.getElementById("seekFrontButton");
	fastButton = document.getElementById("fastButton");
	URLInput = document.getElementById("URLInput");
	loadButton = document.getElementById("loadButton");
	audioTracksList = document.getElementById("audioTracks");
	textTracksList = document.getElementById("textTracks");
	dropDownListVisible = false;
	audioListVisible = false;
	textListVisible = false;
	selectListIndex = 0;
	selectAudioListIndex = 0;
	selectTextListIndex = 0;
	
	currentObj =  loadUrlButton;
	components = [ loadUrlButton, playButton, pauseButton, rewindButton, seekBackButton, seekFrontButton, fastButton, URLInput, loadButton, audioTracksList, textTracksList];
	currentPos = 0;
	addFocus();


	playerInstance = new Argo("testApp")
	enablePlayerUI(true);

	//load first asset on startup
	app_load( loadUrlButton.options[0].value );
}
