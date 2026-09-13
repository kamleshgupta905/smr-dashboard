// THEME OPTIONS.JS

  $(document).ready(function($) {

  	/* Selec your skin and layout Style */
	function interface(){
	    // Skin value
	    var skin = "yellow"; // green (default), red ,yellow,purple,blue, orange, purple, pink, cocoa, custom 

	    // Boxed value
	    var bg_color_header = "color-header-1"; // color-header-, color-header-2,color-header-3,color-header-4,color-header-5,color-header-6,color-header-7,color-header-8 (default)

	    var bg_parrner_header = "pattern-header-01"; // pattern-header-01(default),pattern-header-02,pattern-header-03,pattern-header-none

	    //var layout = "layout-semiboxed"; // layout-semiboxed(default), layout-boxed, layout-boxed-margin ,layout-wide

	    //Only in boxed version 
	    var bg = "none";  // none (default), bg1, bg2, bg3, bg4, bg5, bg6, bg7, bg8, bg9, bg10, bg11 

	    // Theme Panel - disable panel options
	    var themepanel = "1"; // 1 (default - enable), 0 ( disable)

	    $(".skin").attr("href", "css/skins/"+ skin + "/" + skin + ".css");
	    $("#fond-header").addClass(bg_color_header).addClass(bg_parrner_header);	
	    $("#layout").addClass(layout);	
	    $("body").addClass(bg);   
	    $("#theme-options").css('opacity' , themepanel);
	    return false;
  	}
  	interface();


	//=================================== Theme Options ====================================//
	$('.wide').click(function() {
		$('.boxed').removeClass('active');
		$('.boxed-margin').removeClass('active');
		$('.semiboxed').removeClass('active');
		$(this).addClass('active');
		$('.patterns').css('display' , 'none');
		$('#layout').removeClass('layout-semiboxed').removeClass('layout-boxed').removeClass('layout-boxed-margin').addClass('layout-wide');
	});
	$('.semiboxed').click(function() {
		$('.wide').removeClass('active');
		$('.boxed').removeClass('active');
		$('.boxed-margin').removeClass('active');
		$(this).addClass('active');
		$('.patterns').css('display' , 'block');
		$('#layout').removeClass('layout-wide').removeClass('layout-boxed').removeClass('layout-boxed-margin').addClass('layout-semiboxed');
	});
	$('.boxed').click(function() {
		$('.wide').removeClass('active');
		$('.boxed-margin').removeClass('active');
		$('.semiboxed').removeClass('active');
		$(this).addClass('active');
		$('.patterns').css('display' , 'block');
		$('#layout').removeClass('layout-semiboxed').removeClass('layout-boxed-margin').removeClass('layout-wide').addClass('layout-boxed');
	});
	$('.boxed-margin').click(function() {
		$('.boxed').removeClass('active');
		$('.wide').removeClass('active');
		$('.semiboxed').removeClass('active');
		$(this).addClass('active');
		$('.patterns').css('display' , 'block');
		$('#layout').removeClass('layout-semiboxed').removeClass('layout-wide').removeClass('layout-boxed').addClass('layout-boxed-margin');
	});


	//=================================== HEADER BG SKINS ====================================//
	$('.color-header-1').click(function() {
		$('#fond-header').removeClass('color-header-2').removeClass('color-header-3').removeClass('color-header-4').removeClass('color-header-5').removeClass('color-header-6').removeClass('color-header-7').removeClass('color-header-8').addClass('color-header-1');
	});
	$('.color-header-2').click(function() {
		$('#fond-header').removeClass('color-header-1').removeClass('color-header-3').removeClass('color-header-4').removeClass('color-header-5').removeClass('color-header-6').removeClass('color-header-7').removeClass('color-header-8').addClass('color-header-2');
	});
	$('.color-header-3').click(function() {
		$('#fond-header').removeClass('color-header-2').removeClass('color-header-1').removeClass('color-header-4').removeClass('color-header-5').removeClass('color-header-6').removeClass('color-header-7').removeClass('color-header-8').addClass('color-header-3');
	});
	$('.color-header-4').click(function() {
		$('#fond-header').removeClass('color-header-2').removeClass('color-header-3').removeClass('color-header-1').removeClass('color-header-5').removeClass('color-header-6').removeClass('color-header-7').removeClass('color-header-8').addClass('color-header-4');
	});
	$('.color-header-5').click(function() {
		$('#fond-header').removeClass('color-header-2').removeClass('color-header-3').removeClass('color-header-4').removeClass('color-header-1').removeClass('color-header-6').removeClass('color-header-7').removeClass('color-header-8').addClass('color-header-5');
	});
	$('.color-header-6').click(function() {
		$('#fond-header').removeClass('color-header-2').removeClass('color-header-3').removeClass('color-header-4').removeClass('color-header-5').removeClass('color-header-1').removeClass('color-header-7').removeClass('color-header-8').addClass('color-header-6');
	});
	$('.color-header-7').click(function() {
		$('#fond-header').removeClass('color-header-2').removeClass('color-header-3').removeClass('color-header-4').removeClass('color-header-5').removeClass('color-header-6').removeClass('color-header-1').removeClass('color-header-8').addClass('color-header-7');
	});
	$('.color-header-8').click(function() {
		$('#fond-header').removeClass('color-header-2').removeClass('color-header-3').removeClass('color-header-4').removeClass('color-header-5').removeClass('color-header-6').removeClass('color-header-7').removeClass('color-header-1').addClass('color-header-8');
	});

	//=================================== HEADER BG PATTERNS ====================================//
	$('.pattern-header-01').click(function() {
		$('#fond-header').removeClass('pattern-header-02').removeClass('pattern-header-03').addClass('pattern-header-01');
	});
	$('.pattern-header-02').click(function() {
		$('#fond-header').removeClass('pattern-header-01').removeClass('pattern-header-03').addClass('pattern-header-02');
	});
	$('.pattern-header-03').click(function() {
		$('#fond-header').removeClass('pattern-header-02').removeClass('pattern-header-01').addClass('pattern-header-03');
	});
	$('.pattern-header-none').click(function() {
		$('#fond-header').removeClass('pattern-header-02').removeClass('pattern-header-01').removeClass('pattern-header-03');
	});

	//=================================== Skins Changer ====================================//
    // General Skin
    $(".red").click(function(){
	   	$(".skin").attr("href", "css/skins/red/red.css");
	    return false;
	});
	$(".blue").click(function(){
	    $(".skin").attr("href", "css/skins/blue/blue.css");
	    return false;
	});
	$(".yellow").click(function(){
	    $(".skin").attr("href", "css/skins/yellow/yellow.css");
	    return false;
	});
	$(".green").click(function(){
	    $(".skin").attr("href", "css/skins/green/green.css");
	    return false;
	});
	$(".orange").click(function(){
    	$(".skin").attr("href", "css/skins/orange/orange.css");
    	return false;
	});
	$(".purple").click(function(){
	    $(".skin").attr("href", "css/skins/purple/purple.css");
	    return false;
	});
	$(".pink").click(function(){
	    $(".skin").attr("href", "css/skins/pink/pink.css");
	    return false;
	});
	$(".cocoa").click(function(){
        $(".skin").attr("href", "css/skins/cocoa/cocoa.css");
        return false;
   	});

	//=================================== Background Options ====================================//
	$('#theme-options ul.backgrounds li').click(function(){
	var 	$bgSrc = $(this).css('background-image');
		if ($(this).attr('class') == 'bgnone')
			$bgSrc = "none";

		$('body').css('background-image',$bgSrc);
		$.cookie('background', $bgSrc);
		$.cookie('backgroundclass', $(this).attr('class').replace(' active',''));
		$(this).addClass('active').siblings().removeClass('active');
	});

	//=================================== Panel Options ====================================//
	$('.openclose').click(function(){
		if ($('#theme-options').css('left') == "-220px")
		{
			$left = "0px";
			$.cookie('displayoptions', "0");
		} else {
			$left = "-220px";
			$.cookie('displayoptions', "1");
		}
		$('#theme-options').animate({
			left: $left
		},{
			duration: 500			
		});

	});

	$(function(){
		$('#theme-options').fadeIn();
		$bgSrc = $.cookie('background');
		$('body').css('background-image',$bgSrc);

		if ($.cookie('displayoptions') == "1")
		{
			$('#theme-options').css('left','-220px');
		} else if ($.cookie('displayoptions') == "0") {
			$('#theme-options').css('left','0');
		} else {
			$('#theme-options').delay(800).animate({
				left: "-220px"
			},{
				duration: 500				
			});
			$.cookie('displayoptions', "1");
		}
		$('#theme-options ul.backgrounds').find('li.' + $.cookie('backgroundclass')).addClass('active');

	});
});