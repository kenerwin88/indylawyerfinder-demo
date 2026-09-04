/*	Two blocks further down this file - the Handlebars helper registrations and the
	$(document).ready wiring - depend on head assets that can be absent or truncated by the
	time this file runs. Catching their failure is not enough on its own: the helpers and
	handlers are then gone for the life of the page even after head-asset recovery puts the
	missing library back, because nothing re-runs them. Both are defined here as named,
	idempotent steps with their own completion flags so the recovery block in cmsFunctions.cfc
	can call MCPlatformUtils.init() after a retry and repair whatever the broken pass dropped.

	Guarded with || so a re-request of this file (which recovery does when platformUtils itself
	arrived truncated) re-executes the top-level definitions without discarding the flags, and
	so cannot double-register a document-ready handler. */
window.MCPlatformUtils = window.MCPlatformUtils || { handlebarsReady: false, documentReadyWired: false, ready: false };

MCPlatformUtils.report = function(e) {
	if (typeof MCJSErrorReporting != 'undefined' && MCJSErrorReporting.exceptionHandler)
		MCJSErrorReporting.exceptionHandler(e);
	else
		console.error('MCJSErrorReporting.exceptionHandler not defined, falling back to console message', e);
};

try {
	var MCKeepAlive = {
		keepalivetimer: 0,
		keepalivetimeout: 0,
		keepaliveinterval: 0,
		interval: 0,
		doKeepAlive: function() {
			this.keepalivetimer = this.keepalivetimer + this.keepaliveinterval;
			try { TS_AJX('AJAXUTILS','ping',null); } catch (error) {}
			if (this.keepalivetimer >= this.keepalivetimeout) clearInterval(this.interval);
		},
		startKeepAlive: function(kaIntervalSeconds,kaTimeoutMinutes) {	
			kaIntervalSeconds = typeof(kaIntervalSeconds) != 'undefined' ? kaIntervalSeconds : 300; //Every 5 Minutes
			kaTimeoutMinutes = typeof(kaTimeoutMinutes) != 'undefined' ? kaTimeoutMinutes : 120; // Two Hours
			this.keepaliveinterval = kaIntervalSeconds * 1000;
			this.keepalivetimeout = kaTimeoutMinutes * 60 * 1000;
			this.interval = setInterval(this.doKeepAlive.bind(this) ,this.keepaliveinterval);
		}
	};
} catch(e) {
	if (MCJSErrorReporting && MCJSErrorReporting.exceptionHandler)
		MCJSErrorReporting.exceptionHandler(e)
	else 
		console.error(`MCJSErrorReporting.exceptionHandler not defined, falling back to console message`,e);
}

try {
	var MCLoader = {
		urlsAlreadyLoaded: {},
		_genericLoader: function(htmlTag,resourceUrl) {
			// generate a slug from the url to use as a key to track whether or not this has already been loaded
			let urlSlug = resourceUrl.replace(/[^\w]/gi,'-');

			// if we don't already have a promisfied loaded for this url, then create one
			if (!(urlSlug in this.urlsAlreadyLoaded)){
				this.urlsAlreadyLoaded[urlSlug] = new Promise(function (resolve, reject) {
					let element = document.createElement(htmlTag);
					element.src = resourceUrl;
					element.onload = function() {
						resolve(resourceUrl);
					};
					element.onerror = function(event) {
						let error = new Error(`Failed to load ${resourceUrl}`);
						if (MCJSErrorReporting && MCJSErrorReporting.exceptionHandler)
							MCJSErrorReporting.exceptionHandler(error)
						else 
							console.error('MCJSErrorReporting.exceptionHandler not defined, falling back to console message',error);
					};

					// Need to set different attributes depending on htmlTag type
					switch(htmlTag) {
						case 'script':
							element.async = true;
							element.src = resourceUrl;
							break;
						case 'link':
							element.type = 'text/css';
							element.rel = 'stylesheet';
							element.href = resourceUrl;
					}
					document.head.append(element);
				});
			}
			return this.urlsAlreadyLoaded[urlSlug];
		},
		loadJS: function(resourceUrl) { return this._genericLoader('script',resourceUrl)},
		loadCSS: function(resourceUrl) { return this._genericLoader('link',resourceUrl)}
	};
} catch(e) {
	if (MCJSErrorReporting && MCJSErrorReporting.promiseRejectionHandler)
		MCJSErrorReporting.exceptionHandler(e)
	else 
		console.error(`MCJSErrorReporting.exceptionHandler not defined, falling back to console message`,e);
}

// other code in platform might refer to this, so keeping the function name as an alias
function promiseScriptLoader (scriptURL) { 
	return MCLoader.loadJS(scriptURL);
} 

function textAreaValidation(fieldId, message) {
	var fieldTxt = $.trim($('#' + fieldId).val());
	var returnVal = true;
	
	if (fieldTxt.length == 0) {
		alert(message);
		returnVal = false;
	}	
	
	return returnVal;	
}

function selectValidation(fieldId, message) {
	var fieldTxt = $.trim($('#' + fieldId).val());
	var returnVal = true;
	
	if (fieldTxt.length == 0 || fieldTxt == 0) {
		alert(message);
		returnVal = false;
	}	
	
	return returnVal;	
}

// used to include events online meeting code when necessary
function useEventOnlineMeeting(e,m) {
	__ev_EOMvar = { eventid:e, mid:m, interval:60, token:'', timer:0 };

	var scriptsToLoad = [];
	scriptsToLoad.push(MCLoader.loadJS('/indylawyerfinder-demo/assets/common/javascript/eventsOnlineMeeting.js'));
	scriptsToLoad.push(MCLoader.loadJS('/indylawyerfinder-demo/assets/common/javascript/jQueryAddons/xdomainrequest/jquery.xdomainrequest.min.js'));

	Promise.all(scriptsToLoad)
	.then(function(){
		__ev_initEOM(__ev_EOMvar.eventid,__ev_EOMvar.mid);
	});
}

//used to facilitate collaspable areas
function initCollapsibleDivSet (commonClassNameForAllButtonsInCollapsableSet) {
	var lockTabFound = false;
	var tabList = $("ul").filter("." + commonClassNameForAllButtonsInCollapsableSet + ":first");
	var tabListDataSet = $(tabList).data(); 

	if (tabListDataSet != null) {
		if (!"mccollapsibledivautobuildtabs" in tabListDataSet)
			tabListDataSet.mccollapsibledivautobuildtabs = 0;
		if (!"mccollapsibledivviewclass" in tabListDataSet)
			tabListDataSet.mccollapsibledivviewclass = "";

		if (tabListDataSet.mccollapsibledivautobuildtabs && tabListDataSet.mccollapsibledivviewclass.length) {
			$("div").filter("." + tabListDataSet.mccollapsibledivviewclass).each(function(index, thisView){
				var thisViewDataSet = $(thisView).data(); 
				if (!"mccollapsibledivviewisselected" in thisViewDataSet)
					thisViewDataSet.mccollapsibledivviewisselected = 0;
				if (!"mccollapsibledivviewislocked" in thisViewDataSet)
					thisViewDataSet.mccollapsibledivviewislocked = 0;
				if (!"mccollapsibledivviewlabel" in thisViewDataSet)
					thisViewDataSet.mccollapsibledivviewlabel = $(thisView).id;
				$(tabList).append(buildCollapsibleDivPillHTML(
					$(thisView)[0].id,
					thisViewDataSet.mccollapsibledivviewisselected,
					thisViewDataSet.mccollapsibledivviewislocked,
					commonClassNameForAllButtonsInCollapsableSet,
					tabListDataSet.mccollapsibledivviewclass,
					thisViewDataSet.mccollapsibledivviewlabel));
		 	});
		}
	}
	var selectedElement = $("li ." + commonClassNameForAllButtonsInCollapsableSet + ":first");
	
 	$("li ." + commonClassNameForAllButtonsInCollapsableSet).each(function(index, value){
 		var thisDataSet = $(value).data(); 
 		if (thisDataSet.mccollapsibledivdisabled) {
 			$(value).addClass('tsAppNavButtonDisabled');
 		}
 		if (thisDataSet.mccollapsibledivlocked) {
 			lockTabFound = true;
 			selectedElement = value;
 		}
 		if (thisDataSet.mccollapsibledivselected) {
 			selectedElement = value;
 		}
 	});
	if (lockTabFound) {
		$("li ." + commonClassNameForAllButtonsInCollapsableSet).addClass('tsAppNavButtonDisabled');
	}
	$(selectedElement).removeClass('tsAppNavButtonDisabled');

	switchCollapsibleDiv(selectedElement);
}

function switchCollapsibleDiv (linkElement) {
	var commonClassNameForAllAreasInCollapsableSet = "." + $(linkElement).data("mccollapsibledivgroup");
	var areaToShow = "#" + $(linkElement).data("mccollapsibledivshow");
	var allLinkElements = "li ." + $(linkElement).data("mccollapsibledivbuttonclass");
	var changeHandler = $(linkElement).parent().parent().data("mccollapsibledivchangehandler");
	if (!$(linkElement).hasClass('tsAppNavButtonDisabled')) {
		$(commonClassNameForAllAreasInCollapsableSet).hide();
	 	$(commonClassNameForAllAreasInCollapsableSet).removeClass('tsAppNavButtonSelected');
	 	$(areaToShow).show();
	 	$(allLinkElements).removeClass('tsAppNavButtonSelected');
	 	$(linkElement).addClass('tsAppNavButtonSelected');
	 	
	 	
	 	
	 	if (changeHandler != null && typeof(window[changeHandler]) === "function") {
	 		window[changeHandler]($(areaToShow)[0]);
	 	}
	}
}

function lockCollapsibleDiv (commonClassNameForAllAreasInCollapsableSet) {
 	$(commonClassNameForAllAreasInCollapsableSet).hide();
 	$(areaToShow).show();
};

function buildCollapsibleDivPillHTML(viewId, isSelected, isLocked, buttonClass, group, name) {
	var returnString = '';

	returnString = '<li class="tsAppNavButton"><a \
					id="' + viewId + 'ViewButton" \
					data-mcCollapsibleDivShow="' + viewId + '" data-mcCollapsibleDivSelected="' + isSelected + '" \
					data-mcCollapsibleDivDisabled="false" data-mcCollapsibleDivLocked="' + isLocked + '" \
					data-mcCollapsibleDivButtonClass="' + buttonClass + '" data-mcCollapsibleDivGroup="' + group + '" class="' + buttonClass + '" \
					href="##" \
					onclick="switchCollapsibleDiv(this);">' + name + '</a></li>';
		
	return returnString;
}

function mcConvertRSSToJSON(rssxml) {
	var returnItems = [];
	$(rssxml).find("item").each(function () { // or "item" or whatever suits your feed
		var el = $(this);
		returnItems.push({
			"title":el.find("title").text(),
			"link":el.find("link").text(),
			"description":el.find("description").text(),
			"pubdate":Date.parse(el.find("pubDate").text())
		});
	});
	return returnItems;
}

function mcIsElementInViewport(element) {
	var elementTop = $(element).offset().top;
	var elementBottom = elementTop + $(element).height();
	var viewportTop = $(window).scrollTop();
	var viewportBottom = viewportTop + $(window).height();
	return elementBottom > viewportTop && elementTop < viewportBottom;
};

function mcExecuteMergeTemplates() {
	// find all merge templates and execute them
	$('.mcMergeTemplate').each(function(index,thisElement){
		return mcExecuteSingleMergeTemplate (thisElement);
	});	
}

function mcExecuteSingleMergeTemplate (mergeTemplateElement){
	var allowDebug = false;
	var jsondatavariablename = $(mergeTemplateElement).data('mcjsonvariable');
	var jsondata = window[jsondatavariablename];

	var replaceContainer = false;
	var mcmergereplacecontainer = $(mergeTemplateElement).data('mcmergereplacecontainer');
	var beforeFunctionName = $(mergeTemplateElement).data('mcmergerunbefore');
	var afterFunctionName = $(mergeTemplateElement).data('mcmergerunafter');

	let templateType = ""

	try {
		templateType = Object.keys(jsondata)[0];
	} catch(e) {
		templateType = "unknown";
	}

	gtag('event', 'merge_template_execution', { 
		'type': templateType,
		'jsondatavariablename': jsondatavariablename,
		'send_to': 'platformWide' 
	});

	if ($('#mcEditorBarControlPanelLink').length) {
		allowDebug = true;
	}

	if (mcmergereplacecontainer) {
		switch(mcmergereplacecontainer.toString().toLowerCase().trim()){
			 case "true": case "yes": case "1": 
				 replaceContainer = true;
				 break;
			 default: 
				 replaceContainer = false;
				 break;
		 }
	 }

	 if (beforeFunctionName) {
		 try {
			 if (beforeFunctionName && window[beforeFunctionName]) {
				 window[beforeFunctionName]();
			 }
		 } catch(e) {
			 if (console) {
				 console.error("Error Running mcmergerunbefore function named '" + beforeFunctionName + "' for mcjsonvariable " + jsondatavariablename);
			 }
		 }
	 }

	 try {
		var hbTemplateSource = $(mergeTemplateElement).html().trim();
		if (hbTemplateSource.length) {
			var hbTemplate = Handlebars.compile(hbTemplateSource);
			if (replaceContainer)
				$(mergeTemplateElement).replaceWith((hbTemplate(jsondata)));
			else
				$(mergeTemplateElement).html(hbTemplate(jsondata));
		} else if (allowDebug) {
			MCLoader.loadJS('/indylawyerfinder-demo/assets/common/javascript/prettyprint.js')
			.then(function(){
				$(mergeTemplateElement).html(prettyPrint( jsondata ));
			});
		}
	} catch(e) {
		if (allowDebug) $(mergeTemplateElement).html("<strong>Error in Handlebars Template</strong><br/>" + e.toString());
	}

	if (afterFunctionName) {
		try {
			if (afterFunctionName && window[afterFunctionName]) {
				window[afterFunctionName]();
			}
		 } catch(e) {
			 if (console) {
				 console.error("Error Running mcmergerunafter function named '" + afterFunctionName + "' for mcjsonvariable " + jsondatavariablename);
			 }
		 }
	 }

	$(mergeTemplateElement).show();
}

function mcValidateLogins(scope) {
	// login -- double click prevention and validation
	scope.find('.mc_form_login').submit(function () {
		var ae = [];
		if ($(this).find('input[name]').filter(function() { return this.name.toLowerCase() == 'username'; }).val().trim() == '') ae[ae.length] = 'Enter your username.';
		if ($(this).find('input[name]').filter(function() { return this.name.toLowerCase() == 'password'; }).val().trim() == '') ae[ae.length] = 'Enter your password.';
		if (ae.length) {
			if (typeof mcShowLoginError == 'function') mcShowLoginError(ae);
			else alert(ae.join('\n'));
			return false;
		} else {
			if (typeof mcHideLoginError == 'function') mcHideLoginError(ae);
			if (typeof mcShowLoggingIn == 'function') mcShowLoggingIn(ae);
			else $(this).find('button,input[type="submit"]').replaceWith('<nobr><i class="fa-regular fa-circle-notch fa-lg fa-spin"></i> Signing in...</nobr>');
			return true;
		}
	});
}

/*	moment 2.30 tightened strict parsing: the single-letter tokens M, D and h now reject
	zero-padded values that moment 2.10.6 accepted, so a hand-typed '08/03/2026' or a time
	typed as '02:30 PM' would silently fail validation. The pickers themselves always emit
	the unpadded form, but people type the padded one. Hand moment every padding variant --
	it tries each in turn and takes the first that validates.

	The variants overlap but never contradict: strict M is /^[1-9]\d?/, which matches '10'
	just fine, so '10/09/2026' satisfies both MM/DD/YYYY and M/DD/YYYY. That is harmless
	here because the '/' delimiters fix the segmentation -- each segment yields the same
	number no matter which variant consumed it. Keep that true of anything added below.

	Strictness itself is preserved, which is the point: partial input ('8/'), garbage,
	out-of-range values ('13/45/2026') and trailing text are all still rejected.

	If you ever add a strict format using w, W, k, H, m or s, note that 2.30 tightened
	those too -- w/W/k reject any leading zero, H/m/s reject '08' but allow a bare '0'.
	Nothing uses them strictly today.

	These lists are only for strict validation; the pickers still format with a single
	pattern (dateFormat / dateTimeFormat below) and that split is deliberate.	*/
var mca_strictDateFormats = ['M/D/YYYY', 'MM/DD/YYYY', 'M/DD/YYYY', 'MM/D/YYYY'];
var mca_strictDateTimeFormats = [
	'M/D/YYYY - h:mm A',   'M/D/YYYY - hh:mm A',
	'MM/DD/YYYY - h:mm A', 'MM/DD/YYYY - hh:mm A',
	'M/DD/YYYY - h:mm A',  'M/DD/YYYY - hh:mm A',
	'MM/D/YYYY - h:mm A',  'MM/D/YYYY - hh:mm A'
];

function mca_setValueForDatePickerField(ct, $input, format) {
	if (ct) $input.val(moment(ct).format(format));
}

function mca_validateOnChangeDateTime(ct, $input, earliest, latest, format) {
	if (ct) {
		if (earliest) {
			var earliestUnixtime = mca_getParsedDateTime(earliest);
			if (earliestUnixtime && ct.getTime() < earliestUnixtime) {
				$input.val(moment(earliestUnixtime).format(format));
			}
		}
		if (latest) {
			var latestUnixtime = mca_getParsedDateTime(latest);
			if (latestUnixtime && ct.getTime() > latestUnixtime) {
				$input.val(moment(latestUnixtime).format(format));
			}
		}
	}
}

function mca_setupDatePickerField(f, earliest, latest) {
	if($('#'+f).length) {
		var config = { format:'M/D/YYYY', formatDate:'M/D/YYYY', timepicker:false, todayButton:false, scrollInput:false };
			config.onChangeMonth = function(ct, $input) { mca_setValueForDatePickerField(ct, $input, config.format); };
			config.onChangeYear = function(ct, $input) { mca_setValueForDatePickerField(ct, $input, config.format); };
		
		if(earliest && earliest.length >= 8) config.minDate = earliest;
		if(latest && latest.length >= 8) config.maxDate = latest;

		if ('minDate' in config || 'maxDate' in config) {
			var ds = 'minDate' in config ? config.minDate : false;
			var de = 'maxDate' in config ? config.maxDate : false;
			config.onShow = function(ct, $input) { mca_validateOnChangeDateTime(ct, $input, ds, de, config.format); };
			config.onChangeDateTime = function(ct, $input) { mca_validateOnChangeDateTime(ct, $input, ds, de, config.format); };
		}

		$.datetimepicker.setDateFormatter('moment');
		$('#'+f).datetimepicker('destroy').datetimepicker(config);
	}
}

function mca_setupMultipleDatePickerFields(scope, fldclass, earliest, latest) {
	if(scope && scope.find('.'+fldclass).length) {
		var config = { format:'M/D/YYYY', formatDate: "M/D/YYYY", timepicker:false, todayButton:false, scrollInput:false };
			config.onChangeMonth = function(ct, $input) { mca_setValueForDatePickerField(ct, $input, config.format); };
			config.onChangeYear = function(ct, $input) { mca_setValueForDatePickerField(ct, $input, config.format); };
		
		if(earliest && earliest.length >= 8) config.minDate = earliest;
		if(latest && latest.length >= 8) config.maxDate = latest;

		if ('minDate' in config || 'maxDate' in config) {
			var ds = 'minDate' in config ? config.minDate : false;
			var de = 'maxDate' in config ? config.maxDate : false;
			config.onShow = function(ct, $input) { mca_validateOnChangeDateTime(ct, $input, ds, de, config.format); };
			config.onChangeDateTime = function(ct, $input) { mca_validateOnChangeDateTime(ct, $input, ds, de, config.format); };
		}

		$.datetimepicker.setDateFormatter('moment');
		scope.find('.'+fldclass).datetimepicker('destroy').datetimepicker(config);
	}
}

function mca_setupDateTimePickerField(f, earliest, latest, step) {
	if($('#'+f).length) {
		var config = { format:'M/D/YYYY - h:mm A', formatDate: "M/D/YYYY", formatTime: "h:mm A", timepicker:true, 
						showSecond:false, step:step, todayButton:false, scrollInput:false };
			config.onChangeMonth = function(ct, $input) { mca_setValueForDatePickerField(ct, $input, config.format); };
			config.onChangeYear = function(ct, $input) { mca_setValueForDatePickerField(ct, $input, config.format); };
		
		if(earliest && earliest.length >= 8) config.minDate = earliest;
		if(latest && latest.length >= 8) config.maxDate = latest;

		if ('minDate' in config || 'maxDate' in config) {
			var ds = 'minDate' in config ? config.minDate : false;
			var de = 'maxDate' in config ? config.maxDate : false;
			config.onShow = function(ct, $input) { mca_validateOnChangeDateTime(ct, $input, ds, de, config.format); };
			config.onChangeDateTime = function(ct, $input) { mca_validateOnChangeDateTime(ct, $input, ds, de, config.format); };
		}

		$.datetimepicker.setDateFormatter('moment');
		$('#'+f).datetimepicker('destroy').datetimepicker(config);
	}
}

function mca_setupTimePickerField(f, step) {
	if($('#'+f).length) {
		$.datetimepicker.setDateFormatter('moment');
		$('#'+f).datetimepicker('destroy').datetimepicker({ datepicker: false, format:"h:mm A", formatTime: "h:mm A", step:step });
	}
}

function mca_setupDatePickerRangeFields(f, t, bothOrNone, earliest, latest) {
	var minDate = (earliest && earliest.length >= 8) ? earliest : false;
	var maxDate = (latest && latest.length >= 8) ? latest : false;
	var dateFormat = 'M/D/YYYY';
	var mca_validateEndDateField = function(ct, $input) {
		if ($('#'+t).val().length > 0) {
			var endDate = new Date($('#'+t).val());
			if (ct && ct.getTime() > endDate.getTime()) $('#'+t).val($('#'+f).val()); 
		} else if(bothOrNone) {
			$('#'+t).val($('#'+f).val());
		}
	};
	
	$.datetimepicker.setDateFormatter('moment');
	$('#'+f)
		.datetimepicker('destroy')
		.datetimepicker({ 
			format:dateFormat, formatDate:dateFormat, timepicker:false, todayButton:false, scrollInput:false, minDate: minDate, maxDate: maxDate,
			onChangeMonth:function(ct, $input) { mca_setValueForDatePickerField(ct, $input, dateFormat); },
			onChangeYear:function(ct, $input) { mca_setValueForDatePickerField(ct, $input, dateFormat); },
			onShow:function(ct, $input) { mca_validateOnChangeDateTime(ct, $input, minDate, maxDate, dateFormat); },
			onChangeDateTime:function(ct, $input) { 
				mca_validateOnChangeDateTime(ct, $input, minDate, maxDate, dateFormat);
				mca_validateEndDateField(ct, $input); 
			}
		});

	$('#'+t)
		.datetimepicker('destroy')
		.datetimepicker({ 
			format:dateFormat, formatDate:dateFormat, timepicker:false, todayButton:false, scrollInput:false, minDate: minDate, maxDate: maxDate,
			onShow:function(ct) { this.setOptions({ minDate:$('#'+f).val()?$('#'+f).val():minDate });},
			onChangeMonth:function(ct, $input) { mca_setValueForDatePickerField(ct, $input, dateFormat); },
			onChangeYear:function(ct, $input) { mca_setValueForDatePickerField(ct, $input, dateFormat); },
			onChangeDateTime:function(ct, $input) { 
				mca_validateOnChangeDateTime(ct, $input, $('#'+f).val()?$('#'+f).val():minDate, maxDate, dateFormat);
				if(bothOrNone && !$('#'+f).val().length) $('#'+f).val($('#'+t).val());
			}
		});

	$('#'+f).off('keyup').on('keyup',function() {
		try {
			if (moment($('#'+f).val(),mca_strictDateFormats,true).isValid()) {
				let ct = new Date(moment($('#'+f).val(),mca_strictDateFormats,true));
				let dtInput = $('#'+f);
				mca_validateOnChangeDateTime(ct, dtInput, minDate, maxDate, dateFormat);
				mca_validateEndDateField(ct, dtInput);
			}
		} catch(e) {}
	});
}

function mca_setupDateTimePickerRangeFields(f, t, step, minDate) {
	var dateTimeFormat = 'M/D/YYYY - h:mm A';
	var mca_clearIfPastDate = function(ct, dtEl){
		var todayDate = new Date();
		todayDate.setHours(0, 0, 0, 0);
		if (todayDate.getTime() > ct.getTime()){
			dtEl.val('');
			return true;
		}
		return false;
	}
	var mca_onChangeStartDateTime = function(ct, $input) {
		if (ct && minDate == 0 && mca_clearIfPastDate(ct, $('#'+f))) return;

		if (ct && $('#'+t).val().length > 0) {
			var endDate = new Date($('#'+t).val().replace(' - ',' '));
			if (ct.getTime() > endDate.getTime()) $('#'+t).val($('#'+f).val());
		}
	};
	var mca_onChangeEndDateTime = function(ct, $input) {
		if (ct && minDate == 0 && mca_clearIfPastDate(ct, $('#'+t))) return;

		if (ct && $('#'+f).val().length > 0) {
			var startDate = new Date($('#'+f).val().replace(' - ',' '));
			if (startDate.getTime() > ct.getTime()) $('#'+t).val($('#'+f).val());
		}
	};

	$.datetimepicker.setDateFormatter('moment');

	var fromDateConfig = {
		format:dateTimeFormat, formatDate: "M/D/YYYY", formatTime: "h:mm A", timepicker:true, showSecond:false, step:step, todayButton:false, scrollInput:false,
		onChangeMonth:function(ct, $input) { mca_setValueForDatePickerField(ct, $input, dateTimeFormat); },
		onChangeYear:function(ct, $input) { mca_setValueForDatePickerField(ct, $input, dateTimeFormat); }, 
		onChangeDateTime:mca_onChangeStartDateTime
	};

	var toDateConfig = {
		format:dateTimeFormat, formatDate: "M/D/YYYY", formatTime: "h:mm A", timepicker:true, showSecond:false, step:step, todayButton:false, scrollInput:false,
		onShow:function(ct) {
			this.setOptions({
				minDate: $('#'+f).val() ? $('#'+f).val() : (typeof(minDate) != 'undefined' ? minDate : false)
			});
		},
		onChangeMonth:function(ct, $input) { mca_setValueForDatePickerField(ct, $input, dateTimeFormat); },
		onChangeYear:function(ct, $input) { mca_setValueForDatePickerField(ct, $input, dateTimeFormat); },
		onChangeDateTime:mca_onChangeEndDateTime
	};

	if(typeof(minDate) != 'undefined') {
		fromDateConfig.minDate = minDate;
	}

	$('#'+f).datetimepicker('destroy').datetimepicker(fromDateConfig);
	$('#'+t).datetimepicker('destroy').datetimepicker(toDateConfig);

	$('#'+f).off('keyup').on('keyup',function() {
		try {
			if (moment($('#'+f).val(),mca_strictDateTimeFormats,true).isValid()) {
				mca_onChangeStartDateTime(new Date(moment($('#'+f).val(),mca_strictDateTimeFormats,true)),$('#'+f));
			}
		} catch(e) {}
	});
}

function mca_setOptionsForDatePickerField(f,opts) {
	$('#'+f).datetimepicker('setOptions',opts);
}

function mca_getParsedDateTime(dt) {
	var parsedDateTime;
	try { parsedDateTime = dt.length ? new Date(dt.replace(' - ',' ')).getTime() : null; } catch (e) { };
	return parsedDateTime;
}

function mca_clearDateRangeField(f,t) {
	if(f && $('#'+f).length) $('#'+f).val('').trigger('change');
	if(t && $('#'+t).length) $('#'+t).val('').trigger('change');
}

function mca_setupCalendarIcons(scopeID) {
	$('#' + scopeID + ' span.calendar-button').click(function() {
		$('#' + $(this).data('target') + '.dateControl').focus();
	});
}

function mc_isValidBillingZip(z,sid,sc) {
	if ((sid == 0 && sc == '') || z.trim().length == 0) return false;

	let isValidZip = false;

	let chkZipResult = (r) => {
		if (r && r.isvalidzip) isValidZip = true;
	};

	let objParams = { billingZip:z, billingStateID:sid, billingState:sc };
	TS_AJX_SYNC('TSCOMMON','checkBillingZIP',objParams,chkZipResult,chkZipResult,5000,chkZipResult);
	
	return isValidZip;
}

function mca_initConfirmButton(actionBtn, onConfirmHandler, ovActionBtnHTML, ovConfirmBtnHTML, onConfirmLoadingText){
	// the disabled class only blocks pointer events, so guard here for keyboard activation while a confirmed action is in flight
	if (actionBtn.hasClass('disabled')) return;

	if (actionBtn.attr('data-confirm') == 1) {
		actionBtn.attr('data-confirm',0).addClass('disabled').html(onConfirmLoadingText ? onConfirmLoadingText : 'Deleting...');
		onConfirmHandler();
	} else {
		actionBtn.attr('data-confirm',1).html(ovConfirmBtnHTML ? ovConfirmBtnHTML : '<i class="fa-solid fa-circle-info"></i> Confirm');
		setTimeout(function(actionBtn){ 
			if (actionBtn.attr('data-confirm') == 1) {
				actionBtn.attr('data-confirm',0).removeClass('disabled').html(ovActionBtnHTML ? ovActionBtnHTML : '<i class="fa-solid fa-trash-can"></i>');
			}
		},2500,actionBtn);
	}
}

function mca_sanitizeInvNumInput(o,el) {
	let val = el.value.trim();
	
	// Strip all chars except letters, digits, and dash
	val = val.replace(/[^a-zA-Z0-9-]/g, '');

	if (val.includes("-")) {
		// if dash, grab everything after dash
		val = val.substring(val.lastIndexOf("-") + 1);
	} else {
		// if no dash, replace the o
		let regex = new RegExp(o, 'i');
		val = val.replace(regex, '');
	}

	// Remove non-digit characters and strip leading zeros
	val = val.replace(/\D/g, "").replace(/^0+/, '');

	el.value = val;
}

var helpersAlreadyTriggered = {};

function triggerHelperEvent(helperName) {
	try {
		if (!(helperName in helpersAlreadyTriggered)) { 
			//only trigger event per helper once per pageload
			helpersAlreadyTriggered[helperName]=1;
			gtag('event', 'merge_template_helper', { 
				'helper': helperName,
				'send_to': 'platformWide' 
			});
		}
	} catch(e){}
}

/*	Missing Handlebars is checked up front rather than left to throw on the first
	registerHelper call, so the report names the actual fault - an empty helper set - instead
	of a generic "Handlebars is not defined" that says nothing about what the page lost. */
MCPlatformUtils.registerHandlebarsHelpers = function() {
	if (MCPlatformUtils.handlebarsReady) return true;
	if (typeof Handlebars == 'undefined') {
		MCPlatformUtils.report(new Error('platformUtils: Handlebars unavailable - none of its Handlebars helpers are registered'));
		return false;
	}
	try {
Handlebars.registerHelper('moment', function(context, block) {

	triggerHelperEvent('moment');

	if (context && context.hash) {
		block = $.extend(true, {}, context);
		context = undefined;
	}
	var date = moment(context);
	var hasFormat = false;

	for (var i in block.hash) {
		if (i === 'format') {
			hasFormat = true;
		} else if (date[i]) {
			date = date[i](block.hash[i]);
		} else {
			console.log('moment.js does not support "' + i + '"');
		}
	}

	if (hasFormat) {
		date = date.format(block.hash.format);
	}
	return date;
});
Handlebars.registerHelper('inArray', function(elem, list, options) {

  triggerHelperEvent('inArray');

  if(list.indexOf(elem) > -1) {
    return list.indexOf(elem);
  }
  return -1;
});

Handlebars.registerHelper('duration', function(context, block) {
	triggerHelperEvent('duration');
	if (context && context.hash) {
		block = $.extend(true, {}, context);
		context = 0;
	}
	var duration = moment.duration(context);
	var hasFormat = false;

	// Reset the language back to default before doing anything else
	duration = duration.lang('en');

	for (var i in block.hash) {
		if (i === 'format') {
			hasFormat = true;
		} else if (duration[i]) {
			duration = duration[i](block.hash[i]);
		} else {
			console.log('moment.js duration does not support "' + i + '"');
		}
	}

	if (hasFormat) {
		duration = duration.format(block.hash.format);
	}
	return duration;
});

Handlebars.registerHelper('compare', function (lvalue, operator, rvalue, options) {

    var operators, result;

	triggerHelperEvent('compare');
    if (arguments.length < 3) {
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
    }
    
    if (options === undefined) {
        options = rvalue;
        rvalue = operator;
        operator = "===";
    }
    
    operators = {
        '==': function (l, r) { return l == r; },
        '===': function (l, r) { return l === r; },
        '!=': function (l, r) { return l != r; },
        '!==': function (l, r) { return l !== r; },
        '<': function (l, r) { return l < r; },
        '>': function (l, r) { return l > r; },
        '<=': function (l, r) { return l <= r; },
        '>=': function (l, r) { return l >= r; },
        '&&': function (l, r) { return l && r; },
        '||': function (l, r) { return l || r; },
        'typeof': function (l, r) { return typeof l == r; }
    };
    
    if (!operators[operator]) {
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
    }
    
    result = operators[operator](lvalue, rvalue);
    
    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

});

Handlebars.registerHelper ('truncate', function (str, len) {
	triggerHelperEvent('truncate');{}

	if (str.length > len && str.length > 0) {
        var new_str = str + " ";
        new_str = str.substr (0, len);
        new_str = str.substr (0, new_str.lastIndexOf(" "));
        new_str = (new_str.length > 0) ? new_str : str.substr (0, len);

        return new Handlebars.SafeString ( new_str +'...' ); 
    }
	
    return str;
});

Handlebars.registerHelper('stripHTMLtags', function(context) {
	triggerHelperEvent('stripHTMLtags');

	var returnText = context.replace(/<\/?[a-z][a-z0-9]*[^<>]*>/ig, "");
	returnText=returnText.replace(/&nbsp;/g,'');
	return returnText;
});

Handlebars.registerHelper('arrayToList', function(arrayValue,stringDelimiter) {
	triggerHelperEvent('arrayToList');
	return arrayValue.join(stringDelimiter);
});

Handlebars.registerHelper("math", function(lvalue, operator, rvalue, options) {
	lvalue = parseFloat(lvalue);
	rvalue = parseFloat(rvalue);

	triggerHelperEvent('math');
	return {
		"+": lvalue + rvalue,
		"-": lvalue - rvalue,
		"*": lvalue * rvalue,
		"/": lvalue / rvalue,
		"%": lvalue % rvalue
	}[operator];
});

Handlebars.registerHelper('var',function(name, value, context){
	triggerHelperEvent('var');
	this[name] = value;
});

Handlebars.registerHelper('for', function(from, to, incr, block) {
	var accum = '';

	triggerHelperEvent('for');
	for(var i = from; i < to; i += incr)
		accum += block.fn(i);
	return accum;
});

Handlebars.registerHelper ('urlencodedformat', function (str) {

	triggerHelperEvent('urlencodedformat');
	return encodeURIComponent(str).replace(/'/g, "%27");
});

/* taken from https://github.com/wycats/handlebars.js/issues/927##issuecomment-318640459 */
Handlebars.__switch_stack__ = [];
Handlebars.registerHelper("switch", function( value, options ) {

	triggerHelperEvent('switch');

	Handlebars.__switch_stack__.push({
		switch_match : false,
		switch_value : value
	});
	var html = options.fn( this );
	Handlebars.__switch_stack__.pop();
	return html;
});
Handlebars.registerHelper( "case", function( value, options ) {
	var args = Array.from( arguments );
	var options = args.pop();
	var caseValues = args;
	var stack = Handlebars.__switch_stack__[Handlebars.__switch_stack__.length - 1];

	triggerHelperEvent('case');

	if ( stack.switch_match || caseValues.indexOf( stack.switch_value ) === -1 ) {
		return '';
	} else {
		stack.switch_match = true;
		return options.fn( this );
	}
});
Handlebars.registerHelper( "default", function( options ) {
	var stack = Handlebars.__switch_stack__[Handlebars.__switch_stack__.length - 1];

	triggerHelperEvent('default');

	if ( !stack.switch_match ) {
		return options.fn( this );
	}
});
Handlebars.registerHelper('incremented', function (index) {
	index++;

	triggerHelperEvent('incremented');

	return index;
});
		MCPlatformUtils.handlebarsReady = true;
	} catch(e) {
		/*	A throw part-way through leaves the helper set incomplete, so the flag stays false
			and init() re-runs the whole set once recovery has restored what was missing.
			registerHelper overwrites by name, so replaying a partly-applied set is safe. */
		MCPlatformUtils.report(e);
	}
	return MCPlatformUtils.handlebarsReady;
};

function mc_setCookieConsent(optOut, notyUID) {
	if (window.mc_notyInstances && window.mc_notyInstances[notyUID]) {
		$(window.mc_notyInstances[notyUID].barDom).find('.noty_buttons button').prop('disabled', true);
	}
	TS_AJX('PLATFORM', 'setCookieConsent', {optOut: optOut}, function(r){
		if (window.mc_notyInstances && window.mc_notyInstances[notyUID]) {
			window.mc_notyInstances[notyUID].close();
			delete window.mc_notyInstances[notyUID];
		}
		if (window.dataLayer) {
			gtag('consent', 'update', {
				'ad_storage': optOut ? 'denied' : 'granted',
				'analytics_storage': optOut ? 'denied' : 'granted'
			});
			dataLayer.push({event: 'mc_cookie_consent', optOut: optOut});
		}
	});
}

function mc_getCookieConsentStatus() {
	try { return window._mc_nec_optOut === true; } catch(e) { return false; }
}

MCPlatformUtils.wireDocumentReady = function() {
	if (MCPlatformUtils.documentReadyWired) return true;
	if (typeof jQuery == 'undefined') {
		MCPlatformUtils.report(new Error('platformUtils: jQuery unavailable - merge templates and login validation are not wired'));
		return false;
	}
	try {
$(document).ready(function () {
	mcExecuteMergeTemplates();
	mcValidateLogins($('body'));

	// standard reusable double click prevention
	$('.mc_btn_submitonce').removeAttr('disabled');
	$('.mc_form_submitonce').submit(function () {
		$('.mc_btn_submitonce').attr("disabled", true);
		return true;
	});
});
		MCPlatformUtils.documentReadyWired = true;
	} catch(e) {
		MCPlatformUtils.report(e);
	}
	return MCPlatformUtils.documentReadyWired;
};

/*	Both steps run from here, and run again whenever the head-asset recovery block calls this
	after a retry. Each step no-ops if it already succeeded, so a second call restores only
	what the broken pass dropped. ready is the single answer to "is this file's init actually
	complete", which is what recovery reports on rather than assuming a restored file is
	enough. */
MCPlatformUtils.init = function() {
	var handlebarsReady = MCPlatformUtils.registerHandlebarsHelpers();
	var documentReadyWired = MCPlatformUtils.wireDocumentReady();
	MCPlatformUtils.ready = handlebarsReady && documentReadyWired;
	return MCPlatformUtils.ready;
};

MCPlatformUtils.init();


iOS_hoverFixLastItemClickedMarker = null;

function iOS_hoverFix_isTouchDevice(){
    return "ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch;
}

function iOS_hoverFix(selector) {
	if (iOS_hoverFix_isTouchDevice()) {
	    $(selector).each(function() {
	        $(this).bind('click', function() {
	        	if ((iOS_hoverFixLastItemClickedMarker != this)) {
	        		iOS_hoverFixLastItemClickedMarker = this;
	        		return false;
	        	}
	        	else {
	        		iOS_hoverFixLastItemClickedMarker = null;
	        		return true;
	        	}
	        });
	    });
	}
}

async function dynamicallyLoadUppy() {
	try {
		let { Uppy, Form, Dashboard, XHRUpload } = await import('//cdn.jsdelivr.net/npm/uppy@3.14.0/dist/uppy.min.mjs');
		await MCLoader.loadCSS("//cdn.jsdelivr.net/npm/uppy@3.14.0/dist/uppy.min.css");
		window.Uppy = Uppy;
		window.Form = Form;
		window.XHRUpload = XHRUpload;
		window.Dashboard = Dashboard;
	} catch(e) {
		console.error('Failed to load Uppy',e);
	}
}
/*
	Replaces the plupload queue widget's plain "file too large" alert with one that also
	states the configured limit. This lived as a local patch inside
	jquery.plupload.queue.js (MCDEV-8305) until MCDEV-12304, and was moved out so the
	vendored plupload bundle stays byte-identical to upstream and stays trivial to upgrade.

	Binds at a higher priority than the widget's own Error handler so this runs first, then
	returns false to stop propagation - that suppresses the widget's alert rather than
	producing a second one. Only FILE_SIZE_ERROR is short-circuited; every other error code
	falls through to the widget untouched. Files rejected on size never enter the queue, so
	the widget's row-styling branch is a no-op for this code and nothing is lost by
	skipping it.

	Stopping the chain also skips the page's own init.Error handler, though, because plupload
	binds those inside uploader.init() - i.e. AFTER the widget bound its handler - so they sit
	further down the same chain. Losing them would be a real regression: the blog and page
	JSON import screens record rejections in their upload summary from init.Error. So the
	page's handler is invoked directly below before returning false.

	Call with the queue instance right after initializing it:
		mcPluploadSizeLimitAlert($("#uploader").pluploadQueue());
*/
function mcPluploadSizeLimitAlert(uploader) {
	if (!uploader || typeof plupload == 'undefined') return uploader;

	uploader.bind('Error', function(up, err) {
		if (err.code != plupload.FILE_SIZE_ERROR || !err.file) return;

		var prefix = plupload.translate('Error: File too large:') || 'Error: File too large:';
		alert(prefix + " " + err.file.name + '. Upload a file smaller than '+ up.settings.filters.max_file_size +'.');

		// Hand off to the page's own Error handler, which returning false would otherwise skip.
		// plupload reads the init map the same way (see initControls in plupload.dev.js), and it
		// binds those handlers with the uploader as scope, so mirror that here.
		var pageInit = up.getOption('init');
		if (pageInit && typeof pageInit.Error == 'function') {
			try {
				pageInit.Error.call(up, up, err);
			} catch (e) {
				if (typeof console != 'undefined' && console.error) console.error('plupload page Error handler threw', e);
			}
		}

		return false;
	}, null, 1);

	return uploader;
}
