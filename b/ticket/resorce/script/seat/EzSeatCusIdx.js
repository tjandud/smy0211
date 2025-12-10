/**
 * Created by juhankim-lt on 15. 11. 10..
 */

var iezPaper = null;
var ipanZoom = null;
var iezCusMgn = null;

var imFloor = "";
var imArea = "";
var imRow = "";
var imEtc = "";
var imNum = "";

var i_LOAD_CUS_MAP_URL = "/seat/flplan/informScheduleSeat.json";

var iZONE_RECT = null;

var ZONE_BLOCK_SNTV_IDX = new Array();
var iZONE_BLOCK_ARRAY = new Array();

function fniLoadSeatMap( seatData )
{
    if (iZONE_RECT != null)
    {
        iZONE_RECT.remove();
        iZONE_RECT = null;
    }
    iZONE_BLOCK_ARRAY = null;
    iZONE_BLOCK_ARRAY = new Array();

    if (fnGetIndexMapLife())
    {
        if (ezCusMgn != null) {

            fniCusMapLoadingProcess(seatData);

        }
    }
}

function fniCusMapZoomRect( pF , pA)
{
    if (fnGetIndexMapLife()) {
        if (ezCusMgn.GetMapType() == "BLOCK") {

            try {
                if (iZONE_BLOCK_ARRAY[pF + "," + pA] != undefined) {
                    iZONE_BLOCK_ARRAY[pF + "," + pA].SetZoneViewRect();
                } else {
                }
            } catch (error) {
                console.log(error);
            }

        }
    }
}

function fniCusMapLoadingProcess( cusMap )
{
    if (iezCusMgn != null)
    {
        iezCusMgn.RemoveAll();
        iezCusMgn = null;
    }

    imFloor = (cusMap.snt.f.use == "Y" ? cusMap.snt.f.name : "");
    imArea = (cusMap.snt.a.use == "Y" ? cusMap.snt.a.name : "");
    imRow = (cusMap.snt.r.use == "Y" ? cusMap.snt.r.name : "");
    imEtc = (cusMap.snt.e.use == "Y" ? cusMap.snt.e.name : "");
    imNum = (cusMap.snt.n.use == "Y" ? cusMap.snt.n.name : "");

    iezCusMgn = new EzSeatCusIdx();
    iezCusMgn.InitSeat( "1" , cusMap.ms.width , cusMap.ms.height , cusMap.mt );
    //iezCusMgn.SetBackGroundColor( cusMap.bg );

    var SeatJson = cusMap.st;
    var tmpSeat = new Object();

    if (cusMap.im != undefined) {
        iezCusMgn.LoadIndexMap(cusMap.im);
    }

    if (ezCusMgn.GetMapType() == "BLOCK") {

        if (cusMap.da.bb != null) {
            for (var i = 0; i < cusMap.da.bb.length; i++) {
                iezCusMgn.DrawBackBlock(cusMap.da.bb[i]);
            }
        }

        if (cusMap.da.zb != null) {	//joyh 2016.10.11 수정
            for (var i = 0; i < cusMap.da.zb.length; i++) {
                iezCusMgn.DrawZoneBlock(cusMap.da.zb[i],imFloor,imArea);
            }
        	
            for (var i = 0; i < cusMap.da.zb.length; i++) {
            	iezCusMgn.DrawZoneFrontBlock(cusMap.da.zb[i],imFloor,imArea);
                try{
                	iZONE_BLOCK_ARRAY[cusMap.da.zb[i].snt.f+","+cusMap.da.zb[i].snt.a]
                }catch(error){
                	
                }
            }
        }
    }/*else{
        if (cusMap.im != undefined) {
            iezCusMgn.LoadIndexMap(cusMap.im);
        }
    }*/

    iezCusMgn.SetZoomView();
}

function fnSetidxSelectedSeatBlock( pSntvStr )
{

    if (iZONE_BLOCK_ARRAY != null) {

        for (strKey in iZONE_BLOCK_ARRAY) {
            iZONE_BLOCK_ARRAY[strKey].SetZoneSelect("Y");
        }

        for (strKey in iZONE_BLOCK_ARRAY) {
            if ( strKey == pSntvStr)
            {
                iZONE_BLOCK_ARRAY[strKey].SetZoneSelect("Y");
            }else{
                iZONE_BLOCK_ARRAY[strKey].SetZoneSelect("N");
            }
            //console.log(strKey);
        }
    }

}

// {{ hkcho
function fnSetidxSelectedSeatBlockList( pZoneSNTV )
{

    if (iZONE_BLOCK_ARRAY != null) {

    	ZONE_BLOCK_SNTV_IDX = Array();
        var zAr = pZoneSNTV.split(";");

        for (var i =0; i < zAr.length; i++)
        {
            ZONE_BLOCK_SNTV_IDX[zAr[i]] = zAr[i];
        }

        for (var i =0; i < iZONE_BLOCK_ARRAY.length; i++)
        {
        	iZONE_BLOCK_ARRAY[i].SetZoneShowHidden("Y");
        }

        for (var i =0; i < iZONE_BLOCK_ARRAY.length; i++)
        {
            if (ZONE_BLOCK_SNTV_IDX[iZONE_BLOCK_ARRAY[i].GetSNTV()] != null )
            {
            	iZONE_BLOCK_ARRAY[i].SetZoneShowHidden("Y");
            }else{
            	iZONE_BLOCK_ARRAY[i].SetZoneShowHidden("N");
            }
        }

        
    }

}

function SetGradeZoneIdxDefault()
{
	for (strKey in iZONE_BLOCK_ARRAY) {
		try{
			iZONE_BLOCK_ARRAY[strKey].SetZoneShowHidden("Y");
		}catch(error){
		}
    }
}

// }} hkcho

EzSeatCusIdx = function()
{
    var mBackGround = null;
    var mWidth =0;
    var mHeight = 0;

    var me = this;
    var mMapType = "";
    var IdxImage = null;

    me.InitSeat = function( pLocID , pWidth , pHeight , pMapType )
    {

        mWidth = pWidth;
        mHeight = pHeight;
        mMapType = pMapType;

        iezPaper = Raphael( "iez_canvas", $("#iez_canvas").width()*5 , $("#iez_canvas").height()*5 );
        iezPaper.canvas.style.backgroundColor = "#F4F4F4";

        iezPaper.setViewBox(0 , 0, pWidth , pHeight, true);
        iezPaper.canvas.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    };

    me.SetZoomView = function()
    {
        iezPaper.setViewBox(0 , 0, mWidth , mHeight, true);
    };

    me.LoadIndexMap = function( pImUrl )
    {
        if (pImUrl != "")
        {
        	pImUrl = pImUrl.replace("http:", "https:")
        var dwWidth = $("#ez_canvas").width();
        	var dwHeight = $("#ez_canvas").height();

            var iPosX = 0;
            var iPosY = 0;

            IdxImage = iezPaper.image( pImUrl , iPosX , iPosY , parseInt(mWidth) , parseInt(mHeight) );
        }
    };

    me.SetZoomBlock = function(pX , pY , pW , pH)
    {

        var mcW = $("#iez_canvas").width() / 2;
        var mcH = $("#iez_canvas").height() / 2;

        var poW = pW / 2;
        var poH = pH / 2;

        var zoomDif = $("#iez_canvas").width() / pW;  //(currHeight / 2) / pHc;
        
        ipanZoom = iezPaper.panzoom({
            initialZoom: zoomDif,
            maxZoom: 500,
            minZoom: -200,
            initialPosition: {x: pX - (pW / 2), y: pY - (pH / 2)}
        });
    };

    me.SetBackGroundColor = function( pbackColor )
    {
        iezPaper.canvas.style.backgroundColor = "#"+pbackColor;
    };

    me.SetBackGround = function ( pbackGround )
    {
    	if( undefined != pbackGround && "" != pbackGround){
    		pbackGround = pbackGround.replace("http:","https:")
    		mBackGround = iezPaper.image( pbackGround , 0 , 0 ,  mWidth , mHeight);
    		mBackGround.toBack();
    	}
    };

    //joyh 2016.10.11 수정
    me.DrawZoneBlock = function( pZB ,mFloorZone ,mAreaZone)
    {
        var zBlock = null;

        switch ( pZB.dt )
        {
           case "RECT":
                zBlock = new EzCusRect( pZB.cd.x , pZB.cd.y , pZB.cd.w , pZB.cd.h , iezPaper);
                zBlock.SetStyle( pZB.fc , pZB.lc , pZB.ls);

                if (pZB.r != 0) {
                    zBlock.SetRotate( pZB.r );
                }
                zBlock.SetSNTVLink(pZB.snt.f , pZB.snt.a );
                ZONE_BLOCK_SNTV_IDX[pZB.snt.f +","+ pZB.snt.a] = pZB.snt.f +","+ pZB.snt.a;
                iZONE_BLOCK_ARRAY.push(zBlock);
                break;
            case "CIRCLE":
                zBlock = new EzCusCircle(pZB.cd.x , pZB.cd.y, pZB.r , iezPaper);
                zBlock.SetStyle( pZB.fc , pZB.lc , pZB.ls);
                zBlock.SetSNTVLink(pZB.snt.f , pZB.snt.a);
                ZONE_BLOCK_SNTV_IDX[pZB.snt.f +","+ pZB.snt.a] = pZB.snt.f +","+ pZB.snt.a;
                iZONE_BLOCK_ARRAY.push(zBlock);
                break;
            case "PATH":
                zBlock = new EzCusPath( pZB.cd , iezPaper);
                zBlock.DrawPath();
                zBlock.SetStyle( pZB.fc , pZB.lc , pZB.ls);
                zBlock.SetSNTVLink(pZB.snt.f , pZB.snt.a);
                ZONE_BLOCK_SNTV_IDX[pZB.snt.f +","+ pZB.snt.a] = pZB.snt.f +","+ pZB.snt.a;
                iZONE_BLOCK_ARRAY.push(zBlock);
                break;
            case "TEXT":
                var mText = new EzCusText( pZB.cd.x , pZB.cd.y , pZB.text , iezPaper , pZB.font_name , pZB.font_size , pZB.font_color , pZB.font_effect);
                mText.SetStyle();
                mText = null;
                break;
        }
        
    };

    //joyh 2016.10.11 신규생성
    me.DrawZoneFrontBlock = function( pZB ,mFloorZone ,mAreaZone)
    {
        var zBlock = null;

        switch ( pZB.dt )
        {
           case "RECT":
                zBlock = new EzCusRect( pZB.cd.x , pZB.cd.y , pZB.cd.w , pZB.cd.h , iezPaper);
                zBlock.SetZoneFrontStyle( pZB.fc , pZB.lc , pZB.ls);

                if (pZB.r != 0) {
                    zBlock.SetRotate( pZB.r );
                }
                break;
            case "CIRCLE":
                zBlock = new EzCusCircle(pZB.cd.x , pZB.cd.y, pZB.r , iezPaper);
                zBlock.SetZoneFrontStyle( pZB.fc , pZB.lc , pZB.ls);
                break;
            case "PATH":
                zBlock = new EzCusPath( pZB.cd , iezPaper);
                zBlock.DrawPath();
                zBlock.SetZoneFrontStyle( pZB.fc , pZB.lc , pZB.ls);
                break;
        }
        
        if(undefined !== pZB.dt && ("RECT" === pZB.dt || "CIRCLE" === pZB.dt|| "PATH" === pZB.dt) ){

        	blockObj = zBlock.getObj();
        	blockObj.mouseover(function () {
        		  if(undefined !== ZONE_BLOCK_TITLE["'"+pZB.snt.f +","+ pZB.snt.a+"'"]){
                  	this.attr("cursor", "hand");
                  	this.attr("title", ZONE_BLOCK_TITLE["'"+pZB.snt.f +","+ pZB.snt.a+"'"]);
              }
            });

        	blockObj.mouseout(function () {
                this.attr("cursor", "");
            });

        	blockObj.click(function () {
        		if(undefined !== ZONE_BLOCK_TITLE["'"+pZB.snt.f +","+ pZB.snt.a+"'"]){
        			if(confirmChangeBlock()){
                        fnLoadSeatBlockById(pZB.snt.f, mFloorZone, pZB.snt.a, mAreaZone, ZONE_BLOCK_ID["'"+pZB.snt.f +","+ pZB.snt.a+"'"], true);
		        		parent.$("#mapClickYn").val("Y");
		        		$(".view_seat").attr("style","position: relative");
	        		}
        		}
        	});
        }
        
    };

    me.DrawBackBlock = function( pBB )
    {
        switch ( pBB.dt )
        {
            case "RECT":
                var mRect = new EzCusRect( pBB.cd.x , pBB.cd.y , pBB.cd.w , pBB.cd.h , iezPaper);
                mRect.SetStyle( pBB.fc , pBB.lc , pBB.ls);

                if (pBB.r != 0) {
                    mRect.SetRotate( pBB.r );
                }
                mRect = null;
                break;
            case "CIRCLE":
                var mCircle = new EzCusCircle(pBB.cd.x , pBB.cd.y, pBB.r , iezPaper);
                mCircle.SetStyle( pBB.fc , pBB.lc , pBB.ls);
                mCircle = null;
                break;
            case "LINE":
                var mLine = new EzCusLine( pBB.cd.x1 , pBB.cd.y1 , pBB.cd.x2 , pBB.cd.y2 , iezPaper);
                mLine.SetStyle( pBB.lc , pBB.ls);
                mLine = null;
                break;
            case "PATH":
                var mPath = new EzCusPath( pBB.cd , iezPaper);
                mPath.DrawPath();
                mPath.SetStyle( pBB.fc , pBB.lc , pBB.ls);
                mPath = null;
                break;
            case "TEXT":
                var mText = new EzCusText( pBB.cd.x , pBB.cd.y , pBB.text , iezPaper);
                mText.SetStyle( pBB.font_name , pBB.font_size , pBB.font_color , pBB.font_effect);
                mText = null;
                break;
            case "IMAGE":
                var mObj = EzCusObject(pBB.cd.x , pBB.cd.y ,pBB.obj , iezPaper);

        }
    };

    me.RemoveAll = function()
    {
        iezPaper.remove();
        ipanZoom = null;
        IdxImage = null;

    };

    me.DrawZoomRect = function( pX , pY , pW , pH )
    {
        if (iZONE_RECT != null)
        {
            iZONE_RECT.remove();
            iZONE_RECT = null;
        }
    }
};