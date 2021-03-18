import * as vscode from "vscode";
import { QRPanel } from "./qr-panel";
import { getCorrectWorkspace, getRelativePath } from './WorkspaceHelper';
export function activate(context: vscode.ExtensionContext) {

    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );

    statusBarItem.text = "$(link) Mobile Share";
    statusBarItem.tooltip = "Click to generate a qr code";
    statusBarItem.command = "live-server-qr.generateQR";
    statusBarItem.show();

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "live-server-qr.generateQR",
            async (fileUri) => {
              
                try {
                    await vscode.workspace.saveAll();
                    let uri = fileUri ? fileUri.fsPath : null;
                    const workspacePath = await getCorrectWorkspace(uri);

                    // Get the current opened documents uri
                    const openedDocUri = uri || (vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.fileName : '');
                    QRPanel.createOrShow(context.extensionUri, getRelativePath(workspacePath, openedDocUri) || '');
                } catch (error) {
                    console.log(error);
                }
            }
        )
    );



}

