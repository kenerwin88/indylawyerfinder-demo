$(document).ready(function(){

	$( window ).resize(function() {
		if($( window ).width() < 768)
		{
			
			$(".eventBoxFrame:not(.avoid) > div:last-child > div> div:first-child").css("height", 'auto');

		}else{

			if($('.eventBox .innerEventDiv').length)
			{

				$(".eventBoxFrame:not(.avoid) > div:last-child > div> div:first-child").css("height", 'auto');

			}else{
				upcommingEventsResize();
			}
		}
		
	});

	if($( window ).width() < 768)
	{
		$(".eventBoxFrame:not(.avoid) > div:last-child > div> div:first-child").css("height", 'auto');

	}else{

		if($('.eventBox .innerEventDiv').length)
		{
			
			$(".eventBoxFrame:not(.avoid) > div:last-child > div> div:first-child").css("height", 'auto');

		}else{
			
			upcommingEventsResize();
			
		}
	}

	$('.sliderFrame > div.hiddenCarousel ul li').each(function(){
		var _this = $(this);
		$('.sliderFrame > .featuredCarouselOne:first').append('<div class="item">'+_this.html()+'</div>');			
	});

	var isEndCount=0; 
	var itemString=""; 
	$('.sliderFrame > div.hiddenCarousel ul li').each(function(index){
		var _this = $(this);
				
		if(isEndCount<4){
			itemString=itemString+'<li>'+_this.html()+'</li>';
		}

		isEndCount=isEndCount+1;

		if(isEndCount==4){
			itemString='<div class="item"><ul>'+itemString+'</ul></div>';	
			$('.sliderFrame > .featuredCarouseTwo:first').append(itemString);	
			itemString="";
			isEndCount=0;
		}

		if($('.sliderFrame > div.hiddenCarousel ul li').length-1==index && $.trim(itemString).length > 0){
			itemString='<div class="item"><ul>'+itemString+'</ul></div>';
			$('.sliderFrame > .featuredCarouseTwo:first').append(itemString);	
		}

	});

	var _partnerButton = $('.sliderFrame > div.hiddenCarousel  p:last-child a').parent().html();
	var _partnerHeading = $('.sliderFrame > div.hiddenCarousel p:first-child').clone().wrap('<div>').parent().html();
	$('.sliderFrame').append(_partnerButton);	
	$('.sliderFrame').prepend(_partnerHeading);	
	
	$('.footerBottomFrame ul li i').html('');
	
	$('ul.nav > li').has('ul').addClass('dropdown');
	$('ul.nav > li').has('ul').children('a').addClass('dropdown-toggle');
	$('ul.nav > li > ul').addClass('dropdown-menu row-fluid');
	$('ul.nav > li > ul > li').addClass('megaMenuSection');
	$('ul.nav > li > ul > li:first-child').addClass('xsHidden979');
	$('ul.nav > li > ul > li:first-child > div').addClass('heading text-center');
	$('ul.nav > li > ul > li > ul').addClass('mainMenu');
	
	
	addSearchSection();
	addmemberCenterSection();
	resizeMenuChange()
    $(window).resize(function(){
		resizeMenuChange()
	});
	
	$(".mainMenuOnclickBtn").click(function() {
		$(this).parents(".megaMenuSection").children(".mainMenuOnclick").slideToggle();
	});
		
	$('.mainNavigationWrapper').show();
	if($('.HighlightContent').length || $('.Resources').length)
	{
		$('.firstContentBox').css("padding","0 70px 15px");
	}

	if ($(".slider").is(':visible')) {
	    $(".slider .owl-carousel").owlCarousel({
	        items: 1,
	        margin: 0,
	        loop: true,
	        autoplay: true,
	        autoPlaySpeed: 5000,
	        animateIn: 'fadeIn',
	        animateOut: 'fadeOut',
	        touchDrag: false,
	        mouseDrag: false
	    });
	}    
	
	if ($(".sliderFrame").is(':visible')) {
		$(".sliderFrame .featuredCarouselOne").owlCarousel({
			margin: 10,
			nav: true,
			navText: ["<img src='images/prev.png'>", "<img src='images/next.png'>"],
			loop: $('div.hiddenCarousel ul li').length > 7,
			autoplay: true,
			autoPlaySpeed: 2000,
			responsive: {
				0: {
					items: 1,
					nav: false,
					margin: 15,
				},
				481: {
					items: 1,
					nav: false,
					margin: 15,
				},
				600: {
					items: 1,
					nav: false,
					margin: 15,
				},
				768: {
					items: 5
				},
				980: {
					items: 7
				},
				1200: {
					items: 7
				}
			}
		});

		$(".sliderFrame .featuredCarouseTwo").owlCarousel({
			margin: 10,
			nav: true,
			navText: ["<img src='images/prev.png'>", "<img src='images/next.png'>"],
			loop: $('div.hiddenCarousel ul li').length > 4,
			autoplay: true,
			autoPlaySpeed: 2000,
			responsive: {
				0: {
					items: 1,
					nav: false,
					margin: 15,
				},
				481: {
					items: 1,
					nav: false,
					margin: 15,
				},
				600: {
					items: 1,
					nav: false,
					margin: 15,
				},
				768: {
					items: 5
				},
				980: {
					items: 7
				},
				1200: {
					items: 7
				}
			}
		});
	}
	
	$(".EventboxCaret").click(function() {
		var _this=this;
		$(_this).siblings('.eventBoxFrame').children().eq(1).slideToggle(function(){			
			if($(this).is( ":hidden" )){
				$(_this).removeClass("fa-angle-down").addClass("fa-angle-right");
			}else{
				$(_this).removeClass("fa-angle-right").addClass("fa-angle-down");
			}
		}).show();		
	});

	 if ($('.mainNavigationWrapper .mc_form_login').length && typeof $._data($('.mainNavigationWrapper .mc_form_login')[0], "events") == "undefined") {
        mcValidateLogins($('.mainNavigationWrapper'));
    }
});

function upcommingEventsResize(){
	var upcommingHeight=0;
	$(".eventBoxFrame:not(.avoid) > div:last-child > div > div:first-child").each(function() {
		var height = 0;
		$(this).find('div').each(function() {			
			height=height+$(this).height();			
		});
		if(height > upcommingHeight){
			upcommingHeight=height;
		}
	
	});
	$(".eventBoxFrame:not(.avoid) > div:last-child > div> div:first-child").css("height", (upcommingHeight+80));
	upcommingHeight=0;
}     

function addSearchSection(){
	var _searchSection = $('#searchSectionContentTop').html();
	var _searchSectionBottom = $('#searchSectionContentBottom').html();
	var _navObject = $('.mainNavigationWrapper > ul');
	_navObject.prepend(_searchSection).append(_searchSectionBottom);;
}
function addmemberCenterSection(){
	var _memberCenterSection = $('#memberCenterSectionContentTop').html();
	var _memberCenterSectionBottom = $('#memberCenterSectionContentBottom').html();
	var _navObject = $('.mainNavigationWrapper > ul');
	_navObject.prepend(_memberCenterSection).append(_memberCenterSectionBottom);
}
function validateEmail(sEmail) {
	var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
	if (filter.test(sEmail)) {
		return true;
	} else {
		return false;
	}
}

function validateContactForm(){
	var errMsg = "";
	if($('#contactname').val().length == 0){
		errMsg = errMsg + "Please enter a valid Full Name.<br>";
	}
	if($('#contactemail').val().length == 0){
		errMsg = errMsg + "Please enter a valid Email Address.<br>";
	} else if(!validateEmail($('#contactemail').val())) {
		errMsg = errMsg + "Please enter a valid Email Address.<br>";
	}
	
	if(errMsg.length > 0) {
		$("#errContactMessage div").html(errMsg);
		$("#errContactMessage").removeClass('hidden');
		return false;
	} else {
		$("#errContactMessage div").html('');
		return true;
	}
}

function resizeMenuChange() {
	if ($(window).width() < 768) {

        $('.innerEventBox').find('.eventimgText');

        $('.eventimgText').append("<span class='menu-arrow'></span>");

        $(".eventimgText").children(".menu-arrow").click(function() {
            $(this).toggleClass('openBox');
            $(this).parents(".eventBoxTop").parents(".eventBoxFrame").children(".eventBoxBottom").slideToggle();
        });
    }
	if ($(window).width() < 980) {
		$(".btn-navbar").click(function() {
			$("body").toggleClass("overlay");
		});

		$(".dropdown").append("<span class='menu-arrow'></span>");
		
		$(".menu-arrow").click(function() {
			$(this).parents(".dropdown").toggleClass('open-droupdown');
			$(this).parents(".dropdown").children(".dropdown-menu").slideToggle();
		});
		
		$(".btn-navbar").click(function() {
			$(".dropdown").removeClass('open-droupdown');
			$(".dropdown-menu").hide();
		});

		$(".mainMenuMobBtn").click(function() {
			$(this).toggleClass('textUnderline');
			$(this).parents(".megaMenuSection").toggleClass('closeBox');
			$(this).parents(".megaMenuSection").children(".mainMenuMob").slideToggle();
			$(this).parents(".megaMenuSection").children(".mainMenuOnclickBtn").slideToggle();
			$(this).parents(".megaMenuSection").children(".mainMenuOnclickBtn").toggleClass('openBoxInner');
		});

	}
	
}