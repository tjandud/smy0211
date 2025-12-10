/**
 * Created by juhankim-lt on 15. 11. 10..
 */

var ezCusPaper = null;
var panZoom = null;
var ezCusMgn = null;

var mFloor = "";
var mArea = "";
var mRow = "";
var mEtc = "";
var mNum = "";
var SELECTED_SEAT = null;
var selectedCount = 0;
var limitVol = 0;
var OBJECT_IMAGE_PATH = DeployPhaseUtils.convertUrl("https://cdnticket.melon.co.kr/resource/image/upload/seat/object/");
//object 이미지 확장자
var OBJECT_IMAGE_ATTR = "svg";
//object 이미지 크기
var OBJECT_IMAGE_WIDTH = 40;
var OBJECT_IMAGE_HEIGHT = 40;

var _VIEW_SEAT_BLOCK = false;
var MAP_VIEW_TYPE = "MAP";
var mc = null;

var REV_SEAT_ARRAY = Array();
var myElement = null;

var _MAX_ZOOM_VAL = 5;
var _MIN_ZOOM_VAL = -5;

var PROD_ID = "";
var SCH_ID = "";

var _LAST_SELECTED_SEAT_BLOCK_SNTV = "";

var blockTxtPosMinX = 99999999;
var blockTxtY = new Array();

var dRowList = [];
function fnSetMapViewType( pType )
{
    MAP_VIEW_TYPE = pType;
}

function InitBody()
{
}

function fnLoadSeatMap( seatData , lmtVol , bBlock)
{
    REV_SEAT_ARRAY = Array();
    selectedCount = 0;
    if(lmtVol != null){
        limitVol = lmtVol;
    }else{
        limitVol = 999999;
    }

    _VIEW_SEAT_BLOCK = bBlock;
    _LAST_SELECTED_SEAT_BLOCK_SNTV = "";

    fnCusMapLoadingProcess( seatData );

    if(!bBlock){
        fniLoadSeatMap( seatData );
    }

    if (_VIEW_SEAT_BLOCK)
    {
        //_LAST_SELECTED_SEAT_BLOCK_SNTV = sFloor+","+sArea;
        fnSelectedSeatBlock( _LAST_SELECTED_SEAT_BLOCK_SNTV );
    }

}

function fnGetIndexMapLife()
{
    var retflg = false;
    if ( $("#iez_canvas").length > 0  )
    {
        retflg = true;
    }else{
        retflg = false;
    }

    return retflg;
}

// function fnLoadSeatBlock(pFloor , pArea)
// {
//
//     $.ajax({
//         type         : "POST"
//    	  , dataType     : "jsonp"
//    	  , cache         : true
// 	  , url          : _LOAD_CUS_SEAT_BLOCK_URL
//       , async        : false
//       , data          : {
//                           prodId: parent.$("#prodId").val()
//                         , scheduleNo: parent.$("#scheduleNo").val()
//                         , blockId: parent.$("#blockId").val()
//                         }
//       , jsonpCallback: "getSeatListCallBack"
//    	  , success      : function(result) {
//             fnCusMapLoadingProcess( result.seatData );
//         }
//       , error        : function(e) {
//           alert("좌석 조회중 오류가 발생하였습니다. 관리자에게 문의해 주십시오.");
//         }
//     });
// }
function fnLoadSeatBlockById(pFloor, mFloorZone, pArea, mAreaZone, sbid, isMinimap)
{
	parent.$("#sntv").val(pFloor+","+pArea);
	parent.$("#floorNo").val(pFloor);
	parent.$("#floorName").val(mFloorZone);
	parent.$("#areaNo").val(pArea);
	parent.$("#areaName").val(mAreaZone);
	parent.$("#blockId").val(sbid);
	getBlockSeatList();
    if (!isMinimap) {
        myScroll_minimap.zoom(0);
    }
}

function fnCusMapLoadingProcess( cusMap )
{
    if (ezCusMgn != null)
    {
        ezCusMgn.RemoveAll();
        ezCusMgn = null;
    }

    SELECTED_SEAT = new Array();

    mFloor = (cusMap.snt.f.use == "Y" ? cusMap.snt.f.name : "");
    mArea = (cusMap.snt.a.use == "Y" ? cusMap.snt.a.name : "");
    mRow = (cusMap.snt.r.use == "Y" ? cusMap.snt.r.name : "");
    mEtc = (cusMap.snt.e.use == "Y" ? cusMap.snt.e.name : "");
    mNum = (cusMap.snt.n.use == "Y" ? cusMap.snt.n.name : "");

    ezCusMgn = new EzSeatCus();
    ezCusMgn.InitSeat( "1" , cusMap.ms.width , cusMap.ms.height , cusMap.mt );

    ezCusMgn.SetBackGroundColor( cusMap.bg );

    if(brCheck){
    	ezCusMgn.SetBackGround( cusMap.im );
    	ezCusPaper.setViewBox(0 , 0, cusMap.ms.width , cusMap.ms.height, true);
    }else{
    	ezCusMgn.SetBackGround( cusMap.bu );
    }

    ezCusMgn.SetIndexMap( cusMap.im );

    var SeatJson = cusMap.st;
    var tmpSeat = new Object();


    if ( (MAP_VIEW_TYPE == "RS_MAP") || (MAP_VIEW_TYPE == "JN_MAP") )
    {
        if (ezCusMgn.GetMapType() == "BLOCK") {
            _VIEW_SEAT_BLOCK = true;
        }
        
        if (cusMap.rs != undefined)
        {

            for (var i = 0; i < cusMap.rs.length; i++)
            {
                REV_SEAT_ARRAY[cusMap.rs[i].sid] = cusMap.rs[i].sc;
            }
        }
    }

    if (SeatJson != null) {
        for (var i = 0; i < SeatJson.length; i++) {
            tmpSeat[SeatJson[i].sbid] = SeatJson[i];
        }
    }

    if (cusMap.da.bb != null) {
        for (var i = 0; i < cusMap.da.bb.length; i++) {
            ezCusMgn.DrawBackBlock(cusMap.da.bb[i]);
        }
    }

    if (cusMap.mt == "ALL")
    {
        fnDrawSeatBlock(cusMap , tmpSeat);
    }else{
        if (_VIEW_SEAT_BLOCK)
        {
            fnDrawSeatBlock(cusMap , tmpSeat);
        }else{

        }
    }

    if (!_VIEW_SEAT_BLOCK) {
        if (cusMap.da.zb != null) {
            for (var i = 0; i < cusMap.da.zb.length; i++) {
                ezCusMgn.DrawZoneBlock(cusMap.da.zb[i]);
            }
        }
    }


}

function PanMove( pEv )
{
    //panZoom.pan(pEv.deltaX * 0.18 , pEv.deltaY * 0.18);
}

function ZoomIn( pEv )
{
    //panZoom.zoomIn(0.5);
    //zoomInB();
}

function ZoomOut( pEv )
{
    //panZoom.zoomOut(0.5);
    //zoomOutB();
}

function fnDrawSeatBlock(cusMap , tmpSeat)   
{
    var dwGetBBox = null;
    var dwGetBBox1 = [];
    dRowList = [];
	var pX = 0;
	var pY = 0;
	var pY2 = 0;
	var pW = 0;
	var pH = 0;

    // 가로 : x축 마지막 좌표(가장 큰) - 시작 좌표(가장 작은)
    // 세로 : y축 마지막 좌표(가장 큰) - 시작 좌표(가장 작은)
    var pWmin = 0;
    var pWmax = 0;
    var pHmin = 0;
    var pHmax = 0;

    if (cusMap.da.sb != null) {
    		blockTxtPosMinX = 99999999;
    		blockTxtY = new Array();

        for (var i = 0; i < cusMap.da.sb.length; i++) {
            if (cusMap.da.sb[i].sbt != "SE0003") {
                if (tmpSeat[cusMap.da.sb[i].sbid] != undefined) {
                    dwGetBBox1[i] = ezCusMgn.DrawSeatBlock(cusMap.da.sb[i], tmpSeat[cusMap.da.sb[i].sbid]);
                }
            }else{
                if (tmpSeat[cusMap.da.sb[i].sbid] != undefined) {
                    dwGetBBox1[i] = ezCusMgn.DrawNSSeatBlock(cusMap.da.sb[i], tmpSeat[cusMap.da.sb[i].sbid]);
                }
            }
        }
        
        if(dwGetBBox1.length > 0){
            pX = dwGetBBox1[0].x;
            pY = dwGetBBox1[0].y;
            pY2= dwGetBBox1[0].y;
            pW = dwGetBBox1[0].width;
            pH = dwGetBBox1[0].height;

            pWmin = dwGetBBox1[0].x;        //x축 가장 작은 좌표
            pWmax = dwGetBBox1[0].x + dwGetBBox1[0].width;    //x축 가장 큰 좌표
            pHmin = dwGetBBox1[0].y;        //y축 가장 작은 좌표
            pHmax = dwGetBBox1[0].y + dwGetBBox1[0].height;   //y축 가장 큰 좌표

            for(var i = 0 ; i < dwGetBBox1.length ; i++){
                pX = Math.min(pX, dwGetBBox1[i].x);
                pY = Math.min(pY, dwGetBBox1[i].y);
                pY2= Math.max(pY2, dwGetBBox1[i].y);

                pWmin = Math.min(pWmin, dwGetBBox1[i].x);
                pWmax = Math.max(pWmax, dwGetBBox1[i].x + dwGetBBox1[i].width);
                pHmin = Math.min(pHmin, dwGetBBox1[i].y);
                pHmax = Math.max(pHmax, dwGetBBox1[i].y + dwGetBBox1[i].height);

                pW = pWmax - pWmin;
                pH = pHmax - pHmin;

                //세로로 길 경우 하단이 겹치는 현상이 있어 좀 더 크기를 늘림...
                if(pH > pW) pH = pH * 1.125;

            }

            dRowList.forEach(function(dRow, index) {
                dRow.setAttribute("x",pX - ( parseInt(dRow.getAttribute("x")) ));
            });

            if (_VIEW_SEAT_BLOCK) {
                if(undefined !== brCheck && brCheck){
                    ezCusMgn.SetZoomBlock(pX , pY+ (pH/2)-5 , pW , pH);
                }else{
                    if(((pY2-pY) * 1.35) >= pH){
                        pH = (pY2-pY) * 1.35;
                    }
                    ezCusMgn.SetZoomBlock(pX , pY , pW-5 , pH);
                }
            }
        }
    }
}

function SetIndexMap( pX , pY , pW , pH)
{
    try {
        if (fnGetIndexMapLife()) {
            if (ezCusMgn.GetMapType() == "ALL") {

                if (ezCusMgn.GetIndexMapUrl() != "") {
                    if (iezCusMgn != null) {
                        iezCusMgn.DrawZoomRect(pX, pY, pW, pH);
                    }
                }
            }
        }
    }catch(errot)
    {

    }
}

function fnGetNASeatDpName( pF , pA )
{
    var retStr = "";
    if (mFloor !="")
    {
        retStr += pF +" "+mFloor + " ";
    }

    if (mArea !="")
    {
        retStr += pA +" "+mArea+ " ";
    }

    return retStr;
}

function fnGetSeatDpName( pF , pA , pR , pE , pN)
{
    var retStr = "";
    if (pF != "" && mFloor !="")
    {
        retStr += pF +" "+mFloor + " ";
    }

    if (pA != "" && mArea !="")
    {
        retStr += pA +" "+mArea+ " ";
    }

    if (mRow !="" && pR !="")
    {
        retStr += pR +" "+mRow+ " ";
    }

    if (mEtc !="")
    {
        retStr += pE +" "+mEtc+ " ";
    }

    if (mNum !="")
    {
        retStr += pN +" "+mNum+ " ";
    }

    return retStr;
}

function fnReservationSeat( pSbt , pSeatGrade , pSeatId , pSeatTitle, pClipSeatId , pSeatGradeNm )
{

    if (SELECTED_SEAT[pSeatId] != undefined)
    {
        selectedCount++;
        if((selectedCount) <= limitVol ){
            //SELECTED_SEAT[pSeatId].attr("fill" , "#000000");
            SELECTED_SEAT[pSeatId].attr("fill-opacity" , "0.5");
            SELECTED_SEAT[pSeatId].attr("stroke-width" , "2");
            //$("#rev_list > tbody:last").append("<tr id='tr_"+pSeatId+"'><td>"+pSeatTitle+"</td><td><a href=\"javascript:fnCancelSeat('"+pSeatId+"')\">x</a></td></tr>");
            selectSeat(pSeatId, pSeatGrade, pSeatTitle, selectedCount, "SE0001", pClipSeatId, pSeatGradeNm);
        }else {
        	if( limitVol <= 0){
        		alert("예매가능한 매수를 모두 사용하셨습니다.");
        	}else{
        		alert("최대 " + limitVol + "석 까지 선택 가능합니다.");
        	}
            fnCancelSeat(pSeatId);
        }
    }
}

function fnReservationNASeat( pSeatBlockId , pSeatGrade , pSeatId , pSeatTitle )
{
    if (SELECTED_SEAT[pSeatId] != undefined) {
		selectedCount++;
		if(confirm('[' + pSeatTitle + ']은 비지정석으로 지정석 좌석과 함께 구매할 수 없습니다. [' + pSeatTitle + ']의 예매를 진행하시겠습니까? 선택하신 지정석 좌석이 있는경우 해당 좌석은 선택 해제 됩니다.')){
			selectNASeat(pSeatId, pSeatGrade, pSeatTitle, selectedCount, "SE0003")
		}else{
	        SELECTED_SEAT[pSeatId].attr("fill-opacity" , "1");
			SELECTED_SEAT[pSeatId].attr("stroke-width" , "0");
		}
    }
}

// function fnGetSeatBlock( pFloor , pArea )
// {
//     selectedCount = 0;
//     removeAllSelectedSeat();
//     _VIEW_SEAT_BLOCK = true;
//     //fnLoadSeatMap();
// 	fnLoadSeatBlock(pFloor , pArea);
//
// }
// function fnGetSeatBlockforIdxMap( pFloor , pArea )
// {
//     _VIEW_SEAT_BLOCK = true;
//     //fnLoadSeatMap();
//     fnLoadSeatBlock(pFloor , pArea);
// }

function fnCancelSeat( pSeatId )
{
    if (SELECTED_SEAT[pSeatId] != undefined)
    {
        SELECTED_SEAT[pSeatId].attr("fill-opacity" , "1");
        SELECTED_SEAT[pSeatId].attr("stroke-width" , "0");
        delete SELECTED_SEAT[ pSeatId ];

        selectedCount--;
        //$("#tr_"+pSeatId).remove();
        unselectSeat(pSeatId, selectedCount);
    }
}

function fnSelectedSeatBlock( pSntvStr )
{

    try{
        fnSetidxSelectedSeatBlockList( pSntvStr );
    }catch(e)
    {

    }
}

EzSeatCus = function()
{
    var mBackGround = null;
    var mWidth =0;
    var mHeight = 0;

    var me = this;
    var mMapType = "";
    var mInxMapUrl = "";

    me.GetMapType = function()
    {
        return mMapType;
    };

    me.GetIndexMapUrl = function()
    {
        return  mInxMapUrl;
    };

    me.SetIndexMap = function( pUrl )
    {
    	if( undefined != pUrl && "" != pUrl){
    		pUrl = pUrl.replace("http:", "https:");
    	}
        mInxMapUrl = pUrl;
    };

    me.InitSeat = function( pLocID , pWidth , pHeight , pMapType )
    {

        mWidth = pWidth;
        mHeight = pHeight;
        mMapType = pMapType;

        if(pMapType == "ALL" && pWidth * 600 < pHeight * 700){  //TICKETDEV-2283 [PC] 국내/글로벌 원스탑 UI 오류 수정
            pHeight = pHeight * 1.1;
        }

        ezCusPaper = Raphael( "ez_canvas", $("#ez_canvas").width() , $("#ez_canvas").height() );
        ezCusPaper.canvas.style.backgroundColor = "#F4F4F4";

        ezCusPaper.setViewBox(0 , 0, pWidth , pHeight, true);
        ezCusPaper.canvas.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    };

    me.SetZoomBlock = function(pX , pY , pW , pH)
    {

        var mcW = $("#ez_canvas").width();
        var mcH = $("#ez_canvas").height();

        var lineTxtWidth = 80; // 여유있게
        var bottomHeight = 35;

        iPosX = pX - lineTxtWidth/2;
        iPosY = pY;

        ezCusPaper.setViewBox(pX - lineTxtWidth/2 , pY,(lineTxtWidth + pW), (pH + bottomHeight), true);
        ezCusPaper.canvas.style.backgroundColor = "#F4F4F4";
        ezCusPaper.canvas.setAttribute('preserveAspectRatio', 'xMidYMin meet');
    };

    me.SetBackGroundColor = function( pbackColor )
    {
    	if(undefined !== pbackColor){
    		ezCusPaper.canvas.style.backgroundColor = "#"+pbackColor;
    	}
    };

    me.SetBackGround = function ( pbackGround )
    {
        if (!_VIEW_SEAT_BLOCK) {
            if (pbackGround != "") {
            	pbackGround = pbackGround.replace("http:", "https:");
                mBackGround = ezCusPaper.image(pbackGround, 0, 0, mWidth , mHeight);
                mBackGround.toBack();
            }
        }
    };

    me.DrawZoneBlock = function( pZB )
    {
        var zBlock = null;

        switch ( pZB.dt )
        {
            case "RECT":
                zBlock = new EzCusRect( pZB.cd.x , pZB.cd.y , pZB.cd.w , pZB.cd.h , ezCusPaper );
                zBlock.SetStyle( pZB.fc , pZB.lc , pZB.ls);

                if (pZB.r != 0) {
                    zBlock.SetRotate( pZB.r );
                }
                zBlock.SetSNTVLink(pZB.snt.f , pZB.snt.a);
                //mRect = null;
                break;
            case "CIRCLE":
                zBlock = new EzCusCircle(pZB.cd.x , pZB.cd.y, pZB.r , ezCusPaper);
                zBlock.SetStyle( pZB.fc , pZB.lc , pZB.ls);
                zBlock.SetSNTVLink(pZB.snt.f , pZB.snt.a);
                //zBlock = null;
                break;
            case "PATH":
                zBlock = new EzCusPath( pZB.cd , ezCusPaper);
                zBlock.DrawPath();
                zBlock.SetStyle( pZB.fc , pZB.lc , pZB.ls);
                zBlock.SetSNTVLink(pZB.snt.f , pZB.snt.a);
                //mPath = null;
                break;
            case "TEXT":
                var mText = new EzCusText( pZB.cd.x , pZB.cd.y , pZB.text , ezCusPaper);
                mText.SetStyle( pZB.font_name , pZB.font_size , pZB.font_color , pZB.font_effect);
                mText = null;
                break;
        }
    };

    me.DrawNSSeatBlock = function( pSB , pST )
    {
        var naBlock = null;
        var sFloor = "";
        var sArea = "";

        sFloor = pSB.sntv.f;
        sArea = pSB.sntv.a;

        if (pSB.dt == "NS_SEAT_RECT")
        {
            naBlock = ezCusPaper.rect(pSB.cd.x , pSB.cd.y , pSB.cd.w , pSB.cd.h);
            //naBlock.attr("fill", "#" + pSB.fc );
            naBlock.attr("fill", "#" + pST.ss[0].gc );

            if (pSB.ls == "0")
            {
                naBlock.attr("stroke-opacity", 0 );
            }

            if (pSB.rt != 0)
            {
                pSB.rotate( pSB.rt , pSB._getBBox().x + (pSB._getBBox().width / 2),
                    pSB._getBBox().y + (pSB._getBBox().height / 2));
            }
            //naBlock = null;
        }else if (pSB.dt == "NS_SEAT_CIRCLE")
        {
            naBlock = ezCusPaper.circle(pSB.cd.x , pSB.cd.y , pSB.r);
            //naBlock.attr("fill", "#" + pSB.fc );
            naBlock.attr("fill", "#" + pST.ss[0].gc );

            if (pSB.ls == "0")
            {
                naBlock.attr("stroke-opacity", 0 );
            }

            //naBlock = null;
        }else if (pSB.dt == "NS_SEAT_PATH")
        {
            var coord = pSB.cd.split(":");//strCoord.split(":");
            var pathStr = "";
            for (var m=0; m < coord.length; m++)
            {
                if (m == 0)
                {
                    pathStr += "M"+coord[m];
                }else{
                    pathStr += "L"+coord[m];
                }
            }
            pathStr += "Z";

            naBlock = ezCusPaper.path(pathStr);
            //naBlock.attr("fill", "#" + pSB.fc );
            naBlock.attr("fill", "#" + pST.ss[0].gc );

            if (pSB.ls == "0")
            {
                naBlock.attr("stroke-opacity", 0 );
            }

            coord = null;
        }

        if (naBlock != null)
        {
            if (pST != null) {

                if ( (pST.ss[0].slc > 0) && (pST.ss[0].sl == "Y") ) {

                    naBlock.id = pST.ss[0].sid;
                    naBlock.data("bid" , pSB.sbid );
                    naBlock.data("sid" , pST.ss[0].sid );
                    naBlock.data("gd", pST.ss[0].gd);

                    naBlock.mouseover(function () {
                        //console.log("over");
                        this.attr("cursor", "pointer");
                    });

                    naBlock.mouseout(function () {
                        this.attr("cursor", "");
                    });

                    naBlock.click(function () {
                        var setDpNm = fnGetNASeatDpName(sFloor, sArea);
                        //console.log(setDpNm);
                        //fnReservationNASeat();
                        if (SELECTED_SEAT[this.id] == undefined) {

                            SELECTED_SEAT[this.id] = this;
                            //console.log("cc : "+this.data("bid"));
                            //fnReservationSeat(this.data("sbt"), this.data("gd"), this.id, setDpNm);

                            fnReservationNASeat( this.data("bid") , this.data("gd") , this.id , setDpNm);
                        } else {
                            fnCancelSeat(this.id)
                        }

                    });
                }
            }

        }

        return naBlock._getBBox();
    };

    me.DrawSeatBlock = function( pSB , pST )
    {
        var mx = pSB.cd.x;
        var my = pSB.cd.y;
        var mw = pSB.cd.w;
        var mh = pSB.cd.h;
        var mr = pSB.rt;
        var sw = pSB.ls;

        var sFloor = "";
        var sArea = "";
        var sRow = "";
        var sEtc = "";
        var dRow = null;

        sFloor = pSB.sntv.f;
        sArea = pSB.sntv.a;
        sEtc = pSB.sntv.e;

        var dSB = ezCusPaper.rect(mx, my, mw, mh, 0, sw, 'B', 'none');
        var bBoxInfo = dSB._getBBox();
        if (mr != 0)
        {
            dSB.rotate( mr , bBoxInfo.x + (bBoxInfo.width / 2),
                bBoxInfo.y + (bBoxInfo.height / 2));
        }

        if (pST != undefined) {
        	var txtPosMinX = 99999999;
        	var txtPosY = new Array();
        	var txtY = new Array();
            for (var i = 0; i < pST.ss.length; i++) {

            	//txtPosMinX = Math.min(txtPosMinX, pST.ss[i].cd.x);
            	txtPosY[pST.ss[i].rn] = pST.ss[i].cd.y;
            	txtY[pST.ss[i].rn] = pST.ss[i].rn;

                if (pST.ss[i].cd.x != null) {
                    var dST = ezCusPaper.rect(pST.ss[i].cd.x, pST.ss[i].cd.y, 11, 11, 0, 0, 'S', pST.ss[i].sid != null ? "#" + pST.ss[i].gc : '#DDDDDD');

                    dST.id = pST.ss[i].sid;
                    
                    if (mr != 0) {
                        dST.rotate(mr, bBoxInfo.x + (bBoxInfo.width / 2),
                            bBoxInfo.y + (bBoxInfo.height / 2));
                    }

                    if (pST.ss[i].sid != null) {

                        dST.data("snm"	, pST.ss[i].snm);
                        dST.data("sbt"	, pSB.sbt);
                        dST.data("gd"	, pST.ss[i].gd);
                        dST.data("rn"	, pST.ss[i].rn != "" ? pST.ss[i].rn : "");
                        dST.data("gn"	, pST.ss[i].gn);

                        if (MAP_VIEW_TYPE != "RS_MAP") {
                            dST.mouseover(function () {
                                this.attr("cursor", "pointer");
                            });

                            dST.mouseout(function () {
                                this.attr("cursor", "");
                            });

                            dST.click(function () {
                                var setDpNm = fnGetSeatDpName(sFloor, sArea, this.data("rn"), sEtc, this.data("snm"));
                                if(this.data("csnm") != null){
                                		setDpNm = this.data("csnm");
                                }
                                if (SELECTED_SEAT[this.id] == undefined) {
                                    SELECTED_SEAT[this.id] = this;
                                    fnReservationSeat(this.data("sbt"), this.data("gd"), this.id, setDpNm, this.data("csid"), this.data("gn"));
                                } else {
                                    fnCancelSeat(this.id)
                                }
                            });
                        }
                    } else {

                        if ( (MAP_VIEW_TYPE == "RS_MAP") || (MAP_VIEW_TYPE == "JN_MAP") )
                        {
                            if ( REV_SEAT_ARRAY[ pST.ss[i].sid ] != null)
                            {
                                dST.attr("fill", "#"+REV_SEAT_ARRAY[ pST.ss[i].sid ]);
                            }
                        }
                    }
                }
            }
            
            if (this.GetMapType() == "BLOCK"){
            		//txtPosMinX = blockTxtPosMinX;
	            	for(var i in txtPosY){
	            		if(blockTxtY[i] != txtY[i]){
	            			blockTxtY[i] = txtY[i];
		            		rSpace = 15 + ( (((txtY[i])+"").length) *2);
		            		dRow = ezCusPaper.text(rSpace , txtPosY[i] + 9 , txtY[i]).attr({'font-size': 12, 'fill':'#AAAAAA'});
		            		try {
		            			if (dRow.node.childNodes[0].attributes[0].name == "dy") {
		            				dRow.node.childNodes[0].attributes[0].value = 0;        
		            			}
		            		} catch (err) {}
		            		if (mr != 0) {
		            			dRow.rotate(mr, bBoxInfo.x + (bBoxInfo.width / 2),bBoxInfo.y + (bBoxInfo.height / 2));
		            		}
                            dRowList.push(dRow[0]);
	            		}
	            	}
            }
        }

        if (_VIEW_SEAT_BLOCK)
        {
            _LAST_SELECTED_SEAT_BLOCK_SNTV = sFloor+","+sArea;
        }

        return dSB.getBBox();
    };

    me.DrawBackBlock = function( pBB )
    {
        switch ( pBB.dt )
        {
            case "RECT":
                var mRect = new EzCusRect( pBB.cd.x , pBB.cd.y , pBB.cd.w , pBB.cd.h , ezCusPaper);
                mRect.SetStyle( pBB.fc , pBB.lc , pBB.ls);

                if (pBB.r != 0) {
                    mRect.SetRotate( pBB.r );
                }
                mRect = null;
                break;
            case "CIRCLE":
                var mCircle = new EzCusCircle(pBB.cd.x , pBB.cd.y, pBB.r, ezCusPaper);
                mCircle.SetStyle( pBB.fc , pBB.lc , pBB.ls);
                mCircle = null;
                break;
            case "LINE":
                var mLine = new EzCusLine( pBB.cd.x1 , pBB.cd.y1 , pBB.cd.x2 , pBB.cd.y2, ezCusPaper);
                mLine.SetStyle( pBB.lc , pBB.ls);
                mLine = null;
                break;
            case "PATH":
                var mPath = new EzCusPath( pBB.cd , ezCusPaper);
                mPath.DrawPath();
                mPath.SetStyle( pBB.fc , pBB.lc , pBB.ls);
                mPath = null;
                break;
            case "TEXT":
                var mText = new EzCusText( pBB.cd.x , pBB.cd.y , pBB.text, ezCusPaper);
                mText.SetStyle( pBB.font_name , pBB.font_size , pBB.font_color , pBB.font_effect);
                mText = null;
                break;
            case "IMAGE":
                var mObj = EzCusObject(pBB.cd.x , pBB.cd.y , pBB.obj, ezCusPaper);
                mObj = null;
                break;

        }
    };

    me.RemoveAll = function()
    {
        if (mBackGround != null ) {
            mBackGround.remove();
            mBackGround = null;
        }

        ezCusPaper.remove();
        panZoom = null;


        mFloor = "";
        mArea = "";
        mRow = "";
        mEtc = "";
        mNum = "";

        SELECTED_SEAT = null;
    };

    me.getBlockTxtPosMinX = function(pST)
    {
    		if (pST != undefined) {
            for (var i = 0; i < pST.ss.length; i++) {
            		blockTxtPosMinX = Math.min(blockTxtPosMinX, pST.ss[i].cd.x);
            }
    		}
    	};
    
    
};

