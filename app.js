let commandsConfig;
let currentVoice;
let johnMode;

let audioPlaying = false;
let audioStack = [];

let inDevelopment = true;


/*
    VARIABLE DEFINITIONS:

    commandsConfig: A JSON file containing all commands, organized by category

    commandCategory: Groups of similar types of commands
    
    command: An individual command within a larger commandCategory

*/

window.onload = function () {

    // Load the JSON before building the page
    fetch("./commands.json")
        .then(response => response.json())
        .then(json => commandsConfig = json)
        .then(() => {
            init();
        });

};

function init() {

    loadVoices();

    renderCommands();

}


function loadVoices() {
    // list of languages is probably not loaded, wait for it
    if (window.speechSynthesis.getVoices().length == 0) {
        window.speechSynthesis.addEventListener('voiceschanged', renderVoicePicker);
    }
    else {
        // languages list available, no need to wait
        renderVoicePicker()
    }
}


function renderVoicePicker() {

    // remove voices changed listener
    window.speechSynthesis.removeEventListener('voiceschanged', renderVoicePicker);

    // get all voices that browser offers
    let available_voices = window.speechSynthesis.getVoices();

    // set default voice to first available
    currentVoice = available_voices[0];


    let voicePickerContainer = buildContainer('voice-picker', 'Voice Selection');

    let voicePicker = document.createElement('select');

    voicePicker.onchange = (e) => {
        let value = e.target.value;

        currentVoice = window.speechSynthesis.getVoices().filter(voice => voice.name === value)[0];

    };

    available_voices.forEach(voice => {

        let voiceOption = document.createElement('option');
        voiceOption.value = voice.name;
        voiceOption.text = voice.name;

        voicePicker.appendChild(voiceOption);

    });

    voicePickerContainer.appendChild(voicePicker);



    let johnModeSwitch = buildJohnModeSwitch();

    voicePickerContainer.appendChild(johnModeSwitch);

    document.body.appendChild(voicePickerContainer);

}

function buildJohnModeSwitch() {
    let johnModeSwitchContainer = buildContainer('john-mode', 'John Mode');

    let johnModeSwitch = document.createElement('input');
    johnModeSwitch.type = 'checkbox';
    johnModeSwitch.onchange = (e) => {
        johnMode = e.target.checked;

        log(johnMode);
    }

    johnModeSwitchContainer.appendChild(johnModeSwitch);

    return johnModeSwitchContainer;
}

function buildContainer(id, headingText) {

    let container = document.createElement('div');
    container.Id = id + '-container';

    let heading = document.createElement('h2');
    heading.innerText = headingText;

    container.appendChild(heading);

    return container;
}




function renderCommands() {

    for (let commandCategory in commandsConfig) {

        let commands = commandsConfig[commandCategory];

        let commandCategoryContainer = buildCommandCategoryContainer(commands, commandCategory);

        document.body.appendChild(commandCategoryContainer);

    }

}


function buildCommandCategoryContainer(commands, commandCategory) {

    let commandCategoryContainer = document.createElement('div');
    commandCategoryContainer.id = commandCategory + '-container';

    let commandCategoryHeading = document.createElement('h2');
    commandCategoryHeading.innerText = commandCategory;

    commandCategoryContainer.appendChild(commandCategoryHeading);

    commands.forEach(command => {

        let commandName = command.name;
        let commandAudioPath = command.path;

        // Create div container for the command
        let commandContainer = document.createElement('div');
        commandContainer.setAttribute('id', commandName);


        // Create button to trigger command
        let commandButton = document.createElement('button');
        commandButton.setAttribute('value', commandName);
        commandButton.setAttribute('data-path', commandAudioPath);
        commandButton.onclick = (e) => {
            let commandName = e.target.value;
            let path = e.target.dataset.path;
            speak(commandName, path);
        };
        commandButton.innerText = commandName;

        commandCategoryContainer.appendChild(commandButton);

    });

    return commandCategoryContainer;

}

function speak(commandName, path) {
    log(commandName);
    log(path);

    if (johnMode) {
        playAudio(path);
    } else {
        synthesizeAudio(commandName);
    }
}


function playAudio(path) {

    // If audio is currently playing, put the new path into a que
    if (audioPlaying) {

        audioStack.push(path);

    } else {

        // Play the audio
        let commandAudio = new Audio(path);
        audioPlaying = true;
        commandAudio.play();

        // After the audio finishes, recursively call playAudio if
        // there are other clips to be played
        commandAudio.onended = () => {
            audioPlaying = false;

            if (audioStack.length > 0) {
                playAudio(audioStack.shift());
            }
        };
    }
}


function synthesizeAudio(commandName) {

    // new SpeechSynthesisUtterance object
    let utter = new SpeechSynthesisUtterance();
    utter.rate = 1;
    utter.pitch = 1;
    utter.text = commandName;
    utter.voice = currentVoice;

    // speak
    window.speechSynthesis.speak(utter);

}


window.log = function (message) {
    console.log(message);
}