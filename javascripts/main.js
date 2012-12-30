$(document).ready(initPage);
var cacheDisabled = 0;
var activeLearningEnabled = true;
var alertInfo = {
	cacheEnabledInfo: 'Cache enabled!',
	cacheDisabledInfo: 'Cache disabled!',
	activeLearningEnabledInfo: 'Active learning enabled!',
	activeLearningDisabledInfo: 'Active learning disabled!'
};

function initPage() {
	$('.label').bind('click', fillURI);	
    $('[rel=tooltip]').tooltip();
	$('#submitBtn').bind('click', btnListener);
	$('#cacheBtn').bind('click', btnListener);
	$('#activeLearningBtn').bind('click', btnListener);
	$('#closeOptionsAlertBtn').bind('click', btnListener);
	$(document).keypress(function(e) {		//¼àÌý»Ø³µ
		if (e.which == 13) { 
			if(document.activeElement.id == 'searchInput')
				submitQuery();
		}
	});
}

function fillURI() {
	//$('#searchInput').attr('value',this.innerHTML);
	$('#searchInput').val(this.innerHTML);
}

function btnListener() {
	var clickedId = this.id;
	switch(clickedId) {
		case 'submitBtn':
			submitQuery();
			/* var queryStr = encodeURIComponent($('#searchInput').val());
			location.href = '../queryresult.jsp?query=' + queryStr + '&&act=coref'; */
		break;
		case 'cacheBtn':
			cacheSwitch();
		break;
		case 'activeLearningBtn':
			activeLearningSwitch();
		break;
		case 'closeOptionsAlertBtn':
			closeOptionsAlert();
		break;
		default:break;
	}
}

function submitQuery() {
	var queryURI = $('#searchInput').val().trim();
	if(queryURI != '') {
		var modeOption = getModeOption();
		var datasetOption = getDatasetOption();
		location.href =	'query.html?' +
						'queryURI=' + queryURI +
						'&nocache=' + cacheDisabled +
						'&modeOption=' + modeOption +
						'&datasetOption=' + datasetOption
						;
	}
}

function cacheSwitch() {
	
	if(cacheDisabled == 0) {
		cacheDisabled = 1;		
	}
	else {
		cacheDisabled = 0;		
	}
	refreshCacheSwitch();
}

function refreshCacheSwitch() {
	var cacheStatus = $('#cacheStatus');
	if(cacheDisabled == 0) {		
		cacheStatus.attr('class', 'icon-ok');
		showOptionsAlert(alertInfo.cacheEnabledInfo);
	}
	else {
		cacheStatus.attr('class', 'icon-remove');
		showOptionsAlert(alertInfo.cacheDisabledInfo);
	}
}

function activeLearningSwitch() {
	var activeLearningStatus = $('#activeLearningStatus');
	if(activeLearningEnabled) {
		activeLearningEnabled = false;
		activeLearningStatus.attr('class', 'icon-remove');
		showOptionsAlert(alertInfo.activeLearningDisabledInfo);
	}
	else {
		activeLearningEnabled = true;
		activeLearningStatus.attr('class', 'icon-ok');
		showOptionsAlert(alertInfo.activeLearningEnabledInfo);
	}
}

function showOptionsAlert(alertInfo) {
	$('#alertMsg').html(alertInfo);
	$('#optionsAlert').show("fast");
}

function closeOptionsAlert() {
	$('#optionsAlert').hide("fast");
}

function getDatasetOption() {
	var datasetOption;
	if($('#dataset-Falcons').hasClass('active')) {
		datasetOption = 'FALCONS';
	}
	else if($('#dataset-BTC').hasClass('active')) {
		datasetOption = 'BTC2011';
	}
	return datasetOption;
}

function getModeOption() {
	var modeOption = 'SelfTrainer';
	if($('#mode-FPC').attr('checked')) {
		if($('#mode-CC').attr('checked')) {
			modeOption = 'SelfTrainerFPC_CC';
		}
		else {
			modeOption = 'SelfTrainerFPC';
		}
	}
	else if($('#mode-CC').attr('checked')) {
		modeOption = 'SelfTrainer_CC';
	}
	return modeOption;
}