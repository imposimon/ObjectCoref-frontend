$(document).ready(initPage);
var serverURL = 'http://localhost:80/objectcoref/service/selftraining/get';
var cacheDisabled = 0;
var activeLearningEnabled = true;
var alertInfo = {
	cacheEnabledInfo: 'Cache enabled!',
	cacheDisabledInfo: 'Cache disabled!',
	activeLearningEnabledInfo: 'Active learning enabled!',
	activeLearningDisabledInfo: 'Active learning disabled!'
};
var queryURI = '';
var PLDArray = new Array();
var ObjectArray = new Array();

function initPage() {
	
    
	$('body').tooltip({selector:'[rel=tooltip]'});	
	$('#submitBtn').bind('click', btnListener);
	$('#cacheBtn').bind('click', btnListener);
	$('#activeLearningBtn').bind('click', btnListener);
	$('#closeOptionsAlertBtn').bind('click', btnListener);	
	
	queryURI = getParam('queryURI');
	cacheDisabled = getParam('nocache');
	refreshCacheSwitch();
	$('#queryURI').html(queryURI);
	$('#searchInput').val(queryURI);
	sendRequest(-1);
}

function getParam(paramName) {
	var params = location.href.split('?')[1];
	var paramsArray = params.split('&');
	for(var i = 0; i < paramsArray.length; i++) {
		if(paramsArray[i].split('=')[0] == paramName) {
			return paramsArray[i].split('=')[1];
		}
	}
	return null;
}



function btnListener() {
	var clickedId = this.id;
	switch(clickedId) {
		case 'submitBtn':
			$('#queryURI').html(queryURI);
			queryURI = $('#searchInput').val();
			
			$('#resultPane').html('');
			$('#resultPane').hide();
			$('#resultInfo').hide();
			$('#progressBar').show();
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
	var queryURI = $('#searchInput').val();
	location.href = 'query.html?queryURI=' + queryURI + '&nocache=' + cacheDisabled;
	
	//for(var i = -1;i < 10; i++) {
/* 	$.getJSON(url, {uri: queryURI, itr: -1, nocache: cacheDisabled}, function (data) {						
						processData(data);
					}); */
	//}
/* 	$.get(url, {uri:'http://www.w3.org/People/Berners-Lee/card#i'}, function (data) {
					alert(data.plds[0].insts[3].displayName);
					}); */
	//$.post(url, {uri:'http://www.w3.org/People/Berners-Lee/card#i'}, function (data) {alert(data);});
	/* $.ajax({
		type:'post',
		url:'http://114.212.87.172:80/objectcoref/service/kernel/get?uri=http://www.w3.org/People/Berners-Lee/card#i',
		datatype:'',
	}); */
}

function sendRequest(iterNum) {
	$.getJSON(serverURL, {uri:queryURI, itr:iterNum, nocache: cacheDisabled}, function (data) {
				processData(data);
			});
}

function processData(data) {
	console.log(data);
	var iterNum = data.iteratorNum;
	var plds = data.plds;
	var timeCost = data.timeCost;
	var PLDList = $('<div id="PLDList"></div>');
	if(data.noPLD == 1) {	//the results are not ordered by their PLD
		PLDList.append(constructPLD(plds));
		if(iterNum < 9) {
			sendRequest(iterNum);
		}
	}
	else {	
		$.each(plds, function(index, pld) {		
			PLDList.append(constructPLD(pld));		
		});
	}
	$('#resultsNum').html(plds.length);
	$('#timeCost').html(timeCost);	
	$('#progressBar').hide();		
	$('#resultInfo').fadeIn('fast');
	$('#resultPane').append('<hr/>');
	$('#resultPane').append(PLDList).slideDown('slow');
	
}

function constructPLD(pld) {
	var pldContent = $('<div class="alert alert-success"><strong>' + pld.pldName + '</strong></div>');	
	if(!pld.insts.length) {
		pldContent.append(constructInst(pld.insts));
	}
	else {
		$.each(pld.insts, function(index, inst) {
			pldContent.append(constructInst(inst));
		});
	}	
	return pldContent;
}

function constructInst(inst) {
	var instContent = $('<div></div>');
	$('<a>',{
		class: "displayName",
		rel: "tooltip", 
		target: "_Blank",
		title: "Descrided in <strong>" + inst.docCnt +  "</strong> docs. Similarity: <strong>" + inst.similarity + "</strong>", 
		text: inst.displayName,
		href: "http://ws.nju.edu.cn/explorer/entity.jsp?q=" + inst.URI	
	}).appendTo(instContent);	
	
	if(!inst.snippets) {
		instContent.append($('<br/>'));
		return instContent;
	}
	if(!inst.snippets.length) {
		instContent.append(constructSnippet(inst.snippets));
	}
	else {
		$.each(inst.snippets, function(index, snippet) {
			instContent.append(constructSnippet(snippet));			
		});
	}
	instContent.append($('<br/>'));
	return instContent;
}

function constructSnippet(snippet) {
	var snippetElement = $('<li></li>');
	var predicateElement = $('<a>', {
						text: snippet.predicateName + ' ',
						href: "http://ws.nju.edu.cn/explorer/entity.jsp?q=" + snippet.predicateURI,
						target: "_Blank"
					});
	if(snippet.subject.match(/^l/)) {
		var subjectElement = $('<span>' + snippet.subjectName + ' </span>');	
	}
	else {
		var subjectElement = $('<a>', {
							text: snippet.subjectName + ' ',
							href: "http://ws.nju.edu.cn/explorer/entity.jsp?q=" + snippet.subjectURI,
							target: "_Blank"
						});
	}
	if(snippet.object.match(/^l/)) {
		var objectElement = $('<span>' + snippet.objectName + ' </span>');	
	}
	else {
		var objectElement = $('<a>', {
							text: snippet.objectName + ' ',
							href: "http://ws.nju.edu.cn/explorer/entity.jsp?q=" + snippet.objectURI,
							target: "_Blank"
						});
	}
	snippetElement.append(subjectElement);
	snippetElement.append(predicateElement);
	snippetElement.append(objectElement);
	return snippetElement;	
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