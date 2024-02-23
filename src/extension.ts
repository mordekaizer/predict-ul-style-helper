import * as vscode from 'vscode';
import fs from 'fs';
import path from 'path';

export async function activate(context: vscode.ExtensionContext) {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (workspaceFolders && workspaceFolders[0]) {


		const workspacePath = workspaceFolders[0].uri.fsPath;
		const nodeModulesPath = path.join(workspacePath, 'node_modules', '/@predict-ui/global-styles/dist/style.css');

		const setAutocomplite = (texts: { label: string, insertText: string }[]) => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
					return;
			}

			let supportedLanguages = ['javascript', 'javascriptreact', 'typescript', 'typescriptreact', 'scss', 'css', 'sass'];

			let disposable = vscode.languages.registerCompletionItemProvider(supportedLanguages, {
				provideCompletionItems(document, position) {

					const preparedCompletions =  texts.map(({ insertText, label }) => {
						const completionItem = new vscode.CompletionItem(label);
						completionItem.label = label;
						completionItem.insertText = insertText;
						completionItem.preselect = true;
						completionItem.kind = 20;
						return completionItem;
				
					});
					
					return preparedCompletions;
				}
			});

			context.subscriptions.push(disposable);

			vscode.window.showInformationMessage('Переменные из @predict-ui/ui-kit успешно инициализированны');
		};

		const parseCSSVariables = (filename: string) => {
			
			const fileContent = fs.readFileSync(filename, 'utf8');

			const rootRegex = /:root\s*{([^}]+)}/g;
			const variableRegex = /(--[\w-]+)\s*:\s*([^;]+)/g;
			
			let cssVariablesArray = [];
			
			let rootMatch;

			while ((rootMatch = rootRegex.exec(fileContent)) !== null) {
					const rootContent = rootMatch[1];
					let matches;
					
					while ((matches = variableRegex.exec(rootContent)) !== null) {
							const variable = matches[1];
							const value = matches[2].trim();
							cssVariablesArray.push({ variable, value });
					}
			}
			
			console.log(cssVariablesArray);

			return cssVariablesArray;
			
			
		};

		const extractCssVariables = () => {
			try {
					const variables = parseCSSVariables(nodeModulesPath);

					const autocompliteTexts = variables.map(({variable, value}) => {
						console.log(`${variable} ${value}`);
						return {
							label: `var(${variable}) [${value}]`,
							insertText: `var(${variable})`,
						};
					});


					setAutocomplite(autocompliteTexts);

			} catch (error) {
				vscode.window.showInformationMessage('Ошибка чтения стилей из @predict-ui/ui-kit');
			}
		};

		extractCssVariables();

		console.log('Predict-ui style helper is active');
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}


