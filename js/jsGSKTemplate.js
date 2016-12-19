// ============================================================
// ========  EDIT MODE CHANGE TO CLEAR UP UI ==================
// ============================================================

var inDesignMode = document.forms[MSOWebPartPageFormName].MSOLayout_InDesignMode.value;
if (inDesignMode == "1" ) {	
	$("#sideNavBox").remove();
	$("#contentBox").css("margin-left", "32px");
	$("#contentRow").css("top", "0px");
}

// ============================================================
// ==========  GRAB THE USERS PROFILE ATTRIBUTES ==============
// ============================================================

$().SPServices({
	operation: "GetUserProfileByName",
	async: false,
	AccountName: $().SPServices.SPGetCurrentUser(),
	completefunc: function(xData, Status) {
		var details = [];
		
		details.push(getUPValue1(xData.responseXML, "UserName"));
		details.push(getUPValue1(xData.responseXML, "Office"));
		details.push(capitalize(getUPValue1(xData.responseXML, "GSK-Country")));
		details.push(getUPValue1(xData.responseXML, "GSK-BusinessLevel1"));
		details.push(getUPValue1(xData.responseXML, "GSK-BusinessLevel2"));
		details.push(getUPValue1(xData.responseXML, "GSK-BusinessLevel3"));
		
		if (inDesignMode != "1" ) {	
			// Do a search and replace for special characters and insert the current users first name.
			replaceValues("##firstname##", getUPValue1(xData.responseXML, "GSK-PreferredFirstName"));
			replaceValues("##office##", getUPValue1(xData.responseXML, "Office"));
			replaceValues("##country##", capitalize(getUPValue1(xData.responseXML, "GSK-Country")));
		}
		userAttributes(details);
	}
});


// ============================================================
// ===================  APPLY CH MEGA MENU  ===================
// ============================================================

getMenuItems();

// ============================================================
// ===========  ADOBE ANAYTICS EVENT LISTENERS  ===============
// ============================================================

//                  - Additional Metrics grabbed from all pages
//                  - The search queries
//                  - The left menu
//                  - Top GSK Navigation

$('img.ms-srch-sb-searchImg').click(function() {
	recordLinkClicks(setPageName2(window.location.href), "Search", $('#customGSKSearchQuery').val());
});

$('#customGSKSearchQuery').keydown(function(e) {
	if (e.which == 13) {	  
		recordLinkClicks(setPageName2(window.location.href), "Search", $('#customGSKSearchQuery').val());
	}
});

$(".ms-core-listMenu-item").click(function() {
	recordLinkClicks(setPageName2(window.location.href), "Left Menu", $(this).find("span .menu-item-text").html());
});

$("a.zz1_TopNavigationMenuV4_1").click(function() {
	recordLinkClicks(setPageName2(window.location.href), "GSK Global Nav", $(this).html());
});

// ============================================================
// ================      TEMPLATE METRICS   ===================
// ============================================================

$("body").on("click", "#topcarouselList li", function() {
	recordLinkClicks(setPageName2(window.location.href), "Top Carousel", $(this).find("h3").find("a").html());
});

$("body").on("click", "#mainLinkHolder", function() {
	recordLinkClicks(setPageName2(window.location.href), "Top Carousel", $(this).find("img").attr("title"));
});

$("body").on("click", ".twoinfoBoxColumn li", function() {
	recordLinkClicks(setPageName2(window.location.href), "Features - Big", $(this).find(".link-item").find("a").html());
});

$("body").on("click", ".threeinfoBoxColumn li", function() {
	recordLinkClicks(setPageName2(window.location.href), "Features - Small", $(this).find(".link-item").find("a").html());
});

$("body").on("click", "#profileListColTwo li", function() {
	recordLinkClicks(setPageName2(window.location.href), "News", $(this).find(".link-item").find("a").html());
});

$("body").on("click", "#multiTypeBottomColTwo li", function() {
	recordLinkClicks(setPageName2(window.location.href), "Feedback", $(this).find(".link-item").find("a").html());
});

// Check to see if the page is attached to a Campaign from PoliteMail or Newsweaver

var formattedCampaign = s.getQueryParam('utm_medium') + " / " + s.getQueryParam('utm_source') + " / ";

// Both vendors use the parameters differntly, check which is which and append the right string.
// We want the email subject line as the campaign name.
if (s.getQueryParam('utm_source') == "PoliteMail"){
	formattedCampaign += s.getQueryParam('utm_content');
}else{
	formattedCampaign += s.getQueryParam('utm_campaign');
}

// Activate the Adobe tracking Code
if (formattedCampaign != " /  / "){
	s.campaign = formattedCampaign;
}

var s_code = s.t();
if (s_code) document.write(s_code);

// ============================================================
// ================  BREADCRUMB ADJUSTMENTS ===================
// ============================================================

// Adjust the breadcrumb to add the Consumer Healthcare path.
$('#ctl00_SiteMapPath2 .breadcrumbRootNode').attr('href', 'https://connect.gsk.com/sites/cx').attr('title', 'Consumer Healthcare Home');

// Call the Adobe Analytics code that the corporate team are using..

loadJS("//nexus.ensighten.com/gsk/Bootstrap.js");

// ============================================================
// =======   HELPER FUNCTIONS FOR MEGA MENU ===================
// ============================================================

var arr = [];
var html = "";

function getMenuItems(){
	
	$(".gsksitemap").append("<div class='secondaryheader'><div class=\"inneritem\"><a class=\"chmenuiteminner\" href=\"https://connect.gsk.com/sites/cx\">Consumer Healthcare</a></div></div>");
	$("#zz1_TopNavigationMenuV4n0").next().next().find("table tbody tr").first().find("td").first().css("padding-left", "187px");		

	var Fields = "<ViewFields><FieldRef Name=\"ID\" /><FieldRef Name=\"Title\" /><FieldRef Name=\"URL\" /><FieldRef Name=\"New_x0020_Window\" /><FieldRef Name=\"Parent_x0020_ID\" /><FieldRef Name=\"Style\" /><FieldRef Name=\"Thumbnail_x0020_Image_x0020_URL\" /><FieldRef Name=\"Description\" /><FieldRef Name=\"HTML_x0020_File_x0020_Type\" /></ViewFields>";
	
	var CAML = "<Query><OrderBy><FieldRef Name='Sort_x0020_order' Ascending='True' /></OrderBy></Query>";

	// Let's get the single, most recent KPI record for any given scope
	$().SPServices({
		webURL:"https://connect.gsk.com/sites/Cx",
		operation: "GetListItems",
		async: true,
		listName: "Consumer Healthcare - Menu",
		CAMLViewFields: Fields,	
		CAMLQuery: CAML,	
		completefunc: function (xData, Status) {

			var quantity = $(xData.responseXML).SPFilterNode("z:row").length;
			
			$(xData.responseXML).SPFilterNode("z:row").each(function(id) {
				
				var thumbnail = "";
				var description = "";
				var thehtml = "";
				
				if(typeof $(this).attr("ows_Thumbnail_x0020_Image_x0020_URL") === "undefined"){
					thumbnail = "";
				}else{
					thumbnail = $(this).attr("ows_Thumbnail_x0020_Image_x0020_URL");
				}
				if(typeof $(this).attr("ows_Description") === "undefined"){
					description = "";
				}else{
					description = $(this).attr("ows_Description");
				}
				if(typeof $(this).attr("ows_HTML_x0020_File_x0020_Type") === "undefined"){
					thehtml = "";
				}else{
					thehtml = $(this).attr("ows_HTML_x0020_File_x0020_Type");
					
				}
				
				theMessage = '{'

				theMessage += '"id":' + JSON.stringify($(this).attr("ows_ID")) + ',';
				theMessage += '"title":' + JSON.stringify($(this).attr("ows_Title")) + ',';
				theMessage += '"url":' + JSON.stringify($(this).attr("ows_URL")) + ',';
				theMessage += '"newwindow":' + JSON.stringify($(this).attr("ows_New_x0020_Window")) + ',';
				theMessage += '"parentid":' + JSON.stringify(parseInt($(this).attr("ows_Parent_x0020_ID")), 10) + ',';
				theMessage += '"style":' + JSON.stringify($(this).attr("ows_Style")) + ',';
				theMessage += '"thumbnail":' + JSON.stringify(thumbnail) + ',';
				theMessage += '"description":' + JSON.stringify(description) + ',';
				theMessage += '"html":' + JSON.stringify(thehtml) + ',';
				theMessage += '"haschild":"false"';

				theMessage += "}";
				
				var obj = jQuery.parseJSON(theMessage);
				
				arr.push(obj);

			});
			
			checkForChildren();
			
			// Now we have an array of objects with the menu items in it - render it on the page.
			populateMenuList();
				
		}
	});	
}
	
function populateMenuList(){
	
	// Render the navigtion from a flat linked list (using recursive function)
	
	$("ul.megamenu").remove();
	
	var theHTML = "<ul class=\"megamenu\" style=\"display: none;\">"
	theHTML += eachRecursive(0, 0);
	theHTML += "</ul>";
	
	$(".secondaryheader").append(theHTML);
	
	// Call the mega menu plugin to render the nav properly
	$("ul.megamenu").megamenu({ 'show_method': 'fadeIn', 'hide_method': 'fadeOut' });
	
	$(".expandable").on("click", function(){
		$(this).parent().find("ul").toggle();
		if($(this).hasClass("selected")){
			$(this).removeClass("selected");
		}else{
			$(this).addClass("selected");
		}
	});
	
	// Enable Adobe Analytics on the mega menu at the top
	$("ul.megamenu a").on("click", function () {
		recordLinkClicks(setPageName2(window.location.href), "Mega Menu", $(this).html());
	});	
}

function eachRecursive(id, level)
{
        for (var x in arr) {  
            if (arr[x].parentid == id) {  
				var newwindow = "";
				if (arr[x].newwindow == 1){
					newwindow = " target=\"_blank\"";
				}
			
				if (level == 0){
					// Top level menu item..
					html += "<li class=\"mm-item\"><a href=\"" + arr[x].url +"\"" + newwindow + ">"+ arr[x].title +"</a>";
					html += "<div class=\"megamenucontent\"><ul>";
				}else if(level == 1){
					if(arr[x].haschild == "true"){
						html += "<li class=\"haschild\"><a href=\"" + arr[x].url + "\"" + newwindow + ">" + arr[x].title + "</a><div class=\"expandable\"></div><ul>";
					}else{
						html += "<li><a href=\"" + arr[x].url + "\"" + newwindow + ">" + arr[x].title + "</a></li>";
					}
				}else if(level == 2){
					// Left this in for future development..
					html += "<li><a href=\"" + arr[x].url + "\"" + newwindow + ">" + arr[x].title + "</a></li>";
				}
				
				// Check to see if there are any children under this menu item
				eachRecursive(arr[x].id, level + 1);  
					
				if (level == 0){
					html += "</ul><div style=\"clear: both;\"></div> </div></li>";				
				}else if(level == 1){
					if(arr[x].haschild == "true"){
						html += "</ul></li>";
					}					
				}
				

            }  
        } 
        return html;	
}

function checkForChildren(){
	for (i = 0; i < arr.length; i++){
		for (x = 0; x <  arr.length; x++){
			if (arr[i].id == arr[x].parentid){
				arr[i].haschild = "true";
			}
		}
	}
}

// ===============================================================================
// =======================   OMNITURE HELPER CODE  ===============================
// ===============================================================================

function setPageName2(fullURL){
    var theURL = fullURL.split("/");
    var thePath = "";
    
    if (theURL[4] != "Cx"){
        thePath += theURL[4];
    }
    else{
        thePath += "Homepage";
    }
    
    for(i = 5; i < theURL.length -1; i++){
        if (theURL[i] != "Pages"){
            thePath += " - " + theURL[i];
        }
    }
    return thePath;
}

// ===============================================================================
// =======================   HELPER FUNCTIONS ====================================
// ===============================================================================

function help(message){
	if (window.console) console.log(message);
}

function getUPValue1(x, p) {
	var thisValue = $(x).SPFilterNode("PropertyData").filter(function() {
		return $(this).find("Name").text() == p;
	}).find("Values").text();
	return thisValue;
}
function capitalize(s){
    return s.toLowerCase().replace( /\b./g, function(a){ return a.toUpperCase(); } );
};

function loadJS(file) {
    // DOM: Create the script element
    var jsElm = document.createElement("script");
    // set the type attribute
    jsElm.type = "application/javascript";
    // make the script element load file
    jsElm.src = file;
    // finally insert the element to the body element in order to load the script
    document.body.appendChild(jsElm);
}

function replaceValues(marker, value){

//  Need to develop this out.. 
	
}