﻿$(document).ready(initPage);
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
var objectArray = new Array();
var sumResultNum = 0; //结果总数
var sumPageNum = 0; //总页数
var curPageNum = 0; //当前页码
var resultIsPLD = true; // 结果若为PLD，则为true，否则为false
var selfTrainingDone = false; //self-training是否完成

function initPage() {
	
    
	$('body').tooltip({selector:'[rel=tooltip]'});	
	$('#submitBtn').bind('click', btnListener);
	$('#cacheBtn').bind('click', btnListener);
	$('#activeLearningBtn').bind('click', btnListener);
	$('#closeOptionsAlertBtn').bind('click', btnListener);
	$('#closeSuccessAlertBtn').bind('click', btnListener);
	$('#sortYes').bind('click', btnListener);
	$('#sortNo').bind('click', btnListener);	
	
	$('#paginationList').html('');	//清空页码
	$('#resultPane').html('');		//清空结果
	
	queryURI = getParam('queryURI');
	cacheDisabled = getParam('nocache');
	refreshCacheSwitch(false);
	$('#queryURI').html(queryURI);
	$('#searchInput').val(queryURI);
	sendRequest(-1, cacheDisabled);
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
			queryURI = $('#searchInput').val();	
			$('#queryURI').html(queryURI);
			$('#paginationList').html('');	//清空页码
			$('#resultPane').html('');		//清空结果
			$('#pagination').hide();
			$('#resultPane').hide();
			$('#resultInfo').hide();
			$('#notFoundAlert').hide();
			$('#successAlert').hide();
			$('#optionsAlert').hide();
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
		case 'closeSuccessAlertBtn':
			closeSuccessAlert();
		break;
		case 'sortNo':
			closeSuccessAlert();
		break;
		case 'sortYes':
			sortYes();
			closeSuccessAlert();
		break;
		default:break;
	}
}

function submitQuery() {
	// var queryURI = $('#searchInput').val();
	// location.href = 'query.html?queryURI=' + queryURI + '&nocache=' + cacheDisabled;
	sendRequest(-1, cacheDisabled);
	
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

function sendRequest(iterNum, noCache) {
	$.getJSON(serverURL, {uri:queryURI, itr:iterNum, nocache: noCache}, function (data) {
				processData(data);
			});
}

function processData(data) {
	$('#paginationList').html('');	//清空页码
	$('#resultPane').html('');		//清空结果
	
	console.log(data);
	var iterNum = data.iteratorNum;
	var plds = data.plds;
	if(!plds.length && !plds.insts.length && !plds.insts.URI) {//没有找到结果
		$('#notFoundURI').html(queryURI);
		$('#notFoundAlert').show();
		$('#progressBar').hide();
		return;
	}
	// var timeCost = data.timeCost;
	
	if(data.noPLD == 1) {	//the results are not ordered by their PLD
		// PLDList.append(constructPLD(plds));
		// if(iterNum < 9) {
			// sendRequest(iterNum);
		// }
		if(!plds.insts.length) {
			plds.insts = [plds.insts];
		}
		objectArray = plds.insts;
		sumResultNum = objectArray.length;
		resultIsPLD = false;
		constructPagination();
		displayObjectPage(1);
		if(iterNum < 10) {
			iterativeRequest(iterNum);
		}
		else if (iterNum == 10){
			$('#page_loader').hide();
			$('#successAlert').show('slow');
		}
	}
	else {	
		// $.each(plds, function(index, pld) {		
			// PLDList.append(constructPLD(pld));		
		// });
		if(!plds.length) {
			plds = [plds];
		}
		PLDArray = plds;
		sumResultNum = PLDArray.length;
		resultIsPLD = true;
		constructPagination();
		displayPLDPage(1);
	}
	
	// $('#timeCost').html(timeCost);	
	$('#progressBar').hide();		
	$('#resultInfo').fadeIn('fast');
}

//在没有cache的情况下迭代请求
function iterativeRequest(iterNum) {
	$.getJSON(serverURL, {uri:queryURI, itr:iterNum, nocache: cacheDisabled}, function (data) {
				iterativeProcessData(data);
			});
}

function iterativeProcessData(data) {
	console.log(data);
	var iterNum = data.iteratorNum;
	objectArray = data.plds.insts;
	sumResultNum = objectArray.length;
	$('#sumResultsNum').html(sumResultNum);
	reconstructPagination();	
	
	//若未迭代完，则继续请求
	if(iterNum < 10) {
		iterativeRequest(iterNum);
	}
	//迭代完成
	else if (iterNum == 10){
		$('#page_loader').hide();
		$('#successAlert').show('slow');
	}
}

function displayPLDPage(pageNum) {
	//设置ResultInfo
	$('#sumResultsNum').html(sumResultNum);
	var startCurNum = (pageNum - 1) * 5 + 1;
	var endCurNum = startCurNum + 4;	
	if(endCurNum > sumResultNum) {
		endCurNum = sumResultNum;
	}
	$('#resultType').html('Pay-level domain groups');
	$('#curResultsNum').html(startCurNum + ' - ' + endCurNum);	
	//设置ResultPane
	$('#resultPane').html('');
	$('#resultPane').hide();	//为了显示之后的slideDown效果
	var PLDList = $('<div id="PLDList"></div>');	
	for(var i = startCurNum; i <= endCurNum; i++) {
		PLDList.append(constructPLD(PLDArray[i - 1]));
	}
	$('#resultPane').append(PLDList).slideDown('slow');
	//设置页码
	curPageNum = pageNum;
	refreshPagination(pageNum);
}

function displayObjectPage(pageNum) {
	//设置ResultInfo
	$('#sumResultsNum').html(sumResultNum);
	var startCurNum = (pageNum - 1) * 10 + 1;
	var endCurNum = startCurNum + 9;	
	if(endCurNum > sumResultNum) {
		endCurNum = sumResultNum;
	}
	$('#resultType').html('Objects');
	$('#curResultsNum').html(startCurNum + ' - ' + endCurNum);
	//设置ResultPane
	$('#resultPane').html('');
	$('#resultPane').hide();	//为了显示之后的slideDown效果
	var PLDList = $('<div id="PLDList"></div>');
	for(var i = startCurNum; i <= endCurNum; i++) {
		PLDList.append(constructInst(objectArray[i - 1]));
	}
	$('#resultPane').append(PLDList).slideDown('slow');
	//设置页码
	curPageNum = pageNum;
	refreshPagination(pageNum);
}

function refreshPagination(pageNum) {
	//清楚所有页码样式
	$('#paginationList li').removeAttr('class');
	//设置当前页码为选中
	$('#paginationList #page_' + pageNum).attr('class', 'active');
	//若当前页为第一页或最后一页，则disable前一页或下一页
	$('#paginationList #page_loader').attr('class', 'disabled');
	if(pageNum == 1) {
		$('#paginationList #page_prev').attr('class', 'disabled');
	}
	else if(pageNum == sumPageNum) {
		$('#paginationList #page_next').attr('class', 'disabled');
	}
}

function constructPagination() {
	if(resultIsPLD) {	//若结果为PLD则每页显示5个
		sumPageNum = Math.floor(sumResultNum / 5) + 1;
	}
	else {				//若结果不为PLD则每页显示10个
		sumPageNum = Math.floor(sumResultNum / 10) + 1;
	}
	//构造页码
	var pageElmt = $('<li id="page_prev"></li>').append($('<a>«</a>'));	//前一页
	$('#paginationList').append(pageElmt);
	for(var i = 1; i <= sumPageNum; i++) {
		pageElmt = $('<li id="page_' + i + '"></li>').append($('<a>' + i + '</a>'));
		$('#paginationList').append(pageElmt);
	}
	if(resultIsPLD == false && selfTrainingDone == false) {	//如果self-training未完成，显示loader
		pageElmt = $('<li id="page_loader"></li>').append($('<a rel="tooltip" title="calculating..."><img src="./img/loader.gif"></a>'));	//下一页
		$('#paginationList').append(pageElmt);
	}
	pageElmt = $('<li id="page_next"></li>').append($('<a>»</a>'));	//下一页
	$('#paginationList').append(pageElmt);
	$('#pagination').show();
	$('#paginationList li').bind('click', pageButtonListener);
}

function reconstructPagination() {
	var formerSumPageNum = sumPageNum;
	sumPageNum = Math.floor(sumResultNum / 10) + 1;
	for(var i = formerSumPageNum + 1; i <= sumPageNum; i++) {
		var pageElmt = $('<li id="page_' + i + '"></li>').append($('<a>' + i + '</a>'));
		$('#paginationList #page_' + formerSumPageNum).after(pageElmt);
		formerSumPageNum = i;
	}
	$('#paginationList li').bind('click', pageButtonListener);
}

function pageButtonListener() {
	var curClass = $(this).attr('class');
	if(curClass == 'disabled' || curClass == 'active') {
		return;
	}
	var pageNum = this.id.split('_')[1];
	if(pageNum == 'prev') {
		curPageNum --;
	}
	else if(pageNum == 'next'){
		curPageNum ++;
	}
	else {
		curPageNum = pageNum;
	}
	
	
	if(resultIsPLD) {
		displayPLDPage(curPageNum);
	}
	else {
		displayObjectPage(curPageNum);
	}
}


function constructPLD(pld) {
	var pldContent = $('<div class="alert alert-success"><div><strong class="PLDName">' + pld.pldName + '</strong></div><br/></div>');	
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
	var row = $('<div></div>');
	var docCnt = 0;
	$('<a>',{
		class: "label label-info",
		rel: "tooltip", 
		target: "_Blank",
		title: "Descrided in <strong>" + inst.docCnt +  "</strong> docs. Similarity: <strong>" + inst.similarity + "</strong>", 
		text: inst.displayName,
		href: "http://ws.nju.edu.cn/explorer/entity.jsp?q=" + inst.URI	
	}).appendTo(row);
	row.appendTo(instContent);	
	
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
	if(snippet.subject.match(/^l/)) {//为literal类型		
		var subjectElement = $('<strong>' + snippet.subjectName.substring(1,snippet.subjectName.length - 1) + ' </strong>');			
	}
	else {
		var subjectElement = $('<a>', {
							text: snippet.subjectName + ' ',
							href: "http://ws.nju.edu.cn/explorer/entity.jsp?q=" + snippet.subjectURI,
							target: "_Blank"
						});
	}
	if(snippet.object.match(/^l/)) {//为literal类型			
		var objectElement = $('<strong>' + snippet.objectName.substring(1,snippet.objectName.length - 1) + ' </strong>');
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
	refreshCacheSwitch(true);
}

function refreshCacheSwitch(enableAlert) {
	var cacheStatus = $('#cacheStatus');
	if(cacheDisabled == 0) {		
		cacheStatus.attr('class', 'icon-ok');
		if(enableAlert)
		showOptionsAlert(alertInfo.cacheEnabledInfo);
	}
	else {
		cacheStatus.attr('class', 'icon-remove');
		if(enableAlert)
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

function sortYes() {
	sendRequest(-1, 0);
}

function showOptionsAlert(alertInfo) {
	$('#alertMsg').html(alertInfo);
	$('#optionsAlert').hide();
	$('#optionsAlert').show("fast");
}

function closeOptionsAlert() {
	$('#optionsAlert').hide("fast");
}

function closeSuccessAlert() {
	$('#successAlert').hide("fast");
}