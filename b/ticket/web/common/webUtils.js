isBlank = function(el,msg){
	if(el.value.split(" ").join("") == ""){
		if(msg){
			alert(msg);
			if(el.type != "hidden" && el.style.display != "none"){
				el.focus();
			}
		}
		return true;
	}else{
		return false;
	}
};

isBlanks = function(el,msg){
	if(!el){if(msg){alert(msg);}return true;}
	for(var i = 0; i < el.length; i++){
		if(isBlank(el[i], msg)){
			return true;
		}
	}
	return false;
};

isNumber=function(el,msg){
	if(/^\d+$/.test(el.value)) {
		return true;
	} else {
		if(msg) {
			alert(msg);
			/*el.value='';*/
			el.focus();
		}
		return false;
	}
};

isNumbers = function(el,msg){
	el = el.length ? el : [el];
	for(var i = 0; i < el.length; i++){
		if(!isNumber(el[i], msg)){
			return false;
		}
	}
	return true;
};

addComma = function ( value ) {
    value += '';
    var x = value.split ( '.' ),
        x1 = x [ 0 ],
        x2 = x.length > 1 ? '.' + x [ 1 ] : '',
        re = /(\d+)(\d{3})/;

    while ( re.test ( x1 ) ) {
        x1 = x1.replace ( re, '$1' + ',' + '$2' );
    }
    return x1 + x2;
};

isChecked = function(el, msg){if(!el){if(msg){alert(msg);}return false;}el = el.length ? el : [el];for(var i = 0; i < el.length; i++){if(el[i].checked)return true;}if(msg){alert(msg);el[0].focus();return false;}return true;};

checkedVal = function(el){var val = "";el = el.length ? el : [el];for(var i = 0; i < el.length; i++){if(el[i].checked){if(val) val += ",";val += el[i].value;}}return val;};

checkedCnt = function(el){
	var cnt = 0;
	el = el.length ? el : [el];
	for(var i = 0; i < el.length; i++){
		if(el[i].checked){
			cnt++;
		} } return cnt;
};

checkedIndex = function(el){
	el = el.length ? el : [el];
	for(var i = 0; i < el.length; i++){
		if(el[i].checked){
			return i;
		}
	}
	return -1;
};

isDate=function(el,msg){
	var result = false;
	if(/^(\d{4})[-./]?(0[1-9]|1[0-2])[-./]?(\d{2})$/.test(el.value)){
		var now = new Date(RegExp.$1, (RegExp.$2-1), RegExp.$3);
		if(now.getFullYear() == RegExp.$1 && now.getMonth() == (RegExp.$2-1) && now.getDate() == RegExp.$3 ){
			result = true;
		}
	}
	if(!result){
		if(msg){
			alert(msg);
			el.focus();
		}
	}
	return result;
}
// 영문자,숫자체크
isAlphabetOrNumber=function(el,msg){if(/^[a-zA-Z0-9]+$/.test(el.value)){return true;}else{if(msg){alert(msg);el.focus();}return false;}}
isAlphabet=function(el,msg){if(/^[a-zA-Z]+$/.test(el.value)){return true;}else{if(msg){alert(msg);el.focus();}return false;}};
// 이메일체크
//isEmail=function(el, val, msg){if(/^[^\s,;]+@([^\s.,;]+\.)+[\w-]{2,}$/.test(val)){return true;}else{if(msg){alert(msg);el.focus();}return false;}}
isEmail = function (el, val, msg) {
    //var regex  = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
	if (/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/.test(val)){
		return true;
	}
	else {
		if (msg) {
			alert(msg);
			el.focus();
		}
		return false;
	}
}

//폰 번호 유효성 검사
isPhoneNum=function(phoneNum){
	if(/^(01[016789]{1}|02|0[3-7]{1}[0-9]{1})-?[0-9]{3,4}-?[0-9]{4}$/.test(phoneNum)){
		return true;
	}else{
		return false;
	}
}
//리턴되는 폰 번호 3개로 분리
isReturnPhoneNum=function(fullPhoneNum){
    var noReg = /^[-]|[^0-9-]/gi; 
    
    if(noReg.test(fullPhoneNum)){ 
    	fullPhoneNum = fullPhoneNum.replaceAll('-','')
    	fullPhoneNum = fullPhoneNum.substring(0,3)+"-"+fullPhoneNum.substring(3,6)+"-"+fullPhoneNum.substring(6) 
    }; 

	var tNum = fullPhoneNum.replace(/^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})-?([0-9]{3,4})-?([0-9]{4})$/, "$1-$2-$3"); 
	return tNum;
}

isEqual = function(el1, el2, msg){

	val1 = typeof(el1) == "object" ? el1.value : el1;
	val2 = typeof(el2) == "object" ? el2.value : el2;

	if(val1 == val2){
		return true;
	}else{
		if(msg){
			alert(msg);
			if(typeof(el1) == "object" && el1.type != "hidden" ){
				el1.focus();
			}else if(typeof(el2) == "object" && el2.type != "hidden"){
				el2.focus();
			}
		}
		return false;
	}
};

isImage = function(el, msg) {
	if(el.value.match(/\.(png|jpg|gif|bmp)$/i)){
		return true;
	} else {
		if(msg){
			alert(msg);
			el.focus();
		}
		return false;
	}
}

isFile = function(el, msg) {
	return true;
}

imageViewPopUp = function(src){
	var divEl=document.getElementById("ImagePreViewScale");
	if(!divEl){
		var div1=document.createElement("div");
		div1.style.overflow="hidden";
		div1.style.width="1px";
		div1.style.height="1px";
		var div2=document.createElement("div");
		div2.id="ImagePreViewScale";
		div2.style.width="100px";
		div2.style.height="100px";
		div2.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='/images/logo.gif',sizingMethod=scale)";
		div1.appendChild(div2);
		document.body.appendChild(div1);
		divEl=document.getElementById("ImagePreViewScale");
	}
	divEl.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+src+"',sizingMethod=image)";
	var w=divEl.offsetWidth;var h=divEl.offsetHeight;newWindow=window.open("about:blank","newWin","width="+(w+30)+",height="+(h+30));newWindow.document.write("<html><title>이미지 미리보기</title><body><table style=\"cursor:hand\" onclick=\"javascript:window.close()\" align='center' width='" + w + "' height='"+h+"' style=\"background:url("+src+") no-repeat;\"><tr><td></td></tr></table></body></html>");newWindow.focus();}




lengthMsg = function(objMsg) { var nbytes = 0; for (i=0; i<objMsg.length; i++) { var ch = objMsg.charAt(i); if(escape(ch).length > 4) { nbytes += 2; } else if (ch == '\n') { if (objMsg.charAt(i-1) != '\r') { nbytes += 1; } } else if (ch == '<' || ch == '>') { nbytes += 4; } else { nbytes += 1; } } return nbytes; }
chkMsgLength = function(intMax,objMsg,st) {
	var length = lengthMsg(objMsg.value);
	if(st) st.innerText = length;
	if (length > intMax) {
		alert("최대 " + intMax + "byte까지 입력 할 수 있습니다.\n초과된 글자수는 자동으로 삭제됩니다.\n");
		objMsg.value = objMsg.value.replace(/\r\n$/, "");
		objMsg.value = assertMsg(intMax,objMsg.value,st );
	}
}
assertMsg = function(intMax,objMsg,st) {
	var inc = 0;
	var nbytes = 0;
	var msg = "";
	var msglen = objMsg.length;
	for (i=0; i<msglen; i++) {
		var ch = objMsg.charAt(i);
		if (escape(ch).length > 4) {
			inc = 2;
		} else if (ch == '\n') {
			if (objMsg.charAt(i-1) != '\r') {
				inc = 1;
			}
		} else if (ch == '<' || ch == '>') {
			inc = 4;
		} else {
			inc = 1;
		}
		if ((nbytes + inc) > intMax) {
			break;
		}
		nbytes += inc; msg += ch;
	}
	if(st) st.innerHTML = nbytes;
	return msg;
}



function getCookie( name ){
	var nameOfCookie = name + "=";
	var x = 0;
	while ( x <= document.cookie.length ){
		var y = (x+nameOfCookie.length);
		if ( document.cookie.substring( x, y ) == nameOfCookie ) {
			if ( (endOfCookie=document.cookie.indexOf( ";", y )) == -1 )
			endOfCookie = document.cookie.length;
			return unescape( document.cookie.substring( y, endOfCookie ) );
		}
		x = document.cookie.indexOf( " ", x ) + 1;
		if ( x == 0 )
		break;
	}
	return "";
}

function setCookie(name, value, expiredays ){
	var todayDate = new Date();
	todayDate.setDate( todayDate.getDate() + expiredays );
	document.cookie = name + "=" + escape( value ) + "; path=/; expires=" + todayDate.toGMTString() + ";"
}

function enterKeyEvent(id, fn) {
	$("#"+id).keyup(function(event){
		if(event.keyCode == 13) {
			fn();
		}
	});
}

function dateValidChk() {
    var valid = true;
    $(".vDate").each(function(){
        if(this.value) {
            if(!isDate(this, "유효하지 않은 일자입니다. 일자를 정확히 입력해주세요.\nex) 2015-10-05")) {valid = false; return false;}
            if(/^(\d{4})[-./]?(0[1-9]|1[0-2])[-./]?(\d{2})$/.test(this.value)){
                this.value = RegExp.$1 + "-" + RegExp.$2 + "-" + RegExp.$3;
            }
        }
    });
    return valid;
}

function hourValidChk() {
	var valid = true;
	$(".vHour").each(function(){
		if(this.value) {
			if(!isNumber(this, "시간을 숫자로만 정확히 입력해주세요.")) {valid = false; return false;}
			if(parseInt(this.value, 10) > 23) {
				alert("시간은 00 ~ 23 시까지 입력할 수 있습니다.");
				this.focus();
				valid = false;
				return false;
			}
			if(this.value.length == 1){
				this.value = "0" + this.value;
			}
		}
	});
	return valid;
}

function minuteValidChk() {
	var valid = true;
	$(".vMinute").each(function(){
	    if(this.value) {
	    	if(!isNumber(this, "분을 숫자로만 정확히 입력해주세요.")) {valid = false; return false;}
	        if(parseInt(this.value, 10) > 59) {
	            alert("분은 00 ~ 59 분까지 입력할 수 있습니다.");
	            this.focus();
	            valid = false;
	            return false;
	        }
	        if(this.value.length == 1){
	            this.value = "0" + this.value;
	        }
	    }
	});
	return valid;
}

function getWeekDay(datestr, seperator, option) {
    try {
        var date_arr = getYmdArr(datestr, seperator);
        var obj_date = new Date(date_arr[0],date_arr[1]-1,date_arr[2]);
        if(option == '0') {
            return obj_date.getDay();
        }
        else if(option == '1') {
            var week_str = new Array("일","월","화","수","목","금","토");
            return week_str[obj_date.getDay()];
        }
    }
    catch(e) {
        //alert('udfMainFrm.js : '+e);
    }
}

function getYmdArr(dateStr, seperator) {
    try {
        if(seperator == '') {
            var rtnArr = new Array();
            rtnArr[0] = dateStr.substr(0,4);
            rtnArr[1] = dateStr.substr(4,2);
            rtnArr[2] = dateStr.substr(6,2);
            return rtnArr;
        }
        else {
            return dateStr.split(seperator);
        }
    }
    catch(e) {
        //alert('udfMainFrm.js : '+e);
    }
}

String.prototype.trim = function()
{
	return this.replace(/(^\s*)|(\s*$)/gi, "");
}

String.prototype.replaceAll = function(str1, str2)
{
	var temp_str = this.trim();
	temp_str = temp_str.replace(eval("/" + str1 + "/gi"), str2);
	return temp_str;
}

// 숫자만 입력 체크 - Delete, BackSpace등 기능키 포함.
onlyNumber = function (event){
    event = event || window.event;
    var keyID = (event.which) ? event.which : event.keyCode;
    if ( (keyID >= 48 && keyID <= 57) || (keyID >= 96 && keyID <= 105) || keyID == 8 || keyID == 9 || keyID == 46 || keyID == 37 || keyID == 39 )
        return;
    else
        return false;
}

removeChar = function (event) {
    event = event || window.event;
    var keyID = (event.which) ? event.which : event.keyCode;
    if ( keyID == 8 || keyID == 46 || keyID == 37 || keyID == 39 )
        return;
    else
        event.target.value = event.target.value.replace(/[^0-9]/g, "");
}

loadingOpen = function(msg) {
	var loadobj = $("#loadingLayer");
	if (msg == undefined || msg == null || msg == "") msg = "로딩중입니다. 잠시만 기다려 주세요.";
	if ($("body > div").find("[id=loadingLayer]").length == 0) {
		var loadhtml	= "<div class=\"loding_text\">"
			+ "	       <p><img src=\"" + DeployPhaseUtils.convertUrl("https://cdnticket.melon.co.kr/resource/image/web/common/ic_loading_pc.gif") + "\"/>"
			+ "	       <p class=\"txt\">" + msg + "</p>"
			+ "    </div>"
			+ "    <div class=\"loding_back\"></div>";

		loadobj     = $("<div/>").addClass("loding_sec");
		loadobj.html(loadhtml);
		loadobj.attr("id", "loadingLayer").appendTo("body");
	}
}

loadingClose = function() {
	$("#loadingLayer").remove();
}

layerPopup = function (pname, phtml, width, top, left) {
	var popobj = $("#" + pname);
	if ($("body").find("[id=" + pname + "]").length == 0) {
		var laydata			= {};
		laydata["width"]	= width;
		laydata["top"]		= top;
		if (left != null && left != undefined) laydata["left"] = left;

		popobj     = $("<div></div>");
		popobj.addClass("layerPop layer_personal_info");
		popobj.css(laydata);
		popobj.attr("id", pname).appendTo("body");
	}
	else {
		popobj.empty();
	}

	popobj.html(phtml);
	popobj.show();
}

layerPopupClose = function (pname) {
	$("#" + pname).remove();
}

popupAddress = function (zipno, addr, addrdtl) {
    $.ajax({
        type           : "POST"
        , url          : "/common/layer/searchAddress.htm"
        , async        : false
        , data         : {zipnoField : zipno, addrField : addr, dtlField : addrdtl}
        , success      : function(result) {
            layerPopup("searchAddressPopup", result, "500px", "50px", "70px");
        }
        , error        : function(e) {
            alert("우편번호 조회중 오류가 발생하였습니다. 관리자에게 문의해 주십시오.");
        }
    });
}

popupCancelFee = function (prodId, pocCode, perfDate) {
    $.ajax({
        type           : "POST"
        , url          : "/common/layer/rsrvCancelFee.htm"
        , async        : false
        , data         : {prodId : prodId, pocCode : pocCode, perfDate : perfDate}
        , success      : function(result) {
            layerPopup("rsrvCancelFeePopup", result);
        }
        , error        : function(e) {
            alert("조회중 오류가 발생하였습니다. 관리자에게 문의해 주십시오.");
        }
    });
}

popupSeatLocation = function (rsrvSeq, chk, perfName) {
    $.ajax({
        type           : "POST"
        , url          : "/common/layer/rsrvInfo.htm"
        , async        : false
        , data         : {rsrvSeq : rsrvSeq, chk : chk, perfName : perfName}
        , success      : function(result) {
            layerPopup("searchSeatLocationPopup", result, "500px", "50px", "70px");
        }
        , error        : function(e) {
            alert("조회중 오류가 발생하였습니다. 관리자에게 문의해 주십시오.");
        }
    });
}

popupAgreement = function (no, top) {
	var topPx = (top == undefined)?"50px":top + "px";
    $.ajax({
        type           : "GET"
        , url          : "/agreement/ajax/terms.htm?no="+no
        , async        : false
        , success      : function(result) {
            layerPopup("agreementPopup", result, "590px", topPx, "25px");
        }
        , error        : function(e) {
            alert("조회중 오류가 발생하였습니다. 관리자에게 문의해 주십시오.");
        }
    });
}

/*
 * input 길이 제한 (한글 1바이트로 계산)
 * example: <input onKeyup="str_len_chk(this, 128)" type="text">   // 128자로 제한하고 넘는것은 삭제.
 * mysql varchar 은 사용할 필요없음.
 */
function str_len_chk(srcObj, limit)
{
	var str = srcObj.value;
	var len = 0;
	var newStr = '';
	var modified = false;
	for (var i=0 ; i<str.length ; i++) {
	    var chCode  = str.charCodeAt(i);
	    var chVal   = str.charAt(i);

	    if ( chCode>= 0 && chCode<256 ) {
		    if (len+1 > limit) {
		    	modified = true;
		    	break;
		    }
		    else {
		    	newStr = newStr + chVal;
		    }
	    	len ++;
	    }
	    else {
		    if (len+1 > limit) {
		    	modified = true;
		    	break;
		    }
		    else {
		    	newStr = newStr + chVal;
		    }
	    	len += 1;
	    }
	}
	if(modified) {
		srcObj.value = newStr;
	}
	return len;
}

//enabledSet (공통으로 maskKeydown 지정으로 한글 입력 방지)
//숫자		: N
//영문		: A
//영숫자	: AN
//이메일	: N/A
//영문자 중 대문자만 입력받도록 할 경우 : input style="text-transform:uppercase;" 로 설정
//예제 : <input type="text" id="xx" onKeyDown="maskKeydown(this, 'N', 10)" onKeyPress="return maskKeyPress(event, 'AN')" onFocusout="maskFocusout(this, 'AN', 10)">

function maskKeydown(inpObj, hangulYn, maxLen) {
	var timeId;
	var valueCheck = function () {
		var value = inpObj.value;
		if (maxLen != null && value.length > maxLen) {
			inpObj.value = value.slice(0, maxLen);
		}
		if (hangulYn == "N") {
			var inValid = value.match (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g);
			var reValue = value;

			if (inValid) {
				reValue = value.match (/[^ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g);
				inpObj.value = reValue ? reValue.join("") : "";
			}
		}
	};
	clearTimeout(timeId);
	timeId = setTimeout(function() {
		valueCheck();
	}, 1);
}

function maskFocusout(inpObj, enabledSet, maxLen) {
	var newVal = "";
	for (var i=0; i < inpObj.value.length; i++) {
		var chr = inpObj.value.charAt(i);
		var key = chr.charCodeAt(0);

		if (enabledSet.indexOf("S") > -1) {
			if ((key >= 33 && key <= 47) || (key >= 58 && key <= 64) || (key >= 91 && key <= 96) || (key >= 123 && key <= 126)) {
				newVal += chr;
			}
		}
		if (enabledSet.indexOf("A") > -1) {
			if ((key >= 65 && key <= 90) || (key >= 97 && key <= 122)) {
				newVal += chr;
			}
		}
		if (enabledSet.indexOf("N") > -1) {
			if (key >= 48 && key <= 57) {
				newVal += chr;
			}
		}
		if (maxLen != null && newVal.length >= maxLen) break;
	}
	inpObj.value = newVal;
}

function maskKeyPress(event, enabledSet) {
	var ret = false;
	var key = (window.event ? window.event.keyCode : event.which);

	if (enabledSet.indexOf("S") > -1) {
		// 특수 문자
		if ((key >= 33 && key <= 47) || (key >= 58 && key <= 64) || (key >= 91 && key <= 96) || (key >= 123 && key <= 126)) {
			ret = true;
		}
	}
	if (enabledSet.indexOf("A") > -1) {
		// 영문자
		if ((key >= 65 && key <= 90) || (key >= 97 && key <= 122)) {
			ret = true;
		}
	}
	if (enabledSet.indexOf("N") > -1) {
		// 숫자
		if (key >= 48 && key <= 57) {
			ret = true;
		}
	}
	return ret;
}

/**
 * via melon-ticket-common-model/src/main/java/com/melon/ticket/common/util/StringUtil.escapeHtmlString
 * @param s
 * @returns
 */
function reEscapeHtmlString(s) {
    var s1 = s;
    if(s1 == null)
        return null;
    if(s1.indexOf("&amp;") != -1)
        s1 = s1.replace(/&amp;/g, "&");
    if(s1.indexOf("&lt;") != -1)
        s1 = s1.replace(/&lt;/g, "<");
    if(s1.indexOf("&gt;") != -1)
        s1 = s1.replace(/&gt;/g, ">");
    if(s1.indexOf("&quot;") != -1)
        s1 = s1.replace(/&quot;/g, "\"");
    return s1;
};

/**
 * 기간 정보를 arr로 쪼갬
 * @param string periodInfo
 * @reuturns Array[2]
 */
function getPeriodArr(periodInfo) {
    var delim = periodInfo.split(/-/).length == 2 ? '-' : '~';
    if(delim == '~'){ periodInfo = periodInfo.replace(/-/g,'.'); }
    var dateRegex = new RegExp('\s*'+delim+'\s*');
   return periodInfo.split(dateRegex);
};

/**
 * location.search의 query 값을 가져옴.
 * @param string variable (원하는 파라미터명)
 * @example getQueryVariable('cupnId');
 * @return string value
 */
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    //if( window.console ) { console.log('Query variable %s not found', variable); }
    return '';
}


/**
 * 힌글, 영어만 입력되는지 validation
 * validForKorEng(text);
 * @return boolean
 * */
function validForKorEng(text){
    var denyChar = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|\*]+$/
    if (denyChar.test(text)) {
        return true;
    }
    return false;
}

/**
 * 힌글만 입력되는지 validation
 * validForKor(text);
 * @return boolean
 * */
function validForKor(text){
	var denyChar = /[ㄱ-ㅎㅏ-ㅣ가-힣]/g;
	if (denyChar.test(text)) {
		return true;
	}
	return false;
}

/**
 * 공백(스페이스 바) validation
 * validForSpace(text);
 * @return boolean
 * */
function validForSpace(str) {
	if(str.search(/\s/) !== -1) {
		return true; // 스페이스가 있는 경우
	} else {
		return false; // 스페이스 없는 경우
	}
}



/**
 * xss 공격 관련 특수문자 escape
 * @param string
 * @returns {string}
 */
function escapeHtml(string) {
	var entityMap = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
		'/': '&#x2F;',
		'`': '&#x60;',
		'=': '&#x3D;'
	};

	return String(string).replace(/[&<>"'\/]/g, function (s) {
		return entityMap[s];
	});
}

/**
 * [{},{},...] 일 때, 각 object안에 있는 string 값들에 대해 xss 취약점 보완
 * @param {array} arr
 */
function xssHtmlObj(arr) {
	if (arr.constructor != Array) {
		console.log('Not Array');
		return false;
	}
	arr.forEach(function(obj) {
		if (obj.constructor != Object) {
			console.log('Not Object');
			return false;
		}
		$.each(obj, function(k, v) {
			if (typeof v === 'string') {
				obj[k] = escapeHtml(v);
			}
		});
	});
}