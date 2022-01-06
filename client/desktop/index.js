import { Game } from "/game.js";

const game = new Game();
game.start();

const button = document.getElementsByTagName("button")[0];
button.onclick = () => {
  const introSection = document.getElementsByClassName("intro")[0];
  introSection.style.display = "none";
};

const socket = io();

var punchSound = new Howl({
  src: ["sounds/huh1.wav"]
});
var hadokenSound = new Howl({
  src: ["sounds/hadoken.mp3"]
});
var uppercut = new Howl({
  src: ["sounds/shoryuken.mp3"]
});

socket.on("gesture", function(data) {
  switch (data) {
    case "punch":
      punchSound.play();
      game.setLoopAndPosition([0, 1, 2], 2);
      break;
    case "hadoken":
      hadokenSound.play();
      game.setLoopAndPosition([0, 1, 2, 3], 0);
      break;
    case "uppercut":
      uppercut.play();
      game.setLoopAndPosition([0, 1, 2, 3, 4, 5, 6], 4);
      break;
    default:
      break;
  }
});
