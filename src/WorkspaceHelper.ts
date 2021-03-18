import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

export function getRelativePath(workspacePath: string, docUri: string) {

    workspacePath = beautifyPath(workspacePath);

    if (!docUri.startsWith(workspacePath)) {
        return null;
    }
    return docUri.substring(workspacePath.length, docUri.length);
}


export function beautifyPath(rootPath: string) {
    if (!rootPath.endsWith(path.sep)) {
        rootPath = rootPath + path.sep;
    }

    return rootPath;
}

export function getCorrectWorkspace(uri?: string) {
    return new Promise<string>((resolve) => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const workspaceNames = workspaceFolders?.map(
            (folder: vscode.WorkspaceFolder) => folder.name
        );

        console.log(workspaceNames!.length);
        if (workspaceNames!.length === 1) {
            console.log(workspaceFolders![0].uri.fsPath);
            resolve(workspaceFolders![0].uri.fsPath);
        }

        if (uri) {
            resolve(workspaceFolders![0].uri.fsPath);
            // resolve(workspaceFolders?.find((ws) =>
            //     uri.startsWith(ws.uri.fsPath)
            // ));
        }
    });
}
