
$(document).ready(function(){






// 
//
//  SEQUENCER 
//
// 
// 






	var audio = new window.webkitAudioContext(),
	intervalId,
	position = 0,
	scale = {
		a: 150, //placeholder
		b: 493.88,
		c: 190, //placeholder
		d: 220, //placeholder
		e: 329.63,
		f: 349.23,
		g: 750 //placeholder
	},
	song = ["a","a","a","a"],
	loop = 0,
	attack = 200,
	decay = 200,
	tempo = 250,
	oscTwoFreq = 3/2;
	

   padVals = [
   	{column: 0, padNumber: 0, name:"padOne", note:"a"},
   	{column: 0, padNumber: 1, name:"padTwo", note:"g"}, 
   	{column: 0, padNumber: 2, name:"padThree", note:"b"}, 
   	{column: 0, padNumber: 3, name:"padFour", note:"e"},
   	{column: 1, padNumber: 0, name:"padFive", note:"a"},
   	{column: 1, padNumber: 1, name:"padSix", note:"g"}, 
   	{column: 1, padNumber: 2, name:"padSeven", note:"b"}, 
   	{column: 1, padNumber: 3, name:"padEight", note:"e"}, 	
   	{column: 2, padNumber: 0, name:"padNine", note:"a"},
   	{column: 2, padNumber: 1, name:"padTen", note:"g"}, 
   	{column: 2, padNumber: 2, name:"padEleven", note:"b"}, 
   	{column: 2, padNumber: 3, name:"padTwelve", note:"e"},
   	{column: 3, padNumber: 0, name:"padThirteen", note:"a"},
   	{column: 3, padNumber: 1, name:"padFourteen", note:"g"}, 
   	{column: 3, padNumber: 2, name:"padFifteen", note:"b"}, 
   	{column: 3, padNumber: 3, name:"padSixteen", note:"e"}   	
      ];



// generate the pads in html
    //   function generatePads () {      	
    //   	for (var i = 0; i < 4; i++) {
    //   		var column = i;

    //   		$(".padsTwo").append("<div class='noteCol'>asdf</div>");

   	// 		for (var i = 0; i < padVals.length; i++) {
	   //    		console.log (padVals[i].name);
	   //    		$(".padsTwo .noteCol").append("<div id='" + padVals[i].name + "'>" + padVals[i].note + "</div>");
				// };
    //   	};
    //   };

    //   generatePads();

      // choose freq of oscTwo
      $(".intervalSelector span").click(function() {
      	oscTwoFreq = $(this).attr("value");
      	$(".oscFreqSelected").removeClass("oscFreqSelected");
			$(this).addClass("oscFreqSelected");	
      });


	// highlight the selected pad
	function highlightIt(padNumber) {
		$(padNumber).closest(".noteCol").find(".highlighted").removeClass("highlighted")
		$(padNumber).addClass("highlighted");	
	};

	// find the note value of the clicked note
   function getNote(padClicked) {
   // function getNote(rowClicked, columnClicked) {
   	padNote = padVals.filter(function (padVals) { return padVals.name == padClicked });
   	padColumn = padNote[0].column;
   	padNote = padNote[0].note;
   	song[padColumn] = padNote;
   };

   // clicking a pad updates the note in the sequencer
	// $(".noteCol").on("click", "#padOne, #padTwo, #padThree, #padFour, #padFive, #padSix, #padSeven, #padEight, #padNine, #padTen, #padEleven, #padTwelve, #padThirteen, #padFourteen, #padFourteen, #padFifteen, #padSixteen", function () { 
	$(".noteCol div").on("click", function () { 
	   padClicked = $(this).attr("id");
	   highlightIt("#" + padClicked);
	   getNote(padClicked);
	});

//trying to refactor the above...
	// $(".noteCol div").on("click", function () { 
	//    columnClicked = $(this).closest(".noteCol").attr("value");
	//    rowClicked = $(this).attr("row");
	//  console.log("row = " + rowClicked + ", column = " + columnClicked);
	//    highlightIt("#" + padClicked);
	//    getNote(rowClicked, columnClicked);
	// });	


	// set tempo var based on slider position
	function getTempo() {
		tempo = 1/($(".tempoSlider").val())*700;
	}


	// on mouseup of tempo slider, update the tempo var and reset the setInterval
	$(".tempoSlider").on("mouseup", function() {
		clearInterval(intervalId);
		getTempo();
		intervalId = setInterval(play, tempo);
	})

	// on clicking play stop existing playing and start playing
	$("#playNotes").click(function() {
		stopIt();
		intervalId = setInterval(play, tempo);
		// song = $("#playNotesVal").val();
	});
	 
	// on clicking stop, stop music
	$("#stop").click(stopIt);

	// stop music function - reset play position and clear interval
	function stopIt() {
		clearInterval(intervalId);
		position = 0;
	};



	// Distortion curve, not sure what it does but i guess i need it
	function makeDistortionCurve(amount) {
	  var k = typeof amount === 'number' ? amount : 50,
	    n_samples = 44100,
	    curve = new Float32Array(n_samples),
	    deg = Math.PI / 180,
	    i = 0,
	    x;
	  for ( ; i < n_samples; ++i ) {
	    x = i * 2 / n_samples - 1;
	    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
	  }
	  return curve;
	  console.log(curve);
	};


	function createOscillator(freq) {

		var gain = audio.createGain(),
		osc = audio.createOscillator(),
		oscTwo = audio.createOscillator(),
		filter = audio.createBiquadFilter(),
		distortion = audio.createWaveShaper();
		
		// create osc1
		osc.frequency.value = freq;
		osc.type = "square";
		osc.connect(gain);
		osc.start(0);

		// create osc2
		console.log(oscTwoFreq);
		oscTwo.frequency.value = freq * oscTwoFreq;
		oscTwo.type = "sine";
		oscTwo.connect(audio.destination);
		oscTwo.start(0);

// Distortion params -- WHY IS SLIDER NOT WORKING??
		distortionCurveAmount = $(".distortionSlider").val(),
		distortion.curve = makeDistortionCurve(distortionCurveAmount);
		distortion.oversample = '4x';
	
		// Filter params
		filterFreq = $(".filterSlider").val();
		filterQ = $(".filterQSlider").val();
		filter.type = "lowpass";
		filter.frequency.value = filterFreq;
		filter.Q.value = filterQ;

		// connect gain > filter > distortion > output
		gain.connect(filter);
		filter.connect(distortion);
		distortion.connect(audio.destination);

		// set gain attack time
		attack = $(".attackSlider").val(),
		decay = $(".decaySlider").val(),
		gain.gain.setValueAtTime(0, audio.currentTime);
		gain.gain.linearRampToValueAtTime(1, audio.currentTime + attack / 1000);
		gain.gain.linearRampToValueAtTime(0, audio.currentTime + (decay + attack + 100)/ 1000);

		// remove the note after decay time
		setTimeout(function() {
			osc.stop(0);
			osc.disconnect(gain);
			gain.disconnect(audio.destination);

			oscTwo.stop(0);
			oscTwo.disconnect(gain);

		}, decay)

	}


	var colCounter = ["firstCol", "secondCol", "thirdCol", "fourthCol"];

	function play() {
		var note = song[position],
		freq = scale[note];
		var colCount = colCounter[position];
		
		$(".colCounterHighlighted").removeClass("colCounterHighlighted");
		$('.' + colCount).find(".colCounter").addClass("colCounterHighlighted"); //.closest(".colCounter")); //.addClass("colCounterHighlighted");
		position += 1;
		if(position >= song.length) {
			position = 0;
			loop++;
	  	}
		if(freq) {
			createOscillator(freq);
	  	}
	}

















});
