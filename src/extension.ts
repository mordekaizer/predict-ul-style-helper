import * as vscode from 'vscode';
import fs from 'fs';
import path from 'path';

export async function activate(context: vscode.ExtensionContext) {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (workspaceFolders && workspaceFolders[0]) {
		const workspacePath = workspaceFolders[0].uri.fsPath;
		const nodeModulesPath = path.join(workspacePath, 'node_modules', '/@predict-ui/global-styles/dist/style.css');
	
		const showValueOnHover = (texts: { label: string, insertText: string, variable: string }[]) => {
			const hoverProvider = vscode.languages.registerHoverProvider('scss', {
					provideHover(document, position, token) {
							const line = document.lineAt(position).text;
							const hoveredVariables = line.match(/var\(([^)]+)\)/g);
	
							if (hoveredVariables) {
									let hoveredVariable = null;
	
									let currentVariable = null;
									let currentPosition = 0;
	
									hoveredVariables.forEach(variable => {
											const variablePosition = line.indexOf(variable, currentPosition);
											const variableEndPosition = variablePosition + variable.length;
	
											if (position.character >= variablePosition && position.character <= variableEndPosition) {
													hoveredVariable = variable;
											}
	
											currentPosition = variablePosition + 1;
									});
	
									if (hoveredVariable) {
											const variableName = hoveredVariable.match(/var\(([^)]+)\)/)[1].trim();
											const currentVar = texts.find(({ variable }) => variable === variableName);
	
											if (currentVar) {
													const hoverText = new vscode.MarkdownString();
													hoverText.appendMarkdown(`🔷 ${currentVar.label} 🔷`);
	
													return new vscode.Hover(hoverText);
											}
									}
							}
							return undefined;
					}
			});
	
			context.subscriptions.push(hoverProvider);
	};

		const setAutocomplite = (texts: { label: string, insertText: string, variable: string  }[]) => {
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

			return cssVariablesArray;
			
			
		};

		const extractCssVariables = () => {
			try {
					const variables = parseCSSVariables(nodeModulesPath);

					const autocompliteTexts = variables.map(({variable, value}) => {
						return {
							label: `var(${variable}) [${value}]`,
							insertText: `var(${variable})`,
							variable,
						};
					});


					setAutocomplite(autocompliteTexts);
					showValueOnHover(autocompliteTexts);

			} catch (error) {
				vscode.window.showInformationMessage('Ошибка чтения стилей из @predict-ui/ui-kit');
			}
		};

		extractCssVariables();
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}


