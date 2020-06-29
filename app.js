let commands;

window.onload = function() {

    fetch("./commands.json")
    .then(response => response.json())
    .then(json => commands = json)
    .then(() => {
        init();
    });

};

function init() {

    for(let commandType in commands) {

        let commandArray = commands[commandType];

        let commandTypeContainer = document.createElement('div', { id: commandType + '-container' });

        commandTypeContainer = createCommands(commandArray, commandTypeContainer);
    
    }

}


function createCommands(commandArray, commandTypeContainer) {

    commandArray.forEach( command => {

        let commandName = command.name;
        let commandAudioPath = command.path;

        let commandContainer = document.createElement('div');
        commandContainer.setAttribute('id', commandName);

        // let commandButton = document.createElement('button', {  })

        console.log(commandName);
        console.log(commandAudioPath);
        console.log(commandContainer);

    });

}


function playAudio(command) {
    console.log(command);
}