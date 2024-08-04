// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Congratulations, your extension "turtle-fun-time" is now active!');

    // Get configuration
    const config = vscode.workspace.getConfiguration('turtleFunTime');
    let dailyGoal = config.get('dailyGoal', 10);
    let showTriviaReminders = config.get('showTriviaReminders', true);

    // Create a status bar item for the Turtle Coding Companion
    const turtleStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    turtleStatusBarItem.text = "🐢";
    turtleStatusBarItem.tooltip = "Turtle Coding Companion";
    turtleStatusBarItem.show();

    // Turtle Progress Tracker
    let dailyProgress = 0;
    const progressDisposable = vscode.workspace.onDidSaveTextDocument(() => {
        dailyProgress++;
        turtleStatusBarItem.text = `🐢 Progress: ${dailyProgress}/${dailyGoal}`;
        if (dailyProgress >= dailyGoal) {
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
        console.log('Turtle Trivia command triggered');
        try {
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

            console.log('Trivia questions loaded successfully');

            let score = 0;
            for (let i = 0; i < triviaQuestions.length; i++) {
                const question = triviaQuestions[i];
                console.log(`Displaying question ${i + 1}: ${question.question}`);
                const answer = await vscode.window.showQuickPick(question.options, {
                    placeHolder: question.question
                });
                console.log(`User selected answer for question ${i + 1}: ${answer}`);

                if (answer === undefined) {
                    console.log('User cancelled the question');
                    vscode.window.showInformationMessage('Trivia game cancelled');
                    return;
                }

                if (answer === question.options[question.answer]) {
                    score++;
                    console.log(`Correct answer for question ${i + 1}`);
                    vscode.window.showInformationMessage('Correct! 🐢');
                } else {
                    console.log(`Incorrect answer for question ${i + 1}`);
                    vscode.window.showInformationMessage(`Sorry, the correct answer was: ${question.options[question.answer]} 🐢`);
                }
            }

            console.log(`Trivia game completed. Score: ${score}/${triviaQuestions.length}`);
            vscode.window.showInformationMessage(`You scored ${score} out of ${triviaQuestions.length}! 🐢`);
        } catch (error) {
            console.error('Error in Turtle Trivia command:', error);
            vscode.window.showErrorMessage('An error occurred while running Turtle Trivia. Please check the console for details.');
        }
    });

    context.subscriptions.push(triviaDisposable);

    // Trivia reminder
    if (showTriviaReminders) {
        setInterval(() => {
            vscode.window.showInformationMessage("Time for a turtle trivia break! 🐢", "Start Trivia")
                .then(selection => {
                    if (selection === "Start Trivia") {
                        vscode.commands.executeCommand('turtle-fun-time.turtleTrivia');
                    }
                });
        }, 3600000); // Show reminder every hour
    }

    function showTurtleAnimation() {
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

    // Listen for configuration changes
    vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('turtleFunTime.dailyGoal')) {
            dailyGoal = config.get('dailyGoal', 10);
        }
        if (event.affectsConfiguration('turtleFunTime.showTriviaReminders')) {
            showTriviaReminders = config.get('showTriviaReminders', true);
        }
    });
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
}
