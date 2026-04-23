import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext): void {
  const provider = new HandbookViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('cursorHandbook.panel', provider)
  );
}

export function deactivate(): void {}

class HandbookViewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.extensionUri, 'media')
      ]
    };
    webviewView.webview.html = this.getHtml();
  }

  private getHtml(): string {
    const htmlPath = path.join(this.extensionUri.fsPath, 'media', 'handbook.html');
    return fs.readFileSync(htmlPath, 'utf8');
  }
}
