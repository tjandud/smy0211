EzCusObject = function( pX , pY , strObj , ezPaper)
{
    var me = this;
    var mObj = ezPaper.image(OBJECT_IMAGE_PATH + strObj + "."+OBJECT_IMAGE_ATTR , pX , pY , OBJECT_IMAGE_WIDTH , OBJECT_IMAGE_HEIGHT);
};

EzCusText = function( pX , pY , pText , ezPaper , pFontName , pFontSize , pFontColor , pFontEffect)
{
    var me = this;
    var mText = ezPaper.text(pX , pY , pText , pFontName , pFontSize , pFontColor , pFontEffect);
    me.SetStyle = function() {
    		try{
            var _bb = mText._getTextBBox();      
        }catch(e){
            var _bb = mText.paper; // _getTextBBox(); 찾지 못할경우 처리 
        }
        mText.attr({"x" : pX + (_bb.width / 2) + 5, "y" : pY + (_bb.height / 1.22) + 5 });
    };
};

EzCusPath = function( pPath , pEzPaper)
{
    var me = this;
    var strCoord = pPath;
    var mPath = null;

    var mZoneFloor = "";
    var mZoneArea = "";

    var mFillColor = "";
    var ezPaper = pEzPaper;

    me.SetStyle = function( pFc , pLc , pLs )
    {
        mFillColor = pFc;
        mPath.attr({"fill" : "#" + pFc, "stroke" : "#" + pLc, "stroke-width" : pLs});
    };

    me.SetZoneFrontStyle = function( pFc , pLc , pLs )
    {
        mFillColor = pFc;
        mPath.attr({"fill" : "#" + pFc, "stroke" : "#" + pLc, "stroke-width" : pLs, "opacity" : "0"});
    };
    
    me.SetZoneSelect = function( pSel )
    {
        if (pSel == "Y")
        {
            mPath.attr("fill", "#"+mFillColor);
        }else{
            mPath.attr("fill", "#7c8283");
        }
    };

    me.SetZoneShowHidden = function( pSel )
    {
        if (pSel == "Y")
        {
            mPath.show();
        }else{
            mPath.hide();
        }
    };

    me.GetSNTV = function()
    {
        return mZoneFloor+","+  mZoneArea;
    };

    me.DrawPath = function()
    {
        mPath = ezPaper.path( this.GetCoord() );
    };

    me.GetCoord = function()
    {
        var coord = strCoord.split(":");
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

        return pathStr;
    };

    me.SetZoneViewRect = function()
    {
        iezCusMgn.DrawZoomRect(mPath._getBBox().x , mPath._getBBox().y , mPath._getBBox().width , mPath._getBBox().height);
    };

    me.SetSNTVLink = function( pF , pA )
    {
        mZoneFloor = pF;
        mZoneArea = pA;

        mPath.data("zf" , mZoneFloor);
        mPath.data("za" , mZoneArea);

        // if (MAP_VIEW_TYPE != "ZONE") {
        //     mPath.mouseover(function () {
        //         this.attr("cursor", "hand");
        //     });
        //
        //     mPath.mouseout(function () {
        //         this.attr("cursor", "");
        //     });
        //
        //     mPath.click(function () {
        //         fnGetSeatBlock(this.data("zf"), this.data("za"));
        //         fniCusMapZoomRect(this.data("zf"), this.data("za"));
        //     });
        // }
    }
 // {{ hkcho
    me.getObj = function()
    {
    	return mPath;
    }
 // }} hkcho
};

EzCusLine = function( pX1 , pY1 , pX2 , pY2 , ezPaper)
{
    var me = this;
    var mLine = ezPaper.path("M"+pX1+" "+pY1+"L"+pX2+" "+pY2);

    me.SetStyle = function( pLc , pLs )
    {
        mLine.attr({"stroke" : "#" + pLc, "stroke-width" : pLs});
    };
};

EzCusCircle = function(pX , pY , pR ,ezPaper)
{
    var me = this;
    var mCircle = ezPaper.circle(pX , pY , pR);

    var mZoneFloor = "";
    var mZoneArea = "";
    var mFillColor = "";

    me.SetStyle = function( pFc , pLc , pLs )
    {
        mFillColor = pFc;
        mCircle.attr({"fill" : "#" + pFc, "stroke" : "#" + pLc, "stroke-width" : pLs});
    };
    
    me.SetZoneFrontStyle = function( pFc , pLc , pLs )
    {
        mFillColor = pFc;
        mCircle.attr({"fill" : "#" + pFc, "stroke" : "#" + pLc, "stroke-width" : pLs, "opacity" : "0"});
    };
        
    me.SetZoneSelect = function( pSel )
    {
        if (pSel == "Y")
        {
            mCircle.attr("fill", "#"+mFillColor);
        }else{
            mCircle.attr("fill", "#7c8283");
        }
    };

    me.SetZoneShowHidden = function( pSel )
    {
        if (pSel == "Y")
        {
            mCircle.show();
        }else{
            mCircle.hide();
        }
    };

    me.SetZoneViewRect = function()
    {
        iezCusMgn.DrawZoomRect(mCircle._getBBox().x , mCircle._getBBox().y , mCircle._getBBox().width , mCircle._getBBox().height);
    };

    me.GetSNTV = function()
    {
        return mZoneFloor+","+  mZoneArea;
    };

    me.SetRotate = function( pRt )
    {
        mCircle.rotate( pRt , mCircle._getBBox().x + (mCircle._getBBox().width / 2),
            mCircle._getBBox().y + (mCircle._getBBox().height / 2));
    };

    me.SetSNTVLink = function( pF , pA )
    {
        mZoneFloor = pF;
        mZoneArea = pA;

        mCircle.data("zf" , mZoneFloor);
        mCircle.data("za" , mZoneArea);

        // if (MAP_VIEW_TYPE != "ZONE") {
        //     mCircle.mouseover(function () {
        //         this.attr("cursor", "hand");
        //     });
        //
        //     mCircle.mouseout(function () {
        //         this.attr("cursor", "");
        //     });
        //
        //     mCircle.click(function () {
        //         fnGetSeatBlock(this.data("zf"), this.data("za"));
        //         fniCusMapZoomRect(this.data("zf"), this.data("za"));
        //     });
        // }
    }
// {{ hkcho
    me.getObj = function()
    {
    	return mCircle;
    }
// }} hkho
};

EzCusRect = function( pX , pY , pW , pH , ezPaper)
{	
    var me = this;
    var mRect = ezPaper.rect( pX , pY , pW , pH );

    var mZoneFloor = "";
    var mZoneArea = "";
    var mFillColor = "";

    me.SetStyle = function( pFc , pLc , pLs )
    {
        mFillColor = pFc;
        mRect.attr({"fill" : "#" + pFc, "stroke" : "#" + pLc, "stroke-width" : pLs});
    };
    
    me.SetZoneFrontStyle = function( pFc , pLc , pLs )
    {
        mFillColor = pFc;
        mRect.attr({"fill" : "#" + pFc, "stroke" : "#" + pLc, "stroke-width" : pLs, "opacity" : "0"});
    };
    
    me.SetRotate = function( pRt )
    {
        mRect.rotate( pRt , mRect._getBBox().x + (mRect._getBBox().width / 2),
            mRect._getBBox().y + (mRect._getBBox().height / 2));
    };

    me.SetZoneSelect = function( pSel )
    {
        if (pSel == "Y")
        {
            mRect.attr("fill", "#"+mFillColor);
        }else{
            mRect.attr("fill", "#7c8283");
        }
    };

    me.SetZoneShowHidden = function( pSel )
    {
        if (pSel == "Y")
        {
            mRect.show();
        }else{
            mRect.hide();
        }
    };

    me.SetZoneViewRect = function()
    {
        iezCusMgn.DrawZoomRect(mRect._getBBox().x , mRect._getBBox().y , mRect._getBBox().width , mRect._getBBox().height);
    };

    me.GetSNTV = function()
    {
        return mZoneFloor+","+  mZoneArea;
    };

    me.SetSNTVLink = function( pF , pA )
    {
        mZoneFloor = pF;
        mZoneArea = pA;

        mRect.data("zf" , mZoneFloor);
        mRect.data("za" , mZoneArea);

        // if (MAP_VIEW_TYPE != "ZONE") {
        //     mRect.mouseover(function () {
        //         this.attr("cursor", "hand");
        //     });
        //
        //     mRect.mouseout(function () {
        //         this.attr("cursor", "");
        //     });
        //
        //     mRect.click(function () {
        //     	if(confirm('해당 구역에서 선택한 좌석 정보는 사라집니다. 계속 하시겠습니까?')){
	    //             fnGetSeatBlock(this.data("zf"), this.data("za"));
	    //             fniCusMapZoomRect(this.data("zf"), this.data("za"));
        //     	}
        //     });
        // }
    }
 // {{ hkcho
    me.getObj = function()
    {
    	return mRect;
    }
 // }} hkcho
};