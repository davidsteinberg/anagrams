/*
	File:    script.js
	Author:  David Steinberg
	Date:    2012.09.28
	Project: Anagrams
*/

////////////////////////////////////////////////////////
//	VARS
////////////////////////////////////////////////////////

// Local global vars
var text = '';
var beginning = true;

////////////////////////////////////////////////////////
//	ANAGRAM FUNCTION
////////////////////////////////////////////////////////

// Call to get the anagrams
function anagram() {

	// Remove current anagrams
	$("#wordCandidates").empty();

	// Stop if there are no more letters
	if (text.trim().length == 0) {
		$("#remainingLetters").html("&nbsp;");
		$('#wordCandidates').html("Good job! You used all the letters.");
		return false;
	}

	// Show loading gif and remaining letters
	$("#loading").css("visibility","visible");
	$("#remainingLetters").html(text);

	// Make sure to be at top of page
	$(document).scrollTop(0);

	// Ajax call to anagram.php
	$.ajax({
		type: 'POST',
		url: 'anagram.php',
		dataType: 'json',
		data: { input: text, language: $("#language").val() },
		success: function(data) {

			// Upon success, populate the anagram list
			var alphabetList = $('#wordCandidates');
			alphabetList.empty(); // Clear it first

			var ch = 0;

			for (var key in data) {

				// Put a new drop down header for each new letter
				if (data[key][0] != ch) {
					if (ch != 0)
						alphabetList.append('</ul></div>');
					ch = data[key][0];
					alphabetList.append('<div data-role="collapsible" data-collapsed-icon="arrow-r" data-theme="b" data-expanded-icon="arrow-d"><h2>'+ch.toUpperCase()+'</h2><ul data-theme="d" name="list" id="list'+ch.toUpperCase()+'"data-role="listview">'); // data-filter="true"
				}

				// Put in the current word
				$('#list'+ch.toUpperCase()).append('<li class="word center">'+data[key]+'</li>');
			}

			// Handle empty anagram list
			if ($("#wordCandidates").children().length == 0) {
				if (beginning)
					$('#wordCandidates').html("There seems to be a problem. Please try a shorter (or perhaps different) sentence.");
				else
					$('#wordCandidates').html("There are no more words to make with the remaining letters ("+$("#remainingLetters").text().trim()+").");
			}
			else {
				// Close off list
				alphabetList.append('</ul></div>');

				// Make jQuery elements pretty/functional again
				$('div[data-role=collapsible]').collapsible();
				$('ul[data-role=listview]').listview().trigger("create");
				$("ul").sortable({
					connectWith: "ul"
				});
			}

			// Get rid of loading gif
			$("#loading").css("visibility","hidden");
			beginning = false;
		}
	});
}

////////////////////////////////////////////////////////
//	SUBMIT ROUTINE FUNCTION
////////////////////////////////////////////////////////

// Routine to call on submit or language change
function submitRoutine() {

	// Make sure there is actually text
	if ($("#text").val().trim() == "") {
		$("#text").attr("placeholder","Please enter something first.");
		$("#text").focus();
		return false;
	} else {
		$("#text").attr("placeholder","Type words or names here");
	}

	beginning = true;

	// Empty the anagram list
	$("#wordChains").empty();

	// Put the letters into a sorted list
	text = $('#text').val().split('').sort().toString().replace(/,/g,' ');

	anagram();
}

////////////////////////////////////////////////////////
//	ON PAGE INIT
////////////////////////////////////////////////////////

// Upon page load and ready
$(document).bind('pageinit',function(){

	// Reset areas' heights
	$("#wordCandidates").css("height",$(window).height()-$("#header").height()-216);
	$(".recycling").css("height",$(window).height()-$("#header").height()-216);
	$("#wordChains").css("height",$(window).height()-$("#header").height()-216);

	// Text entry input box
	$("#text").bind("keypress",function(event){

		// Submit on enter key
		if (event.which == 13) {
			// Only keep letters
			$(this).val($(this).val().replace(/[^a-zA-Z\s]/g,''));
			$("#submit").trigger("click");
		}

	}).bind('blur',function(){ 

		// Only keep letters and spaces when blurred
		$(this).val($(this).val().replace(/[^a-zA-Z\s]/g,''));

	});

	// Make the saved words drag and droppable
	$("#wordChains").sortable({
		receive: function(event, ui) {

			var word = ui.item.text();

			var i = 0;
			for (i=0; i<word.length; i++)
				text = text.replace(word[i],'');
			text = text.split('').sort().toString().replace(/,/g,' ');

			// Show the recycling bin when new items are added
			$("#recyclingBin").show();

			anagram();
		}
	});

	// Handle clicks on anagrams
	$("#wordCandidates .word").live("click",function(){

		var word = $(this).text();
		var i = 0;

		// Remove letters of word from remaining letters
		for (i=0; i<word.length; i++)
			text = text.replace(word[i],'');

		// Put the letters into a sorted list
		text = text.split('').sort().toString().replace(/,/g,' ');

		// Save the word
		$("#wordChains").append('<li class="word center">'+word+'</li>');
		$("#wordChains").listview("refresh");
		$("#recyclingBin").show();

		anagram();
	});

	// Handle click on saved word
	$("#wordChains .word").live("click",function(){

		// Add letters back in
		var word = $(this).text();
		text += word;
		text = text.split('').sort().toString().replace(/,/g,' ');

		// Get rid of the word
		$(this).remove();
		if ($("#wordChains").children().length == 0)
			$("#recyclingBin").hide();

		anagram();
	});

	// Handle drag and drop from saved to recycling areas
	$(".recycling").sortable({
		receive: function(event, ui) {

			// Add letters back in
			text += ui.item.text();
			text = text.split('').sort().toString().replace(/,/g,' ');

			// Get rid of the word
			ui.item.remove();

			anagram();
		}
	});
	
	// Handle click on recycling bin
	$("#recyclingBin").live("click",function(){
		var wordChains = $("#wordChains");

		// Add letters back to the remaining letters and remove the saved words one by one
		while (wordChains.children().length != 0) {
			text += wordChains.children(0).text();
			text = text.split('').sort().toString().replace(/,/g,' ');
			wordChains.children(0).remove();
		}

		$("#recyclingBin").hide();

		anagram();
	});
	
	// Handle a change in language
	$("#language").live("change",function(){
		submitRoutine();
	});

	// Handle clicks on submit
	$('#submit').live('click',function(){
		submitRoutine();
	});
});