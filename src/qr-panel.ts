import * as vscode from "vscode";
import { getNonce } from "./getNonce";
import QRCode from 'qrcode';
import { createLanAdress } from "./LiveServerHelper";

export class QRPanel {
    /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */
    public static currentPanel: QRPanel | undefined;

    public static readonly viewType = "qr-panel";

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    private readonly _path: string | undefined;

    public static createOrShow(extensionUri: vscode.Uri, path: string) {
        const column = vscode.ViewColumn.Beside;

        // If we already have a panel, show it.
        if (QRPanel.currentPanel) {
            QRPanel.currentPanel._panel.reveal(column);
            QRPanel.currentPanel._update();
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            QRPanel.viewType,
            "Mobile Share",
            column,
            {
                // Enable javascript in the webview
                enableScripts: true,

                // And restrict the webview to only loading content from our extension's `media` directory.
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, "media"),
                    vscode.Uri.joinPath(extensionUri, "out/compiled"),
                ],
            }
        );

        QRPanel.currentPanel = new QRPanel(panel, extensionUri, path);
    }

    public static kill() {
        QRPanel.currentPanel?.dispose();
        QRPanel.currentPanel = undefined;
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        QRPanel.currentPanel = new QRPanel(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, path?: string) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._path = path;
        this._update();
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    public dispose() {
        QRPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private async _update() {
        const webview = this._panel.webview;

        this._panel.webview.html = this._getHtmlForWebview(webview);
        webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case "qr-view-init": {
                    try {
                        const dataUrl = await QRCode.toDataURL(createLanAdress(this._path), {
                            scale: 8
                        });
                        webview.postMessage({
                            type: "QrURL",
                            message: dataUrl
                        });
                    } catch (exception) {
                        webview.postMessage({
                            type: "QrURL",
                            message: exception.message
                        });
                    }
                    break;
                }
            
            }
        });
    }



    private _getHtmlForWebview(webview: vscode.Webview) {
        // // And the uri we use to load this script in the webview
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "out/compiled", "Qr.js")
          );
          const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "out/compiled", "bundle.css")
          );

        // Uri to load styles into webview
        const stylesResetUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
        );
        const stylesVsCodeUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
        );

        // // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();
     
        return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="img-src 'self' data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${stylesResetUri}" rel="stylesheet">
                <link href="${stylesVsCodeUri}" rel="stylesheet">
                <link href="${styleUri}" rel="stylesheet">
            </head>
            <body>
                <script nonce="${nonce}">
                    const vscode = acquireVsCodeApi();
                </script>
                <script src="${scriptUri}" nonce="${nonce}">    
            </body>
        </html>`;
    }
}
