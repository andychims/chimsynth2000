
$(document).ready(function(){


//
//  PIANO ROLL 
//

   // window.AudioContext = window.AudioContext || window.webkitAudioContext;

   var context = new AudioContext(),
       settings = {
			  id: 'keyboard',
	        width: 600,
	        height: 150,
	        octaves: 2,
	        startNote: 'A3',
	        whiteNotesColour: 'white',
	        blackNotesColour: 'black',
	        hoverColour: '#f3e939'
       },
       keyboard = new QwertyHancock(settings),
       freqMod = 0;



   masterGain = context.createGain();
   nodes = [];
   masterGain.gain.value = 0.1;
   masterGain.connect(context.destination); 

   osc2Gain = context.createGain();
   osc2Gain.gain.value = 0.9;
   osc2Gain.connect(context.destination); 

   keyboard.keyDown = function (note, frequency) {
       var oscillator = context.createOscillator();
       oscillator.type = 'square';
       oscillator.frequency.value = frequency + freqMod;
       oscillator.connect(masterGain);
       oscillator.start(0);
       nodes.push(oscillator);

       // var oscillator2 = context.createOscillator();
       // oscillator2.type = 'saw';
       // oscillator2.frequency.value = frequency;
       // oscillator2.connect(osc2Gain);
       // oscillator2.start(0);
       // nodes.push(oscillator2);
   };



   keyboard.keyUp = function (note, frequency) {
       var new_nodes = [];

       for (var i = 0; i < nodes.length; i++) {
           if (Math.round(nodes[i].frequency.value) === Math.round(frequency + freqMod)) {
               nodes[i].stop(0);
               nodes[i].disconnect();
           } else {
               new_nodes.push(nodes[i]);
           }
       }

       nodes = new_nodes;
   };



//
//  SEQUENCER 
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
	song = ["a","a","b","c"]
	loop = 0,
	attack = 200,
	decay = 200,
	tempo = 250;
	

   padVals = [
   	{slot: 1, name:"padOne", note:"a"},
   	{slot: 2, name:"padTwo", note:"g"}, 
   	{slot: 3, name:"padThree", note:"b"}, 
   	{slot: 4, name:"padFour", note:"e"},
   	{slot: 1, name:"padFive", note:"a"},
   	{slot: 2, name:"padSix", note:"g"}, 
   	{slot: 3, name:"padSeven", note:"b"}, 
   	{slot: 4, name:"padEight", note:"e"}   	
   ];




//
//	 clicking on pad1 should insert "a" into song[0] array spot. Clicking pad2 inserts "d"
//

// should i make the pad id's in an object/array??
	// padVals = {
	// 	padOne = 
	// }

	function highlightItOne(padNumber) {
		$(".firstCol .highlighted").removeClass("highlighted");
		$(padNumber).addClass("highlighted");	
	};

	function highlightItTwo(padNumber) {
		$(".secondCol .highlighted").removeClass("highlighted");
		$(padNumber).addClass("highlighted");	
	};	

   function getNote(padClicked) {
   	padNote = padVals.filter(function (padVals) { return padVals.name == padClicked });
   	padNote = padNote[0].note;
   	song[0] = padNote;
   };

	$(document).on("click", "#padOne, #padTwo, #padThree, #padFour", function () { 
	   padClicked = $(this).attr("id");
	   highlightItOne("#" + padClicked);
	   getNote(padClicked);
	});



   function getNoteTwo(padClicked) {
   	padNote = padVals.filter(function (padVals) { return padVals.name == padClicked });
   	padNote = padNote[0].note;
   	song[1] = padNote;
   };

	$(document).on("click", "#padFive, #padSix, #padSeven, #padEight", function () { 
	   padClicked = $(this).attr("id");
	   highlightItTwo("#" + padClicked);
	   getNoteTwo(padClicked);
	});


		

	$("#playNotes").click(function() {
		stopIt();
		tempoSlider = $(".tempoSlider").val();
		tempo = 1/tempoSlider * 500;
		console.log(tempo);
		intervalId = setInterval(play, tempo);
		// song = $("#playNotesVal").val();
	});
	 

	$("#stop").click(stopIt);


	function stopIt() {
		clearInterval(intervalId);
		position = 0;
	};



	function createOscillator(freq) {

		var gain = audio.createGain(),
		osc = audio.createOscillator();
		attack = $(".attackSlider").val();
		decay = $(".decaySlider").val();

		//set gain attack time
		gain.connect(audio.destination);
		gain.gain.setValueAtTime(0, audio.currentTime);
		gain.gain.linearRampToValueAtTime(1, audio.currentTime + attack / 1000);
		gain.gain.linearRampToValueAtTime(0, audio.currentTime + (decay + attack)/ 1000);

		osc.frequency.value = freq;
		osc.type = "square";
		osc.connect(gain);
		osc.start(0);

		//remove the note after decay time
		setTimeout(function() {
			osc.stop(0);
			osc.disconnect(gain);
			gain.disconnect(audio.destination);
		}, decay)

	}



	function play() {
		var note = song[position],
		freq = scale[note];
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
