// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import Api from './api';
import MainWebview from './views/MainWebview';
import SidebarWebview from './views/SidebarWebview';
import InitialAppdata from './utils/InitAppdata';

const EventBus = new Api();
const userConfig = vscode.workspace.getConfiguration('home');
const openPanels = new Map<string, vscode.WebviewPanel | undefined>();

const DEFAULT_META = { name: 'default', title: 'Home' };

const EmitViewChange = (active: boolean) => {
	EventBus.emitAll({ payload: { action: 'ui.isActive', active } });
};

const openMainView = (context: vscode.ExtensionContext, meta?: any) => {
	const columnToShowIn = vscode.window.activeTextEditor
		? vscode.window.activeTextEditor.viewColumn
		: undefined;
	if (openPanels.has(meta.name)) {
		const panel = openPanels.get(meta.name);
		if (panel) { panel.reveal(columnToShowIn); }
	} else {
		const assets = (file: string) => import(`@vsch/ui/dist/${file}`);
		const view = new MainWebview(context, assets, meta?.name, meta?.title);
		view.onReady(webview => {
			openPanels.set(meta.name, view.panel);
			EmitViewChange(true);
			EventBus.register(webview);
		});
		view.panel?.onDidChangeViewState(({ webviewPanel: { active } }) => EmitViewChange(active));
		view.onDestroy((webview) => {
			openPanels.delete(meta.name);
			EventBus.unregister(webview);
			EmitViewChange(false);
		});

		view.getWebviewContent();
	}
};

const openSidebarView = (context: vscode.ExtensionContext) => {
	const assets = (file: string) => import(`@vsch/sidebar/dist/${file}`);
	const view = new SidebarWebview(context, assets, 'sidebar');
	view.onReady(webview => EventBus.register(webview));

	return view;
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	InitialAppdata();

	const mainViewCommand = vscode.commands.registerCommand('vsch.openMainView', async (meta = DEFAULT_META) => {
		// The code you place here will be executed every time your command is executed
		openMainView(context, meta);
	});

	const openOnStartup = userConfig.get('openOnStartup');
	if (openOnStartup === "always") {
		openMainView(context, DEFAULT_META);
	} else if (openOnStartup === "whenBlank") {
		if (!vscode.workspace.workspaceFolders?.length) {
			openMainView(context, DEFAULT_META);
		}
	}

	context.subscriptions.push(mainViewCommand);

	const sidebarView = vscode.window.registerWebviewViewProvider("vsch.openSidebarView", openSidebarView(context));
	context.subscriptions.push(sidebarView);
}

// this method is called when your extension is deactivated
export function deactivate() { }
