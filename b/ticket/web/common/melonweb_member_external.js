/**
 * 쿠키 설정
 * @param name
 * @param value
 * @param expires
 * @param path
 * @param domain 
 */
function setCookie(name, value, expires, path, domain) {
	if(expires==null || expires==""){
		document.cookie = name + "=" + escape(value) + ";" + "path=" + path + ";domain=" + domain;
	}else{
		var todayDate = new Date();
		todayDate.setDate(todayDate.getDate() + expires);
		document.cookie = name + "=" + escape(value) + ";" + "path=" + path + ";domain=" + domain + ";expires=" + todayDate.toGMTString();
	}
}

/**
 * 쿠키 설정(시간단위)
 * @param name
 * @param value
 * @param expires
 * @param path
 * @param domain
 */
function setFkCookie(name, value, expires, path, domain) {
	if(expires==null || expires==""){
		document.cookie = name + "=" + escape(value) + ";" + "path=" + path + ";domain=" + domain;
	}else{
		var todayDate = new Date();
		todayDate.setHours(todayDate.getHours() + expires);
		document.cookie = name + "=" + escape(value) + ";" + "path=" + path + ";domain=" + domain + ";expires=" + todayDate.toGMTString();
	}
}


/**
 * 실명인증 쿠키 설정
 * @param name
 * @param value
 * @param expires
 * @param path
 * @param domain
 */
function setRealCookie(name, value) {
	document.cookie = name + "=" + escape(value) + ";path=/;domain=.melon.com";
}

/**
 * 쿠기 찾기
 * @param Name
 * @returns
 */
function getCookie(Name) {
	var i,x,y,arrayCookies=document.cookie.split(";");
	for (i=0;i<arrayCookies.length;i++){
		x=arrayCookies[i].substr(0,arrayCookies[i].indexOf("="));
		y=arrayCookies[i].substr(arrayCookies[i].indexOf("=")+1);
		x=x.replace(/^\s+|\s+$/g,"");
		if (x==Name){
			return unescape(y);
		}
	}
	return '';
}

/**
 * 멜론 로그인 여부
 * @returns {Boolean}
 */
function isMelonLogin() {
    var memberKey = getMemberKey("memberKey");
    if (memberKey == "undefined" || memberKey == undefined || memberKey.length <= 0) return false;
    return true;
}

function getMACHeaderCookie(){
    return getCookie('MAC');
}


/**
 * 회원키
 * @returns
 */
function getMemberKey() {
    return getMLCPHeaderCookie("memberKey");
}

/**
 * 회원아이디
 * @returns
 */
function getMemberId() {
	return getMLCPHeaderCookie("memberId");
}

/**
 * 회원닉네임
 * @returns
 */
function getMemberNickName() {
	var nickName = getDisplayId();
    if(!nickName){
    	return "닉네임 없음";
    }
    return nickName;
}

/**
 * 통합계정후 닉네임
 * @returns {*}
 */
function getDisplayId() {
    return getMLCPHeaderCookie("displayId");
}

/**
 *
 * 통합 계정 후 dpId 함수
 * @returns {*}
 */
function getDisplayLoginId() {
    return getMLCPHeaderCookie("displayLoginId");
}

/**
 * 회원나이
 * @returns
 */
function getMemberAge() {
	return getApiMemberProperties("getMemberAge");
}

/**
 * 회원성별
 * @returns
 */
function getMemberSex() {
	return getApiMemberProperties("getMemberSex");
}
/**
 * 회원생년원일
 * @returns {String}
 */
function getMemberBirthDay() {
    var age = getMemberAge();
    var curDate = new Date();
    var year = curDate.getYear();
    var birth = year - age + 1;
    return birth + "0101";
}

/**
 * 회원 성인여부
 * @returns {String} : 0:미성년자, 1:성인 실명인증, 2:성인 실명미인증, 3: 미성년 실명인증
 */
function isMemberAdult() {
    var memberAge = getMemberAge();
    var realNameYn = isRealNameFlag();
    if (memberAge < 19) {
        return "0";
    } 
    else if (memberAge >= 19 && realNameYn == "Y") {
        return "1";
    } 
    else if (memberAge >= 19 && realNameYn == "N") {
        return "2";
    }
    else if (memberAge < 19 && realNameYn == "Y") {
        return "3";
    }
}

/**
 * 회원 성인인증에대한 비밀번호 옵션
 * @returns {String} : 0:비밀번호 옵션설정 안함, 1:비밀번호 옵션시 매번 물어보기, 2:비밀번호 옵션시 자동저장
 */
function isAdultPwdOption() {
	// var adultPwdOption = getMUACHeaderCookie("adultPwdOption");
	// if(adultPwdOption==undefined){
	// 	return "0";
	// }
	// return adultPwdOption;

	return "0";

}

/**
 * 회원 실명인증여부
 * @param reqType
 * @returns {*}
 */
function isRealNameFlag(reqType) {
	return getApiMemberProperties("getRealNameYn");
}
/**
 * 인증(본인/성인) 플래그 조회
 * @returns {String} 			:{-1(오류), 0(성인), 1(성인), 2(성인), 3(미성년), 4(미성년)}
 *     - 본인확인 인증여부 			:  오류        X,       O,       O,      O,       X
 *     - 성인인증여부			 	:  오류        X,       O,       X,      X,       X
 */
function getMemberAuthFlg(){
	var currentProtocol = "";
	try{
		currentProtocol = document.location.href.split(":")[0];
	}catch(e){
		currentProtocol = "http";
	}
	var memberAge = getMemberAge();
	var realNameFlg = isRealNameFlag();
	var adultAuthentication = getAdultAuthentication();
	if(realNameFlg == "Y"){
		if(memberAge>=19){
			if(isMelonLogin()){
				var authFlg = "2";
				$.ajax({
					url : "/common/ajax/realname_isAuthCk.json", 
					type : "POST",
					data : {"memberKey" : getMemberKey(), cpId:melon.getPocId(), viewType:'juvenileProtection'},
					dataType:"json",
					crossDomain: true,
					xhrFields: {withCredentials: true}, // 쿠키 전송을 위해 활성화        					
					async : false,
					error : function(jqXHR, textStatus, errorThrown){
						alert("오류코드 : ["+jqXHR.status+"]\n오류내용 : "+errorThrown);
						authFlg = "-1";
					},
					success: function(json) {
						if(json.resultCode=='000000'){
							authFlg = "1";
						}else{
							if(json.errorCode=='AUR003'){
								if(json.adultPwdOption=='0'){
									authFlg = "5";
								}else{
									authFlg = "6";
								}
							}else if(json.errorCode=='AUR007'){
								authFlg = "2";
							}else{
								authFlg = "2";
							}
						}
					}
				});

				return authFlg;
			}else{
				return "2";
			}
		}else{
			return "3";
		}
	}else{
		if(memberAge>=19){
			return "0";
		}else{
			return "4";
		}
	}
}


/**
 * 등급이미지
 * @returns
 */
function getGradeImageUrl() {
	return getApiMemberProperties("getGradeImageUrl");
}

/**
 * 등급
 * @returns
 */
function getGrade() {
	return getApiMemberProperties("getGrade");
}

/**
 * 성인인증 여부
 * @return
 */
function getAdultAuthentication() {
	return getApiMemberProperties("getAdultAuth");
}

/**
 * androidCarrier가 0이면 폰번호, 1이면 현재 회원db의 min번호 또는 가상min번호
 */
function getAndroidCkMdn() {
	return getMUADHeaderCookie("androidCkMdn");
}

/**
 * dcf지원여부( 0:미지원 or 1:지원)
 * Y/N
 * @returns
 */
function getAndroidCkDcf() {
	return getMUADHeaderCookie("androidCkDcf");
}

function chkMACAuth() {
    var buf = getCookie("MAC");

    return (buf == null || buf == '') ? false : true;
}
/**
 * 회원 Dj 여부
 * @returns
 */
function getMemberDjYn() {
	return getMLCPHeaderCookie("memberDjYn");
}
/**
 * 회원 아티스트 여부
 * @returns
 */
function getMemberArtistId() {
	return getMLCPHeaderCookie("memberArtistId");
}

function getMemberToken() {
	return getMLCPHeaderCookie("token");
}

function getFacebookConnectYn() {
	return getMLCPHeaderCookie("facebookConnect");
}

function getDisplayId() {
	return getMLCPHeaderCookie("displayId");
}

function getMemberType() {
	return getMLCPHeaderCookie("memberType");
}


var singletonCookieMUAD;

function getCookieMUAD(){
    if(singletonCookieMUAD==undefined){
        var strBuf = getCookie('MUAD');
        if(strBuf != null){
            singletonCookieMUAD = Base64.decode(strBuf);
        }
    }
    return singletonCookieMUAD;
}

function getMUADHeaderCookie(Name){
    var cookieNameArray = new Array();
    var strBuf = getCookieMUAD();
    if(strBuf == null) return null;

    var arrStr = strBuf.split(";");
    cookieNameArray['androidCkMdn'] = arrStr[0];
    cookieNameArray['androidCkDcf'] = arrStr[1];
    return cookieNameArray[Name];
}

function setMuidWindowName(name){
	window.name = name;
}

/**
 * 회원의 DJ여부 정보에 대한 MLCP cookie 정보를 가져온다.
 * @param Name
 * @returns
 *
 * ex)getMLCPHeaderCookie("memberKey");
 */
function getMLCPHeaderCookie(Name) {
    var cookieNameArray = new Array();
    var strBuf = unescape(decodeURIComponent(Base64.decode(getCookie("MLCP"))));
    if (strBuf == null) return null;

    var arrStr = strBuf.split(";");
    cookieNameArray['memberKey'] = arrStr[0];
    cookieNameArray['memberId'] = arrStr[1];
    cookieNameArray['memberDjYn'] = arrStr[2];
    cookieNameArray['memberArtistId'] = arrStr[3];
    cookieNameArray['token'] = arrStr[4];
    cookieNameArray['facebookConnect'] = arrStr[5];
    cookieNameArray['displayId'] = arrStr[7];
    cookieNameArray['memberType'] = arrStr[8];
    cookieNameArray['displayLoginId'] = arrStr[9];
    cookieNameArray['cookieLoginType'] = arrStr[10];
    return cookieNameArray[Name];
}

function domainInfo() {
	var arrayDomain = [];
	arrayDomain[0] = DeployPhaseUtils.convertUrl("http://member.melon.com");
	arrayDomain[1] = DeployPhaseUtils.convertUrl("https://member.melon.com");
	return arrayDomain;
}

/**
 * 쿠키 제거 되고 API 대처
 * @param propertiesName
 * @returns {null}
 */
function getApiMemberProperties(method) {
	var result = null;
	$.ajax({url: "/member/"+method+".json", async:false,
		success	: function(response) {result = response.data;}
	});
	return result;
}

/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/

var Base64 = {

	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;

		input = Base64._utf8_encode(input);

		while (i < input.length) {

			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}

			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

		}

		return output;
	},

	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while (i < input.length) {

			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output = output + String.fromCharCode(chr1);

			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}

		}

		output = Base64._utf8_decode(output);

		return output;

	},

	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	},

	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

		while ( i < utftext.length ) {

			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}

		}

		return string;
	}
}

/**
 * 폰꾸미기에서 사용할 실명인증 띄우기 함수
 * viewType:changeName(개명), charge:유료결제, board:게시판, nineteen:19금
 */
//function nicePhoneDeco(viewType){
//	var arrayDomain = domainInfo();
//	var sslMemberDomain = arrayDomain[1];
//	if(sslMemberDomain==undefined){
//		sslMemberDomain = "https://member.melon.com";
//	}
//
////	var url = sslMemberDomain+"/muid/web/popup/realnamepopup_inform.htm?viewType="+viewType+"&deco=Y";
//	var url = sslMemberDomain+"/muid/web/popup/realnamepopup_inform.htm?viewType="+viewType+"&deco=Y";
//	document.location.href = url;
//}
/**
 * viewType:changeName(개명), downloadCharge:곡다운로드 유료결제, charge:유료결제, board:게시판, nineteen:19금, mma:멜론뮤직어워드, adultPwdSetPop:성인콘텐츠에 대한 비밀번호설정팝업, adultPwdValidPop:성인콘텐츠에 대한 비밀번호 일치여부 팝업
 * serviceAuth,infoAuth : 본인확인
 * isReload:Y(바닥창 reload여부,
 * 				단, isForcePop의 값이 Y이면서 viewType이 charge,changeName,downloadCharge,nineteen인 경우에 한해서 reload된다.
 * 					or isContentType이 영상인 경우도 해당된다.)
 * callback:일반적인 설정 후 호출 함수
 * removeCallback:청소년유해 매체물 제거 함수
 * isForcePop:downloadCharge or nineteen인경우 location.href되지만 true로 설정할 경우 popup으로 호출한다.
 * isContentType: viewType(adultPwdValidPop,adultPwdSetPop)인 경우 영상이면 reload해준다.기본은 곡. 단, isReload가 Y값이어야 함.)
 * 00 or undefined:곡,01:영상
 * )
 *
 */
function niceAuthPopTicket(viewType,reqUrl,isReload,callback,removeCallback,isForcePop,isContentType,encMemberId,cpId){
	var httpMemberDomain = httpMemberDomain!=undefined?httpMemberDomain:DeployPhaseUtils.convertUrl("http://member.melon.com");
	var arrayDomain = domainInfo();
	var sslMemberDomain = arrayDomain[1];
	if(sslMemberDomain==undefined){
		sslMemberDomain = DeployPhaseUtils.convertUrl("https://member.melon.com");
	}

	var width = 600;
	var height = 464;
	if(!(viewType=="changeName" || viewType=="panConn" || viewType=="loginAuth" || viewType=="serviceAuth" || viewType=="infoAuth" || viewType=="downloadCharge" || viewType=="charge" || viewType=="board" || viewType=="nineteen" || viewType=="mma" || viewType=="adultPwdSetPop" || viewType=="adultPwdValidPop" || viewType=="juvenileProtection" || viewType=="poll")){
		alert("잘못된 파라미터입니다.");
		return;
	}

	if(viewType=="adultPwdSetPop"){
		height = 643;
	}else if(viewType=="adultPwdValidPop"){
		height = 520;
	}else if(viewType=="charge" || viewType=="downloadCharge"){
		height = 450;
	}else if(viewType=="nineteen" || viewType=="juvenileProtection"){
		height = 570;
	}else if(viewType=="mma"){
    	width = 500;
    	height = 640;
	}else if(viewType=="poll"){
    	width = 500;
    	height = 680;
	}

//	var url = sslMemberDomain+"/muid/family/ticket/popup/web/realnamepopup_inform.htm?viewType="+viewType;
//	if(viewType=="adultPwdSetPop"){
//		url = httpMemberDomain+"/muid/web/popup/personadultpopup_informAuthPwdOptSetting.htm";
//		alert("청소년유해매체물 이용을 위한 비밀번호가 설정되어있지 않습니다.\n비밀번호 설정 후 이용해주세요.");
//	}else if(viewType=="adultPwdValidPop"){
//		url = httpMemberDomain+"/muid/web/popup/personadultpopup_informPwdComp.htm";
//	}
    var url = reqUrl;
    
	if(isReload){
		if(viewType=="adultPwdSetPop" || viewType=="adultPwdValidPop"){
			if(isContentType=="01"){
				if(url.indexOf("?") > -1){
					url = url+"&isReload=Y";
				}else{
					url = url+"?isReload=Y";
				}
			}
		}else{
			if(url.indexOf("?") > -1){
				url = url+"&isReload=Y";
			}else{
				url = url+"?isReload=Y";
			}
		}
	}

	//일반적인 콜백함수.
	if(callback!=undefined && callback!=""){
		if(url.indexOf("?") > -1)
			url = url+"&callback="+callback;
		else
			url = url+"?callback="+callback;
	}

	//청소년 유해매체물 제거를 위한 함수
	if(removeCallback!=undefined && removeCallback!=""){
		if(url.indexOf("?") > -1)
			url = url+"&removeCallback="+removeCallback;
		else
			url = url+"?removeCallback="+removeCallback;
	}

	if(isContentType!=undefined && isContentType!=""){
		if(url.indexOf("?") > -1)
			url = url+"&contentType="+isContentType;
		else
			url = url+"?contentType="+isContentType;
	}

	if(encMemberId!=undefined && encMemberId!=""){
		if(url.indexOf("?") > -1)
			url = url+"&encMemberId="+encMemberId;
		else
			url = url+"?encMemberId="+encMemberId;
	}

	if(cpId!=undefined && cpId!=""){
		if(url.indexOf("?") > -1)
			url = url+"&cpId="+cpId;
		else
			url = url+"?cpId="+cpId;
	}

	// set viewType
	try {
		if(viewType != undefined && viewType != "") {
			if(url.indexOf("?") > -1)
				url = url+"&viewType="+viewType;
			else
				url = url+"?viewType="+viewType;
		}
	} catch(e) {}
	
	// set cpId
	try {
		var _pocId = MELON.WEBSVC.POC.getPocId();
		if(_pocId != undefined && _pocId != "") {
			if(url.indexOf("?") > -1)
				url = url+"&cpId="+_pocId;
			else
				url = url+"?cpId="+_pocId;
		}
	} catch(e) {
		if(url.indexOf("?") > -1)
			url = url+"&cpId=WP15";
		else
			url = url+"?cpId=WP15";
	}
	
	// set memberKey
	try {
		var _memberKey = getMemberKey();
		if(_memberKey != undefined && _memberKey != "") {
			if(url.indexOf("?") > -1)
				url = url+"&memberKey="+_memberKey;
			else
				url = url+"?memberKEy="+_memberKey;
		}
	} catch(e) {
		alert("로그인 후 사용해주세요.");
		return;
	} 
	isForcePop = true;
	if(viewType=="downloadCharge" || viewType=="nineteen" || viewType=="juvenileProtection"){
		if(isForcePop){
			var urlOpt = "scrollbars=auto, resizable=yes,location=no, width="+width+",height="+height+", left=20, top=20";
			window.open(url, "_REALNAME_AUTHENTICATION_POP","app_,"+urlOpt);
		}else{
			document.location.href = url;
		}
	}else{
		var urlOpt = "scrollbars=auto, resizable=yes,location=no, width="+width+",height="+height+", left=20, top=20";
		window.open(url, "_REALNAME_AUTHENTICATION_POP","app_,"+urlOpt);
	}
}

var MemberCommFunc = {
	memberAuthPop : function(encMemberId,cpId){
		var httpMemberDomain = httpMemberDomain!=undefined?httpMemberDomain:DeployPhaseUtils.convertUrl("http://member.melon.com");
		var arrayDomain = domainInfo();
		var sslMemberDomain = arrayDomain[1];
		if(sslMemberDomain==undefined){
			sslMemberDomain = DeployPhaseUtils.convertUrl("https://member.melon.com");
		}
		
		var width = 600;
		var height = 464;	
		var url = sslMemberDomain+"/muid/web/popup/memberauth_inform.htm";
		if(encMemberId!=undefined && encMemberId!=""){
			if(url.indexOf("?") > -1)
				url = url+"&encMemberId="+encMemberId;
			else
				url = url+"?encMemberId="+encMemberId;
		}

		if(cpId!=undefined && cpId!=""){
			if(url.indexOf("?") > -1)
				url = url+"&cpId="+cpId;
			else
				url = url+"?cpId="+cpId;
		}
		
		var urlOpt = "scrollbars=auto, resizable=yes,location=no, width="+width+",height="+height+", left=20, top=20";
		window.open(url, "_MEMBERINFO_AUTHENTICATION_POP","app_,"+urlOpt);	
	}
};


/**
 *
 * @param locationType(01:팝업창을 닫고 바닥창을 returnPage로 이동,02:팝업창을 닫지않고 바닥창을 메인으로 이동 팝업창은 returnPage로 이동,"":메인으로이동)
 * @param returnPage("":메인으로 이동,url:해당 url로 이동)
 */
function logout(locationType,returnPage){
	var logoutFrm = $('<form method="post" name="menuLoginFrm"></form>');
	logoutFrm.appendTo('body');

	var inputReturnPage = $('<input />');
	inputReturnPage.attr("name", "locationType");
	inputReturnPage.attr("value", typeof locationType != 'undefined'?locationType:"");
	inputReturnPage.appendTo(logoutFrm);

	inputReturnPage = $('<input />');
	inputReturnPage.attr("name", "returnPage");
	inputReturnPage.attr("value", typeof returnPage != 'undefined'?returnPage:"");
	inputReturnPage.appendTo(logoutFrm);

	//var url = "/muid/web/logout/logout_inform.htm";
	var url = "/muid/family/ticket/logout/web/logout_inform.htm";
	
	var currentProtocol = document.location.href;
	if(currentProtocol.indexOf("member.melon.com")<0){
		url = DeployPhaseUtils.convertUrl("https://member.melon.com") + url;
	}
	logoutFrm.attr("action" ,url);
	logoutFrm.submit();
}

//PCID 설정하기
function Nethru_getCookieVal(offset) {
	  var endstr = document.cookie.indexOf (";", offset);
	  if (endstr == -1)
	    endstr = document.cookie.length;

	  return unescape(document.cookie.substring(offset, endstr));
	}

	function Nethru_SetCookie(name, value) {
	  var argv = Nethru_SetCookie.arguments;
	  var argc = Nethru_SetCookie.arguments.length;
	  var expires = (2 < argc) ? argv[2] : null;
	  var path = (3 < argc) ? argv[3] : null;
	  var domain = (4 < argc) ? argv[4] : null;
	  var secure = (5 < argc) ? argv[5] : false;
	  document.cookie = name + "=" + escape (value) +
	    ((expires == null) ? "" : ("; expires="+expires.toGMTString())) +
	    ((path == null) ? "" : ("; path=" + path)) +
	    ((domain == null) ? "" : ("; domain=" + domain)) +
	    ((secure == true) ? "; secure" : "");
	}

	function Nethru_GetCookie(name) {
	  var arg = name + "=";
	  var alen = arg.length;
	  var clen = document.cookie.length;
	  var i = 0;
	  while (i < clen) {
	    var j = i + alen;
	    if (document.cookie.substring(i, j) == arg)
	      return Nethru_getCookieVal (j);

	    i = document.cookie.indexOf(" ", i) + 1;
	    if (i == 0) break;
	  }
	  return null;
	}

	function Nethru_makePersistentCookie(name, length, path, domain) {
	  var today = new Date();
	  var expiredDate = new Date(2100, 1, 1);
	  var cookie;
	  var value;

	  cookie = Nethru_GetCookie(name);
	  if (cookie) return 1;

		var values = new Array();
	  for (var i=0; i < length; i++)
	    values[i] = "" + Math.random();

		value = today.getTime();
		for (var i=0; i < length; i++)
			value += values[i].charAt(2);

	  Nethru_SetCookie(name, value, expiredDate, path, domain);
	}


	function Nethru_makePersistentCookie1(name, length, path, domain) {
	  if (domain == null) return 1;

	  var expiredDate = new Date(2100, 1, 1);
	  var vn_screenx = screen.width;
	  var vn_screeny = screen.height;
	  var vn_screenc = screen.colorDepth;
	  var resolution_cookiename = name + "_RESOLUTION";
	  var color_cookiename = name + "_COLOR";
	  var resolution_value = screen.width + "*" + vn_screeny;
	  var color_value = vn_screenc;
	  var resolution_cookie;
	  var color_cookie;

	  resolution_cookie = Nethru_GetCookie(resolution_cookiename);
	  color_cookie = Nethru_GetCookie(color_cookiename)
	  if (resolution_cookie) {
	    if (resolution_cookie != resolution_value) {
	      Nethru_SetCookie(resolution_cookiename,resolution_value,expiredDate,path,domain);
	    }
	  }
	  else {
	    Nethru_SetCookie(resolution_cookiename,resolution_value,expiredDate,path,domain);
	  }
	  if (color_cookie) {
	    if (color_cookie != color_value) {
	    Nethru_SetCookie(color_cookiename,color_value,expiredDate,path,domain);
	    }
	  }
	  else {
	    Nethru_SetCookie(color_cookiename,color_value,expiredDate,path,domain);
	  }
	}

	function Nethru_getDomain() {
		var _host   = document.domain;
		var so      = _host.split('.');
		var dm    = so[so.length-2] + '.' + so[so.length-1];
		return (so[so.length-1].length == 2) ? so[so.length-3] + '.' + dm : dm;
	}

	var Nethru_domain  = Nethru_getDomain();
	Nethru_makePersistentCookie("PCID", 10, "/", Nethru_domain);
	//Nethru_makePersistentCookie1("RC", 10, "/", Nethru_domain);

	function memberMyinfoGnb(pageCode,pocId,objectId){
		if(objectId!=undefined && objectId!=''){
		    var headerLayout = document.getElementById('header');
		    if (headerLayout == null) {
		    	headerLayout = document.createElement("div");
		    	headerLayout.id = "header";
		    	headerLayout.innerHTML += "<div id='gnb'>";
		    	if(pageCode=='LOGIN' || pageCode=='EMAILRECEIVECANCEL'){
		    		headerLayout.innerHTML += "<div class='gnb_mem'>";
		    		headerLayout.innerHTML += "<div>";
		    		headerLayout.innerHTML += "<h1><a href=\"javascript:MemberEtc.goPage('MAIN');\" title='Melon 메인 - 페이지 이동'><img src='" + DeployPhaseUtils.convertUrl("https://cdnimg.melon.co.kr/resource/image/web/member/img_logo.png") + "' width='85' height='32' alt='Melon' /></a></h1>";
		    		headerLayout.innerHTML += "</div>";
		    		headerLayout.innerHTML += "</div>";
		    	}else{
		    		var cssHeader = "";
					var cssMenu = "";
					var cssOn = "";
					if(pageCode=='MYINFO01'){
						cssOn = "on";
					}else if(pageCode=='PRODUCTCENTER' || pageCode=='ENTEREVENT'){
						cssHeader = "mp_header";
						cssMenu = "mp_menu";
					}
					headerLayout.innerHTML += "<div class='gnb_mem02'>";
					headerLayout.innerHTML += "<div class='wrap_header "+cssHeader+"'>";
					headerLayout.innerHTML += "<h1><a href=\"javascript:MemberEtc.goPage('MAIN');\" title='Melon 메인 - 페이지 이동'><img src='" + DeployPhaseUtils.convertUrl("//cdnimg.melon.co.kr/resource/image/web/member/img_logo.png") + "' width='85' height='32' alt='Melon' /></a></h1>";
					headerLayout.innerHTML += "		<div id='gnb_menu'>";
					headerLayout.innerHTML += "			<ul>";
					headerLayout.innerHTML += "				<li class='first_child'><a href='" + DeployPhaseUtils.convertUrl("https://www.melon.com/chart/index.htm") + "' class='main_menu menu01' title='멜론차트'><span>멜론차트</span></a></li>";
					headerLayout.innerHTML += "				<li class=''><a href='" + DeployPhaseUtils.convertUrl("https://www.melon.com/new/index.htm") + "' class='main_menu menu02' title='최신음악'><span>최신음악</span></a></li>";
					headerLayout.innerHTML += "				<li class=''><a href='" + DeployPhaseUtils.convertUrl("https://www.melon.com/genre/song_list.htm?classicMenuId=DP0100") + "' class='main_menu menu03' title='장르음악'><span>장르음악</span></a></li>";
					headerLayout.innerHTML += "				<li class=''><a href='" + DeployPhaseUtils.convertUrl("https://www.melon.com/dj/today/djtoday_list.htm") + "' class='main_menu menu04' title='멜론DJ'><span>멜론DJ</span></a></li>";
					headerLayout.innerHTML += "				<li class=''><a href='" + DeployPhaseUtils.convertUrl("https://www.melon.com/tv/index.htm") + "' class='main_menu menu05' title='멜론TV'><span>멜론TV</span></a></li>";
					headerLayout.innerHTML += "				<li class=''><a href='" + DeployPhaseUtils.convertUrl("https://www.melon.com/artistplus/todayupdate/index.htm") + "' class='main_menu menu06' title='아티스트+'><span>아티스트+</span></a></li>";
					headerLayout.innerHTML += "				<li class=''><a href='" + DeployPhaseUtils.convertUrl("https://www.melon.com/musicstory/today/index.htm") + "' class='main_menu menu07' title='뮤직스토리'><span>뮤직스토리</span></a></li>";
					headerLayout.innerHTML += "				<li class=''><a href='#' class='main_menu menu08' title='더보기'><span>더보기</span></a>";
					headerLayout.innerHTML += "					<div class='more_wrap' style='display:none'><!-- more_lay일때 display:block -->";
					headerLayout.innerHTML += "						<ul>";
					headerLayout.innerHTML += "							<li class=''><a href='" + DeployPhaseUtils.convertUrl("https://www.melon.com/smartradio/index.htm") + "' title='스마트라디오'><span class='menu_more m1'>스마트라디오</span></a></li>";
					headerLayout.innerHTML += "							<li class=''><a href='" + DeployPhaseUtils.convertUrl("https://www.melon.com/flac/index.htm") + "' title='원음전용관'><span class='menu_more m2'>원음전용관</span></a></li>";
					headerLayout.innerHTML += "							<li class=''><a href='" + DeployPhaseUtils.convertUrl("https://www.melon.com/edu/index.htm") + "' title='어학'><span class='menu_more m3'>어학</span></a></li>";
					headerLayout.innerHTML += "							<li class=''><a href='" + DeployPhaseUtils.convertUrl("https://www.melon.com/customer/announce/index.htm") + "' title='공지사항'><span class='menu_more m4'>공지사항</span></a></li>";
					headerLayout.innerHTML += "						</ul>";
					headerLayout.innerHTML += "						<ul>";
					headerLayout.innerHTML += "							<li class=''><a href='" + DeployPhaseUtils.convertUrl("https://www.melon.com/commerce/pamphlet/web/sale_listMainView.htm") + "' title='이용권구매'><span class='menu_more m9'>이용권구매</span></a></li>";
					headerLayout.innerHTML += "							<li class=''><a href='javascript:goMyPageAddCash();' title='멜론캐쉬충전'><span class='menu_more m6'>멜론캐쉬충전</span></a></li>";
					headerLayout.innerHTML += "							<li class=''><a href='" + DeployPhaseUtils.convertUrl("https://www.melon.com/event/index.htm") + "' title='이벤트'><span class='menu_more m7'>이벤트</span></a></li>";
					headerLayout.innerHTML += "							<li class=''><a href='" + DeployPhaseUtils.convertUrl("https://faqs2.melon.com/customer/index.htm") + "' title='고객센터'><span class='menu_more m8'>고객센터</span></a></li>";
					headerLayout.innerHTML += "						</ul>";
					headerLayout.innerHTML += "					</div>";
					headerLayout.innerHTML += "				</li>";
					headerLayout.innerHTML += "			</ul>";
					headerLayout.innerHTML += "		</div>";
					if(isMelonLogin()){
						var fromMPS = getCookie("MPS");
						headerLayout.innerHTML += "<div class='header_login'>";
						headerLayout.innerHTML += "<span class='wrap_id'><span class='user_id'>";
						if(getGrade()!="" && getGrade()!="일반"){
							headerLayout.innerHTML += "<span class='icon_grade'><img src='"+getGradeImageUrl()+"' width='18' height='18' alt="+getGrade()+"></span>";
						}
						headerLayout.innerHTML += "<a href='" + DeployPhaseUtils.convertUrl("https://member.melon.com/muid/web/help/myinfointro_inform.htm") + "'>"+getMemberId()+"</a></span> 님</span>";

						if (fromMPS == null || fromMPS.indexOf("MELONPLAYER") < 0) {
							headerLayout.innerHTML += "<button type='button' onclick=\"MemberEtc.goPage('LOGOUT');\" title='로그아웃 - 페이지 이동' class='btn_big short'><span class='odd_span'><span class='even_span'>로그아웃</span></span></button>";
						}
						headerLayout.innerHTML += "</div>";
					}else{
						headerLayout.innerHTML += "<div class='header_login'>";
						headerLayout.innerHTML += "<button type='button' onclick=\"MemberEtc.goPage('LOGIN');\" title='로그인 - 페이지 이동' class='btn_big short'><span class='odd_span'><span class='even_span'>로그인</span></span></button>";
						headerLayout.innerHTML += "</div>";
					}
					headerLayout.innerHTML += "</div>";
					headerLayout.innerHTML += "<div class='wrap_menu "+cssMenu+"'>";
					headerLayout.innerHTML += "<ul>";
					headerLayout.innerHTML += "<li class='"+(pageCode=='MYINFO1'?'on':'')+"'><a href=\"javascript:MemberEtc.goPage('BASIC_INFO_CHANGE');\" title='회원정보 - 페이지 이동'><span class='m_menu m1'>회원정보</span></a></li>";
					headerLayout.innerHTML += "<li class='"+(pageCode=='MYINFO2'?'on':'')+"'><a href=\"javascript:MemberEtc.goPage('LOGIN_HISTORY');\" title='내 정보 보호 - 페이지 이동'><span class='m_menu m2'>내 정보 보호</span></a></li>";
					headerLayout.innerHTML += "<li class='"+(pageCode=='MYINFO3'?'on':'')+"'><a href=\"javascript:MemberEtc.goPage('PRIVATE_INFO');\" title='개인정보 이용내역 - 페이지 이동'><span class='m_menu m3'>개인정보 이용내역</span></a></li>";
					headerLayout.innerHTML += "<li class='"+(pageCode=='MYINFO4'?'on':'')+"'><a href=\"javascript:MemberEtc.goPage('GRADE_INFO');\" title='내 등급 - 페이지 이동'><span class='m_menu m9'>내 등급</span></a></li>";
					headerLayout.innerHTML += "<li class='"+(pageCode=='PRODUCTCENTER'?'on':'')+"'><a href=\"javascript:MemberEtc.goPage('PRODUCTCENTER');\" title='내 이용권/결제정보 - 페이지 이동'><span class='m_menu m8'>내 이용권/결제정보</span></a></li>";
					headerLayout.innerHTML += "<li class='"+(pageCode=='ENTEREVENT'?'on':'')+"'><a href=\"javascript:MemberEtc.goPage('ENTEREVENT');\" title='이벤트 응모내역 - 페이지 이동'><span class='m_menu m5'>이벤트 응모내역</span></a></li>";
					headerLayout.innerHTML += "</ul>";
					headerLayout.innerHTML += "</div>";
					headerLayout.innerHTML += "</div>";
		    	}
		    	headerLayout.innerHTML += "</div>";
		    	headerLayout.innerHTML += "</div>";

		    	document.getElementById("wrap").appendChild(headerLayout);
		    }
		}else{
			document.write("<div id='header'>");
			document.write("<div id='gnb'>");
			if(pageCode=='LOGIN' || pageCode=='EMAILRECEIVECANCEL'){
				document.write("<div class='gnb_mem'>");
				document.write("<div>");
				document.write("<h1><a href=\"javascript:MemberEtc.goPage('MAIN');\" title='Melon 메인 - 페이지 이동'><img src='" + DeployPhaseUtils.convertUrl("https://cdnimg.melon.co.kr/resource/image/web/member/img_logo.png") + "' width='85' height='32' alt='Melon' /></a></h1>");
				document.write("</div>");
				document.write("</div>");
			}else{
				var cssHeader = "";
				var cssMenu = "";
				var cssOn = "";
				if(pageCode=='MYINFO01'){
					cssOn = "on";
				}else if(pageCode=='PRODUCTCENTER' || pageCode=='ENTEREVENT'){
					cssHeader = "mp_header";
					cssMenu = "mp_menu";
				}
				document.write("<div class='gnb_mem02'>");
				document.write("<div class='wrap_header "+cssHeader+"'>");
				document.write("<h1><a href=\"javascript:MemberEtc.goPage('MAIN');\" title='Melon 메인 - 페이지 이동'><img src='" + DeployPhaseUtils.convertUrl("//cdnimg.melon.co.kr/resource/image/web/member/img_logo.png") + "' width='85' height='32' alt='Melon' /></a></h1>");
				document.write("		<div id='gnb_menu'>");
				document.write("			<ul>");
				document.write("				<li class='first_child'><a href='" + DeployPhaseUtils.convertUrl("https://www.melon.com/chart/index.htm") + "' class='main_menu menu01' title='멜론차트'><span>멜론차트</span></a></li>");
				document.write("				<li class=''><a href='" + DeployPhaseUtils.convertUrl("https://www.melon.com/new/index.htm' class='main_menu menu02") + "' title='최신음악'><span>최신음악</span></a></li>");
				document.write("				<li class=''><a href='" + DeployPhaseUtils.convertUrl("https://www.melon.com/genre/song_list.htm?classicMenuId=DP0100") + "' class='main_menu menu03' title='장르음악'><span>장르음악</span></a></li>");
				document.write("				<li class=''><a href='" + DeployPhaseUtils.convertUrl("https://www.melon.com/dj/today/djtoday_list.htm") + "' class='main_menu menu04' title='멜론DJ'><span>멜론DJ</span></a></li>");
				document.write("				<li class=''><a href='" + DeployPhaseUtils.convertUrl("https://www.melon.com/tv/index.htm' class='main_menu menu05") + "' title='멜론TV'><span>멜론TV</span></a></li>");
				document.write("				<li class=''><a href='" + DeployPhaseUtils.convertUrl("https://www.melon.com/artistplus/todayupdate/index.htm") + "' class='main_menu menu06' title='아티스트+'><span>아티스트+</span></a></li>");
				document.write("				<li class=''><a href='" + DeployPhaseUtils.convertUrl("https://www.melon.com/musicstory/today/index.htm") + "' class='main_menu menu07' title='뮤직스토리'><span>뮤직스토리</span></a></li>");
				document.write("				<li class=''><a href='#' class='main_menu menu08' title='더보기'><span>더보기</span></a>");
				document.write("					<div class='more_wrap' style='display:none'><!-- more_lay일때 display:block -->");
				document.write("						<ul>");
				document.write("							<li class=''><a href='" + DeployPhaseUtils.convertUrl("https://www.melon.com/smartradio/index.htm") + "' title='스마트라디오'><span class='menu_more m1'>스마트라디오</span></a></li>");
				document.write("							<li class=''><a href='" + DeployPhaseUtils.convertUrl("https://www.melon.com/flac/index.htm") + "' title='원음전용관'><span class='menu_more m2'>원음전용관</span></a></li>");
				document.write("							<li class=''><a href='" + DeployPhaseUtils.convertUrl("https://www.melon.com/edu/index.htm") + "' title='어학'><span class='menu_more m3'>어학</span></a></li>");
				document.write("							<li class=''><a href='" + DeployPhaseUtils.convertUrl("https://www.melon.com/customer/announce/index.htm") + "' title='공지사항'><span class='menu_more m4'>공지사항</span></a></li>");
				document.write("						</ul>");
				document.write("						<ul>");
				document.write("							<li class=''><a href='" + DeployPhaseUtils.convertUrl("https://www.melon.com/commerce/pamphlet/web/sale_listMainView.htm") + "' title='이용권구매'><span class='menu_more m9'>이용권구매</span></a></li>");
				document.write("							<li class=''><a href='javascript:goMyPageAddCash();' title='멜론캐쉬충전'><span class='menu_more m6'>멜론캐쉬충전</span></a></li>");
				document.write("							<li class=''><a href='" + DeployPhaseUtils.convertUrl("https://www.melon.com/event/index.htm") + "' title='이벤트'><span class='menu_more m7'>이벤트</span></a></li>");
				document.write("							<li class=''><a href='" + DeployPhaseUtils.convertUrl("https://faqs2.melon.com/customer/index.htm") + "' title='고객센터'><span class='menu_more m8'>고객센터</span></a></li>");
				document.write("						</ul>");
				document.write("					</div>");
				document.write("				</li>");
				document.write("			</ul>");
				document.write("		</div>");
				if(isMelonLogin()){
					var fromMPS = getCookie("MPS");
					document.write("<div class='header_login'>");
					document.write("<span class='wrap_id'><span class='user_id'>");
					if(getGrade()!="" && getGrade()!="일반"){
						document.write("<span class='icon_grade'><img src='"+getGradeImageUrl()+"' width='18' height='18' alt="+getGrade()+"></span>");
					}
					document.write("<a href='" + DeployPhaseUtils.convertUrl("https://member.melon.com/muid/web/help/myinfointro_inform.htm") + "'>"+getMemberId()+"</a></span> 님</span>");

					if (fromMPS == null || fromMPS.indexOf("MELONPLAYER") < 0) {
						document.write("<button type='button' onclick=\"MemberEtc.goPage('LOGOUT');\" title='로그아웃 - 페이지 이동' class='btn_big short'><span class='odd_span'><span class='even_span'>로그아웃</span></span></button>");
					}
					document.write("</div>");
				}else{
					document.write("<div class='header_login'>");
					document.write("<button type='button' onclick=\"MemberEtc.goPage('LOGIN');\" title='로그인 - 페이지 이동' class='btn_big short'><span class='odd_span'><span class='even_span'>로그인</span></span></button>");
					document.write("</div>");
				}
				document.write("</div>");
				document.write("<div class='wrap_menu "+cssMenu+"'>");
				document.write("<ul>");
				document.write("<li class='"+(pageCode=='MYINFO1'?'on':'')+"'><a href=\"javascript:MemberEtc.goPage('BASIC_INFO_CHANGE');\" title='회원정보 - 페이지 이동'><span class='m_menu m1'>회원정보</span></a></li>");
				document.write("<li class='"+(pageCode=='MYINFO2'?'on':'')+"'><a href=\"javascript:MemberEtc.goPage('LOGIN_HISTORY');\" title='내 정보 보호 - 페이지 이동'><span class='m_menu m2'>내 정보 보호</span></a></li>");
				document.write("<li class='"+(pageCode=='MYINFO3'?'on':'')+"'><a href=\"javascript:MemberEtc.goPage('PRIVATE_INFO');\" title='개인정보 이용내역 - 페이지 이동'><span class='m_menu m3'>개인정보 이용내역</span></a></li>");
				document.write("<li class='"+(pageCode=='MYINFO4'?'on':'')+"'><a href=\"javascript:MemberEtc.goPage('GRADE_INFO');\" title='내 등급 - 페이지 이동'><span class='m_menu m9'>내 등급</span></a></li>");
				document.write("<li class='"+(pageCode=='PRODUCTCENTER'?'on':'')+"'><a href=\"javascript:MemberEtc.goPage('PRODUCTCENTER');\" title='내 이용권/결제정보 - 페이지 이동'><span class='m_menu m8'>내 이용권/결제정보</span></a></li>");
				document.write("<li class='"+(pageCode=='ENTEREVENT'?'on':'')+"'><a href=\"javascript:MemberEtc.goPage('ENTEREVENT');\" title='이벤트 응모내역 - 페이지 이동'><span class='m_menu m5'>이벤트 응모내역</span></a></li>");
				document.write("</ul>");
				document.write("</div>");
				document.write("</div>");
			}
			document.write("</div>");
			document.write("</div>");
		}
	}

	function memberFooter(pageCode,errorCode){
		var cssFooter = "";
		if(pageCode=='PRODUCTCENTER' || pageCode=='ENTEREVENT'){
			cssFooter = "mp_footer";
		}
		if(errorCode != 'ERL069'){
			document.write("<div id='footer' class='"+cssFooter+"'>");
			document.write("<ul class='clfix'>");
			document.write("		<li class='first_child'><a href='https://www.kakao-m.com/' title='회사소개 - 새 창' target='_blank'>회사소개</a></li>");
			document.write("		<li><a href='" + DeployPhaseUtils.convertUrl("https://info.melon.com/terms/web/terms1_4.html") + "' title='이용약관 - 페이지 이동'>이용약관</a></li>");
			document.write("		<li><a href='" + DeployPhaseUtils.convertUrl("https://info.melon.com/terms/web/terms3.html") + "' title='개인정보취급방침 - 페이지 이동'><strong>개인정보취급방침</strong></a></li>");
			document.write("		<li><a href='" + DeployPhaseUtils.convertUrl("https://info.melon.com/terms/web/terms5_1.html") + "' title='청소년보호정책 - 페이지 이동'>청소년보호정책</a></li>");
			document.write("		<li><a href='" + DeployPhaseUtils.convertUrl("https://faqs2.melon.com/customer/faq/informFaq.htm?no=1&amp;faqId=QUES20140616000001&amp;SEARCH_KEY=&amp;SEARCH_PAR_CATEGORY=CATE20130909000006&amp;SEARCH_CATEGORY=CATE20130909000021") + "' title='제휴/프로모션문의 - 새 창' target='_blank'>제휴/프로모션문의</a></li>");
			document.write("		<li><a href=\"javascript:MemberEtc.goPage('EMAIL_COL_REJECT',1,384,331);\" title='이메일주소무단수집거부  - 새 창'>이메일주소무단수집거부 </a></li>");
			document.write("		<li><a href='" + DeployPhaseUtils.convertUrl("https://faqs2.melon.com/customer/index.htm") + "' title='고객센터 - 새 창' target='_blank'>고객센터</a></li>");
			document.write("		<li><a href='" + DeployPhaseUtils.convertUrl("https://partner.melon.com") + "' title='파트너센터 - 새 창' target='_blank'>파트너센터</a></li>");
			document.write("</ul>");
			document.write("<p>");
			document.write("		<span class='first'>제주특별자치도 제주시 첨단로 242(영평동)</span><span>공동대표이사 : 여민수, 조수용</span><span>사업자등록번호 : 120-81-47521</span><span>통신판매업 신고번호 : 제2015-제주아라-0032호 <a href='http://www.ftc.go.kr/bizCommPop.do?wrkr_no=1208147521&apv_perm_no=2012651005630200009' class='btn-info' title='사업자정보확인'>사업자정보확인</a></span>");
			document.write("		<span class='first'>문의전화(평일 09:00~18:00) : 1566-7727 (유료)</span><span>호스팅제공자 : (주) 카카오© Kakao </span><span>Corp. All rights reserved.</span>");
			document.write("</p>");
			document.write("</div>");
		}
	}
