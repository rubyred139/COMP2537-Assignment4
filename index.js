let endGame = false;
let click = 0;
// Retrieve the image urls based on difficulty level
const cardNum = async(cardnum)  => {
  let pokemonImg = []
  let res1 = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  for (let i=0; i<cardnum/2; i++) {
    let randIndex = Math.floor(Math.random() * 810 ) + 1; 
    let pokemon = res1.data.results[randIndex]; //randomly retrieve the pokemon url
    let res2 = await axios.get(pokemon.url)
    let img = res2.data.sprites.front_default; //retrieve the img url of the pokemon
    pokemonImg.push(img);      
  }
  return pokemonImg;
}

const levelChoice = (difficulty) => {
  let level;
  switch (difficulty) {
    case "easy":
      level = [6, 100]
      console.log("easy selected")
      break;
    case "medium":
      level = [12, 200]
      console.log("medium selected")
      break;
    case "hard":
      level = [24, 300]
      console.log("hard selected")
      break;  
    default:
      level = [6, 100]
      console.log("default selected")
  }
  return level;
}

let timeLimit;
const setup = async (level) => {
  
  let num = level[0] // num of cards displayed
  timeLimit = level[1] // length of time
   $("#timer").text(timeLimit);
  
  let pokemonImg = await cardNum(num)
  $("#total").text(pokemonImg.length) //display total num of pairs
  let pokemons = pokemonImg.concat(pokemonImg) //duplicate itself

  // Shuffle the pokemon url array
  for (let i = pokemons.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    let temp = pokemons[i]
    pokemons[i] = pokemons[j]
    pokemons[j] = temp
  }
  console.log(pokemons)

  // display cards
  $('#game_grid').empty()
  for (let i=0; i<pokemons.length; i++) {
    $('#game_grid').append(`
    <div class="card">
      <img id="img-${i}" class="front_face" src="${pokemons[i]}"/>
      <img class="back_face" src="back.webp" alt="">
    </div>  
      `)  
  }

  let firstCard = undefined
  let secondCard = undefined
  let islocked = false
  let matchCount = 0;
  let leftPairs = num;



  $("body").on("click", ".card", async function(e) {
    
    click++;
    if ($(this).hasClass("matched") || islocked) { // do nothing if the card is matched
      return;
    }
    const clickedCard = $(this).find(".front_face")[0];

    if (!firstCard) { // true if firstCard is undefined; false if firstCard is assigned value
      $(this).toggleClass("flip");
      firstCard = clickedCard;

    } else if(firstCard.id !== clickedCard.id){ // do nothing if the same card clicked twice

      $(this).toggleClass("flip");
      secondCard = clickedCard;
      islocked = true

      if (firstCard.src == secondCard.src) {
        console.log("match");
        matchCount++;
        leftPairs--;
        $(`#${firstCard.id}`).parent().addClass("matched") 
        $(`#${secondCard.id}`).parent().addClass("matched")


        firstCard = undefined
        secondCard = undefined
        islocked = false

      } else {
        console.log("no match")
        setTimeout(() => {
          $(`#${firstCard.id}`).parent().toggleClass("flip")
          $(`#${secondCard.id}`).parent().toggleClass("flip")
          firstCard = undefined
          secondCard = undefined
          islocked = false

        }, 1000)
      }
    }
    if (matchCount == pokemonImg.length) { // display winning message
      setTimeout(() => {
        alert("You win!")
      }, 1000)
      endGame = true;
    }

    const cards = $(".card") // get all the cards  
    console.log(cards)
    powerUp(cards)


    $("#matches").text(matchCount) // display num of matches    
    $("#left").text(leftPairs) // display num of pairs left
    $("#clicks").text(click) // display num of clicks

  });
}

let selectedDifficulty
const startGame = () => {


  const difficultyButtons = document.querySelectorAll('label');
  difficultyButtons.forEach((label) => {
    label.addEventListener("click", function() {
      selectedDifficulty = label.querySelector("input").value
    });
  });

  const start = document.getElementById("start")
  start.addEventListener("click", async() => {

    const info = document.getElementById("info")
    const gameGrid = document.getElementById("game_grid")
    const themes = document.getElementById("themes")
    info.style.display = "block";
    gameGrid.style.display = "flex"
    themes.style.display = "block"
    hideElement(start)
      let seconds = -1
  const interval = setInterval(() => {
    let timeLimit = levelChoice(selectedDifficulty)[1]

    seconds++;
    $("#time").text(seconds);
    let secondsText = seconds == 0 || seconds == 1 ? "second" : "seconds";
    $("#s").text(secondsText);
    if(endGame) {
      stopTimer(interval)
    } else if (seconds === timeLimit ) {
      console.log("stopped")
      stopTimer(interval); // Stop the interval
      $('header').empty()
      $('header').append(`
        <div style="font-weight:bold">Time's up!</div>
      `
      )
      $('#game_grid').empty()
      // <div id="game_grid" style="width: 600px; height: 400px; border: 2px tomato solid">
      $('#game_grid').append(`
      <h1 style="color:#007bff">
        <a href="index.html">Try Again!</a>
      </h1>`)
    }


  }, 1000)

  function stopTimer(interval){
    clearInterval(interval); // Stop the interval
  }

      
  $("#dark").click(function() {

    $(".card").css("background-color", "black");
    $("#game_grid").css("background-color", "black");
  });
  $("#light").click(function() {
    $(".card").css("background-color", "white");
    $("#game_grid").css("background-color", "white");
  });
    level = levelChoice(selectedDifficulty)
    await setup(level)

  })
}

$(document).ready(startGame)

function hideElement(element) {
  element.style.display = "none";
}

// powerup get activated every 5 clicks
function powerUp(cards) {
  console.log("powerup");
  if (click % 5 === 0 && click !== 0) {
    cards.each((index, card) => {
      console.log(card);
      if (!$(card).hasClass("flip") && !$(card).hasClass("match")) {
        setTimeout(() => {
          $(card).toggleClass("flip");

          setTimeout(() => {
            $(card).toggleClass("flip");
          }, 1000);
        }, 1000);
      }
    });
  }
}



