
$(document).ready(function(){



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
       keyboard = new QwertyHancock(settings);


   masterGain = context.createGain();
   nodes = [];

   masterGain.gain.value = 0.3;
   masterGain.connect(context.destination); 

   keyboard.keyDown = function (note, frequency) {
       var oscillator = context.createOscillator();
       oscillator.type = 'square';
       oscillator.frequency.value = frequency;
       oscillator.connect(masterGain);
       oscillator.start(0);
       nodes.push(oscillator);
   };

   keyboard.keyUp = function (note, frequency) {
       var new_nodes = [];

       for (var i = 0; i < nodes.length; i++) {
           if (Math.round(nodes[i].frequency.value) === Math.round(frequency)) {
               nodes[i].stop(0);
               nodes[i].disconnect();
           } else {
               new_nodes.push(nodes[i]);
           }
       }

       nodes = new_nodes;
   };






	var audio = new window.webkitAudioContext(),
	position = 0,
	scale = {
		a: 150, //placeholder
		b: 493.88,
		c: 190, //placeholder
		d: 220, //placeholder
		e: 329.63,
		f: 349.23,
		g: 392
	},
	song = "gfefgg-fff-gbb-gfefggggffgfe---",
	loop = 0,
	attack = 200,
	decay = 200,
	tempo = 250;
	

	interval = function() {setInterval(play, tempo)};



	// make the tempoSlider work
	$(".tempoSlider").mousemove( function(){
		tempo = 1 / $(this).val() * 400;
	});


	$("#playNotes").click(function() {
		interval();
		song = $("#playNotesVal").val();
	});
	
// HOW CAN I STOP THIS?
	// $("#stop").click(function() {
	// 	clearInterval(interval);
	// 	console.log("stop")
	// });


	function createOscillator(freq) {

		var gain = audio.createGain(),
		osc = audio.createOscillator();

		$(".attackSlider").mousemove( function(){
			attack = $(this).val();
		});

		$(".decaySlider").mousemove( function(){
			decay = $(this).val();
		});

		console.log(decay);

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
		var note = song.charAt(position),
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
