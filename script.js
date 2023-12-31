const typingText = document.querySelector(".typing-text p"),
  inpField = document.querySelector(".wrapper .input-field"),
  tryAgainBtn = document.querySelector(".content button"),
  timeTag = document.querySelector(".time span b"),
  mistakeTag = document.querySelector(".mistake span"),
  wpmTag = document.querySelector(".wpm span"),
  cpmTag = document.querySelector(".cpm span");

let timer,
  maxTime = 60,
  timeLeft = maxTime,
  charIndex = (mistakes = isTyping = 0);


async function loadParagraph() {
  try {
    // Fetch the JSON file
    const response = await fetch("paragraph.json");

    // Check if the response is successful (status code 200)
    if (!response.ok) {
      throw new Error(
        `Failed to fetch 'paragraph.json': ${response.statusText}`
      );
    }

    // Parse the JSON data
    const paragraphsData = await response.json();

    // Accessing paragraphs array
    const paragraphs = paragraphsData.paragraphs;

    // Logging the first paragraph
    const ranIndex = Math.floor(Math.random() * paragraphs.length);
    typingText.innerHTML = "";
    paragraphs[ranIndex].split("").forEach((char) => {
      let span = `<span>${char}</span>`;
      typingText.innerHTML += span;
    });
    typingText.querySelectorAll("span")[0].classList.add("active");
    document.addEventListener("keydown", () => inpField.focus());
    typingText.addEventListener("click", () => inpField.focus());
  } catch (error) {
    console.error("Error fetching JSON:", error.message);
  }
}

function initTyping() {
  let characters = typingText.querySelectorAll("span");
  let typedChar = inpField.value.split("")[charIndex];
  if (charIndex < characters.length - 1 && timeLeft > 0) {
    if (!isTyping) {
      timer = setInterval(initTimer, 1000);
      isTyping = true;
    }
    if (typedChar == null) {
      if (charIndex > 0) {
        charIndex--;
        if (characters[charIndex].classList.contains("incorrect")) {
          mistakes--;
        }
        characters[charIndex].classList.remove("correct", "incorrect");
      }
    } else {
      if (characters[charIndex].innerText == typedChar) {
        characters[charIndex].classList.add("correct");
      } else {
        mistakes++;
        characters[charIndex].classList.add("incorrect");
      }
      charIndex++;
    }
    characters.forEach((span) => span.classList.remove("active"));
    characters[charIndex].classList.add("active");

    let wpm = Math.round(
      ((charIndex - mistakes) / 5 / (maxTime - timeLeft)) * 60
    );
    wpm = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;

    wpmTag.innerText = wpm;
    mistakeTag.innerText = mistakes;
    cpmTag.innerText = charIndex - mistakes;
  } else {
    clearInterval(timer);
    inpField.value = "";
    showModal();
  }
}
function showModal() {
  const currentScore = parseInt(wpmTag.innerText, 10);
  const previousScore = localStorage.getItem('typingGameScore') || 0;

  // Store the current score in local storage
  if(currentScore > previousScore){
    localStorage.setItem('typingGameScore', currentScore);
  }
  // Use Bootstrap's modal functions to show the modal
  const myModal = new bootstrap.Modal(document.getElementById('exampleModal'));
  const modalBody = document.querySelector('.modal-body');

  // Display a message based on the comparison with the previous score
  if (currentScore > previousScore) {
    modalBody.innerHTML = `
    <div class="gif-center">
            <img class="img-fluid" src="images/victory.gif" alt="gif">
          </div>
      <p class="scores">Congratulations! Your new score is ${currentScore}. You're improving!</p>
      <p>Previous best score was ${previousScore}.</p>
    `;
  } else {
    modalBody.innerHTML = `
    <div class="gif-center">
            <img class="img-fluid" src="images/lost.gif" alt="gif">
          </div>
      <p class="scores">You need to improve. Your score is ${currentScore}.</p>
      <p>Your previous best score was ${previousScore}.</p>
    `;
  }

  myModal.show();
}
function initTimer() {
  if (timeLeft > 0) {
    timeLeft--;
    timeTag.innerText = timeLeft;
    let wpm = Math.round(
      ((charIndex - mistakes) / 5 / (maxTime - timeLeft)) * 60
    );
    wpmTag.innerText = wpm;
  } else {
    clearInterval(timer);
  }
}

function resetGame() {
  loadParagraph();
  clearInterval(timer);
  timeLeft = maxTime;
  charIndex = mistakes = isTyping = 0;
  inpField.value = "";
  timeTag.innerText = timeLeft;
  wpmTag.innerText = 0;
  mistakeTag.innerText = 0;
  cpmTag.innerText = 0;
}

loadParagraph();
inpField.addEventListener("input", initTyping);
tryAgainBtn.addEventListener("click", resetGame);
