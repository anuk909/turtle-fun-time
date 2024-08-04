// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// Array of turtle facts
const turtleFacts = [
    "Turtles have been around for about 220 million years!",
    "Some turtles can breathe through their butts!",
    "The largest turtle is the leatherback sea turtle, which can weigh over 2,000 pounds!",
    "Turtles can't leave their shells because they're connected to their spine.",
    "Some turtles can live for more than 100 years!",
    "There are over 350 species of turtles in the world.",
    "Sea turtles can migrate thousands of miles across oceans.",
    "Turtles don't have teeth, but they have sharp beaks.",
    "The gender of some turtle species is determined by the temperature during incubation.",
    "Turtles can't swim backwards."
];

// Function to format code with turtle-themed comments
function formatCodeWithTurtleTheme(document) {
    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(document.getText().length)
    );

    const formattedText = document.getText().replace(/class\s+(\w+)/g, (match, className) => {
        return `
/****************************
 *      🐢 ${className} 🐢      *
 ****************************/
${match}`;
    }).replace(/function\s+(\w+)/g, (match, funcName) => {
        return `
/*-----------------------*
 |  🐢 ${funcName} 🐢  |
 *-----------------------*/
${match}`;
    });

    const randomFact = turtleFacts[Math.floor(Math.random() * turtleFacts.length)];
    const turtleFactComment = `// 🐢 Turtle Fact: ${randomFact}\n\n`;

    edit.replace(document.uri, fullRange, turtleFactComment + formattedText);
    return vscode.workspace.applyEdit(edit);
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "turtle-fun-time" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable = vscode.commands.registerCommand('turtle-fun-time.helloWorld', function () {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from Turtle Fun Time!');
    });

    context.subscriptions.push(disposable);

    // Create a status bar item for the Turtle Coding Companion
    const turtleStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    turtleStatusBarItem.text = "🐢";
    turtleStatusBarItem.tooltip = "Turtle Coding Companion";
    turtleStatusBarItem.show();

    // Event listener for when a file is saved
    vscode.workspace.onDidSaveTextDocument((document) => {
        turtleStatusBarItem.text = "🐢 Good job!";
        setTimeout(() => {
            turtleStatusBarItem.text = "🐢";
        }, 3000);

        // Apply turtle-themed formatting
        formatCodeWithTurtleTheme(document);
    });

    // Event listener for when a build task is started
    vscode.tasks.onDidStartTask(() => {
        turtleStatusBarItem.text = "🐢 Building...";
    });

    // Event listener for when a build task ends
    vscode.tasks.onDidEndTask(() => {
        turtleStatusBarItem.text = "🐢 Build complete!";
        setTimeout(() => {
            turtleStatusBarItem.text = "🐢";
        }, 3000);
    });

    // Event listener for when a new file is opened
    vscode.workspace.onDidOpenTextDocument(() => {
        const randomFact = turtleFacts[Math.floor(Math.random() * turtleFacts.length)];
        vscode.window.showInformationMessage(`🐢 Turtle Fact: ${randomFact}`);
    });

    context.subscriptions.push(turtleStatusBarItem);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
}
