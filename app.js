let commandsConfig;
let currentVoice;
let johnMode;

let audioPlaying = false;
let audioPathQueue = [];

let inDevelopment = true;


/*
    VARIABLE DEFINITIONS:

    commandsConfig: A JSON file containing all commands, organized by category

    commandCategory: Groups of similar types of commands
    
    command: An individual command within a larger commandCategory

*/

window.onload = function () {

    // Load the JSON before building the page
    fetch("./commandsConfig.json")
        .then(response => response.json())
        .then(json => commandsConfig = json)
        .then(() => {
            init();
        });

};

function init() {

    renderCommands();

    let voicePickerContainer = renderVoicePicker();

    loadVoices(voicePickerContainer);

}


function loadVoices(voicePickerContainer) {

    // If speechSynthesis is not supported don't try to
    // add voice options
    if (!window.speechSynthesis) {

        document.body.appendChild(voicePickerContainer);


        return;

    }


    // list of languages is probably not loaded, wait for it
    if (window.speechSynthesis.getVoices().length == 0) {

        window.speechSynthesis.addEventListener('voiceschanged', () => {

            renderVoiceOptions(voicePickerContainer);

        });

    }
    else {

        // languages list available, no need to wait
        renderVoiceOptions(voicePickerContainer);

    }

}


function renderVoicePicker() {

    let voicePickerContainer = buildSectionContainer('voice-picker', 'Voice Selection');

    let johnModeSwitch = buildJohnModeSwitch();

    voicePickerContainer.appendChild(johnModeSwitch);


    return voicePickerContainer;

}



function renderVoiceOptions(voicePickerContainer) {

    // remove voices changed listener
    window.speechSynthesis.removeEventListener('voiceschanged', renderVoiceOptions);

    // get all voices that browser offers
    let available_voices = window.speechSynthesis.getVoices();

    // set default voice to first available
    currentVoice = available_voices[0];

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

    document.body.appendChild(voicePickerContainer);

}




function buildJohnModeSwitch() {
    let johnModeSwitchContainer = buildSectionContainer('john-mode', 'John Mode');

    let johnModeSwitch = document.createElement('input');
    johnModeSwitch.type = 'checkbox';
    johnModeSwitch.onchange = (e) => {
        johnMode = e.target.checked;

        log(johnMode);
    }

    johnModeSwitchContainer.appendChild(johnModeSwitch);

    return johnModeSwitchContainer;
}


function buildSectionContainer(id, headingText) {

    let container = document.createElement('div');
    container.Id = id + '-container';
    container.classList.add('section-container');

    let heading = document.createElement('h2');
    heading.innerText = headingText;
    heading.classList.add('section-heading');

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

    let commandCategoryContainer = buildSectionContainer(commandCategory, commandCategory);

    commands.forEach(command => {

        let commandButton = createCommandButton(command);

        commandCategoryContainer.appendChild(commandButton);

    }); // end forEach


    return commandCategoryContainer;

}


function createCommandButton(command) {

    let commandName = command.name;
    let commandAudioPath = command.path;

    // Create div container for the command
    let commandButtonContainer = document.createElement('div');
    commandButtonContainer.setAttribute('id', commandName);
    commandButtonContainer.classList.add('command-button-container');


    // Create button to trigger command
    let commandButton = document.createElement('button');
    commandButton.setAttribute('value', commandName);
    commandButton.setAttribute('data-path', commandAudioPath);
    commandButton.classList.add('command-button');


    commandButton.onclick = (e) => {

        let commandName = e.target.value;
        let path = e.target.dataset.path;
        speak(commandName, path);

    };

    commandButton.innerText = commandName;

    commandButtonContainer.appendChild(commandButton);


    return commandButtonContainer;

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

    if (audioPlaying) {

        audioPathQueue.push(path);

    } else {

        // Play the audio
        let commandAudio = new Audio(path);
        audioPlaying = true;
        commandAudio.play();

        // After the audio finishes, recursively call playAudio if
        // there are other clips to be played
        commandAudio.onended = () => {

            audioPlaying = false;

            if (audioPathQueue.length > 0) {

                let nextPath = audioPathQueue.shift();
                playAudio(nextPath);

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



// Console.log shortcut
window.log = function (message) {

    console.log(message);

}