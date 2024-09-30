const timer = ms => new Promise(res => setTimeout(res, ms))

function getRandomInt(max) { return Math.floor(Math.random() * max); }

async function typewriterAffect(text, LuckyNumber) {
    var div = document.getElementById('content')
    var newElement = document.createElement('div')
    newElement.classList.add("maintext")
        //newElement.classList.add("handjet")
    div.appendChild(newElement);
    if (LuckyNumber == 14) {
        newElement.style.color = "#FF0000"
    } else if (LuckyNumber == 15) {
        newElement.style.color = "#00FF00"
    }

    if (LuckyNumber == 1 || LuckyNumber == 5 || LuckyNumber == 10) {
        newElement.classList.add("mainfontmodified")
    } else if (LuckyNumber == 2 || LuckyNumber == 6 || LuckyNumber == 9) {
        newElement.classList.add("pixelfont")
    } else if (LuckyNumber == 0 || LuckyNumber == 7 || LuckyNumber == 11) {
        newElement.classList.add("jacquarda")
    } else if (LuckyNumber == 3 || LuckyNumber == 8 || LuckyNumber == 12) {
        newElement.classList.add("mainfont")
    } else {
        newElement.classList.add("handjet")
    }

    //var nameElement = document.getElementById("name");

    //newElement.innerHTML = ""

    for (let i = 0; i < text.length;) {
        newElement.innerHTML += text.charAt(i);
        i++
        await timer(50)
    }
}

var messages = [
    "> thinking about stuff",
    "> how are you",
    "> im good",
    "> almost like a message board",
    "> this probably wont make sense at all.",
    "> ...cause its scrambled.",
    "> hey.",
    "> okay enough yapping",
    "...",
    "......?",
    ".........",
    "> silenceness is somewhat calming.",
    "> thanks...",
    "> randomness is crazy.",
    "> some messages.. red.",
    "> some messages.. green.",
    "> i like working on stuff like this",
    "> its sort of... fun.",
    "> thank you...",
    "> er.. are you still here?"
]

var LuckyNumber; // Current number to reference. 
var PastNumber; // Last number to make sure the number doesn't match the new one.
var ConstantLoop = false
async function constantRewrite() {
    while (ConstantLoop == false) {
        PastNumber = LuckyNumber

        LuckyNumber = getRandomInt(20)

        while (LuckyNumber == PastNumber) {
            LuckyNumber = getRandomInt(20) // Repeat this to get a different number from the past one.
        }

        console.log("Lucky number is: ", LuckyNumber)
        await typewriterAffect(messages[LuckyNumber], LuckyNumber)

        await timer(2000)
    }
}


window.onload = (event) => {
    constantRewrite()
};