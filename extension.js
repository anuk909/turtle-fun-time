// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

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

    // Turtle Progress Tracker
    let dailyProgress = 0;
    const progressGoal = 10;
    const progressDisposable = vscode.workspace.onDidSaveTextDocument(() => {
        dailyProgress++;
        turtleStatusBarItem.text = `🐢 Progress: ${dailyProgress}/${progressGoal}`;
        if (dailyProgress >= progressGoal) {
            vscode.window.showInformationMessage('🎉 Congratulations! You\'ve reached your daily coding goal! 🐢', 'Claim Reward')
                .then(selection => {
                    if (selection === 'Claim Reward') {
                        showTurtleAnimation();
                    }
                });
            dailyProgress = 0;
        } else {
            setTimeout(() => {
                turtleStatusBarItem.text = "🐢";
            }, 3000);
        }
    });

    context.subscriptions.push(progressDisposable);

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
        vscode.window.showInformationMessage(`🐢 A new file has been opened!`);
    });

    context.subscriptions.push(turtleStatusBarItem);

    // Turtle Trivia Game
    const triviaDisposable = vscode.commands.registerCommand('turtle-fun-time.turtleTrivia', async function () {
        const triviaQuestions = [
            {
                question: "What is the largest species of turtle?",
                options: ["Green Sea Turtle", "Leatherback Sea Turtle", "Loggerhead Sea Turtle", "Hawksbill Sea Turtle"],
                answer: 1
            },
            {
                question: "How long can sea turtles hold their breath underwater?",
                options: ["5 minutes", "30 minutes", "2 hours", "5 hours"],
                answer: 2
            },
            {
                question: "Which of these is not a type of sea turtle?",
                options: ["Kemp's Ridley", "Flatback", "Snapping", "Olive Ridley"],
                answer: 2
            }
        ];

        let score = 0;
        for (let question of triviaQuestions) {
            const answer = await vscode.window.showQuickPick(question.options, {
                placeHolder: question.question
            });

            if (answer === question.options[question.answer]) {
                score++;
                vscode.window.showInformationMessage('Correct! 🐢');
            } else {
                vscode.window.showInformationMessage(`Sorry, the correct answer was: ${question.options[question.answer]} 🐢`);
            }
        }

        vscode.window.showInformationMessage(`You scored ${score} out of ${triviaQuestions.length}! 🐢`);
    });

    context.subscriptions.push(triviaDisposable);

    function showTurtleAnimation() {
        // This is a placeholder for the turtle animation
        // In a real implementation, this would show a more complex animation or graphic
        const panels = ['🐢', '🐢💨', '🐢💨💨', '🐢💨💨💨', '🏁🐢'];
        let i = 0;
        const interval = setInterval(() => {
            if (i < panels.length) {
                vscode.window.showInformationMessage(panels[i]);
                i++;
            } else {
                clearInterval(interval);
                vscode.window.showInformationMessage('🎉 You\'ve earned a turtle speed boost! 🐢💨');
            }
        }, 1000);
    }
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
}
