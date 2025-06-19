import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    vscode.window.showWarningMessage('🔥 Extension is ACTIVATING - Check Activity Bar for star icon!');
    
    const testCommand = vscode.commands.registerCommand('myExtension.test', () => {
        vscode.window.showInformationMessage('✅ Extension is working!');
    });
    context.subscriptions.push(testCommand);
    
    vscode.commands.executeCommand('setContext', 'myCustomView:enabled', true);
    vscode.commands.executeCommand('setContext', 'myPanelContainer:enabled', true);
    
    // Original provider and tree view
    const provider = new SimpleTreeProvider();
    const treeView = vscode.window.createTreeView('myCustomPanel', {
        treeDataProvider: provider,
        showCollapseAll: true
    });
    context.subscriptions.push(treeView);
    
    // NEW ACCORDION: Create second tree view provider
    const newAccordionProvider = new NewAccordionProvider();
    const newAccordionTreeView = vscode.window.createTreeView('myNewAccordion', {
        treeDataProvider: newAccordionProvider,
        showCollapseAll: true
    });
    context.subscriptions.push(newAccordionTreeView);
    
    // Add refresh command for the new accordion
    const refreshCommand = vscode.commands.registerCommand('myNewAccordion.refresh', () => {
        newAccordionProvider.refresh();
        vscode.window.showInformationMessage('🔄 New accordion refreshed!');
    });
    context.subscriptions.push(refreshCommand);
    
    // Add item click command for the new accordion
    const itemClickCommand = vscode.commands.registerCommand('myNewAccordion.itemClick', (item: AccordionItem) => {
        vscode.window.showInformationMessage(`📋 Clicked: ${item.label}`);
    });
    context.subscriptions.push(itemClickCommand);
    
    // THIRD PANEL: Create another panel with different functionality
    const thirdPanelProvider = new ThirdPanelProvider();
    const thirdPanelTreeView = vscode.window.createTreeView('myThirdPanel', {
        treeDataProvider: thirdPanelProvider,
        showCollapseAll: true
    });
    context.subscriptions.push(thirdPanelTreeView);
    
    // Add commands for the third panel
    const addItemCommand = vscode.commands.registerCommand('myThirdPanel.addItem', async () => {
        const input = await vscode.window.showInputBox({
            prompt: 'Enter item name',
        });
        if (input) {
            thirdPanelProvider.addItem(input);
            vscode.window.showInformationMessage(`✅ Added: ${input}`);
        }
    });
    context.subscriptions.push(addItemCommand);
    
    const removeItemCommand = vscode.commands.registerCommand('myThirdPanel.removeItem', (item: ThirdPanelItem) => {
        thirdPanelProvider.removeItem(item);
        vscode.window.showInformationMessage(`🗑️ Removed: ${item.label}`);
    });
    context.subscriptions.push(removeItemCommand);
    
    const editItemCommand = vscode.commands.registerCommand('myThirdPanel.editItem', async (item: ThirdPanelItem) => {
        const input = await vscode.window.showInputBox({
            prompt: 'Edit item name',
            value: item.label
        });
        if (input && input !== item.label) {
            thirdPanelProvider.editItem(item, input);
            vscode.window.showInformationMessage(`✏️ Edited: ${item.label} → ${input}`);
        }
    });
    context.subscriptions.push(editItemCommand);
    
    // EDITOR: Register custom editor provider
    const customEditorProvider = new CustomEditorProvider(context);
    context.subscriptions.push(
        vscode.window.registerCustomEditorProvider('myExtension.customEditor', customEditorProvider)
    );
    
    // EDITOR: Command to open custom editor
    const openCustomEditorCommand = vscode.commands.registerCommand('myExtension.openCustomEditor', async () => {
        const uri = vscode.Uri.parse('untitled:my-custom-editor.myext');
        await vscode.commands.executeCommand('vscode.openWith', uri, 'myExtension.customEditor');
    });
    context.subscriptions.push(openCustomEditorCommand);
    
    // EDITOR TOOLBAR: Command for editor toolbar button (original)
    const editorToolbarCommand = vscode.commands.registerCommand('myExtension.editorToolbarAction', () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            const fileName = activeEditor.document.fileName;
            const lineCount = activeEditor.document.lineCount;
            vscode.window.showInformationMessage(
                `🚀 Editor Action Triggered!\nFile: ${fileName}\nLines: ${lineCount}`,
                'Format Code', 'Insert Template', 'Show Stats'
            ).then(selection => {
                switch(selection) {
                    case 'Format Code':
                        vscode.commands.executeCommand('editor.action.formatDocument');
                        break;
                    case 'Insert Template':
                        activeEditor.edit(editBuilder => {
                            const position = activeEditor.selection.active;
                            editBuilder.insert(position, '\n// TODO: Add your code here\n');
                        });
                        break;
                    case 'Show Stats':
                        const text = activeEditor.document.getText();
                        const wordCount = text.split(/\s+/).length;
                        const charCount = text.length;
                        vscode.window.showInformationMessage(
                            `📊 File Stats:\nWords: ${wordCount}\nCharacters: ${charCount}\nLines: ${lineCount}`
                        );
                        break;
                }
            });
        } else {
            vscode.window.showWarningMessage('⚠️ No active editor found!');
        }
    });
    context.subscriptions.push(editorToolbarCommand);
    
    // EDITOR TOOLBAR: Simple editor action (new)
    const simpleEditorAction = vscode.commands.registerCommand('myExtension.simpleEditorAction', () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            const document = activeEditor.document;
            const selection = activeEditor.selection;
            const selectedText = document.getText(selection);
            
            if (selectedText) {
                vscode.window.showInformationMessage(`⚙️ Selected text: "${selectedText}"`);
            } else {
                vscode.window.showInformationMessage(`⚙️ Current file: ${document.fileName.split('/').pop()}`);
            }
        } else {
            vscode.window.showInformationMessage('⚙️ Simple Editor Action - No file open');
        }
    });
    context.subscriptions.push(simpleEditorAction);
    
    // STATUS BAR: Create status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = "$(star) My Extension Active";
    statusBarItem.tooltip = "Click to show extension info";
    statusBarItem.command = 'myExtension.statusBarClick';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    
    // STATUS BAR: Add command for status bar click
    const statusBarClickCommand = vscode.commands.registerCommand('myExtension.statusBarClick', () => {
        vscode.window.showInformationMessage('🌟 Extension Status: Active and Running!', 
            'View Panel', 'Refresh Data', 'Settings'
        ).then(selection => {
            switch(selection) {
                case 'View Panel':
                    vscode.commands.executeCommand('workbench.view.extension.myCustomView');
                    break;
                case 'Refresh Data':
                    newAccordionProvider.refresh();
                    vscode.window.showInformationMessage('✅ Data refreshed!');
                    break;
                case 'Settings':
                    vscode.window.showInformationMessage('⚙️ Opening extension settings...');
                    break;
            }
        });
    });
    context.subscriptions.push(statusBarClickCommand);
    
    // STATUS BAR: Update status bar with dynamic info
    const updateStatusBar = () => {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        statusBarItem.text = `$(star) Extension | ${timeString}`;
    };
    
    // Update status bar every 30 seconds
    const statusBarTimer = setInterval(updateStatusBar, 30000);
    context.subscriptions.push({
        dispose: () => clearInterval(statusBarTimer)
    });
    
    console.log('✅ Extension fully activated with editor toolbar buttons!');
}

export function deactivate() {
    console.log('Extension deactivated');
}

// Your original tree provider (unchanged)
class SimpleTreeProvider implements vscode.TreeDataProvider<string> {
    
    getTreeItem(element: string): vscode.TreeItem {
        const item = new vscode.TreeItem(element);
        item.iconPath = new vscode.ThemeIcon('file');
        return item;
    }
    
    getChildren(element?: string): string[] {
        if (!element) {
            return ['First task done', 'Adding icon in activity bar'];
        }
        return [];
    }
}

// CUSTOM EDITOR: Custom editor provider class
class CustomEditorProvider implements vscode.CustomTextEditorProvider {
    
    constructor(private readonly context: vscode.ExtensionContext) {}

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        
        webviewPanel.webview.options = {
            enableScripts: true,
        };

        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview, document);

        function updateWebview() {
            webviewPanel.webview.postMessage({
                type: 'update',
                text: document.getText(),
            });
        }

        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                updateWebview();
            }
        });

        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });

        webviewPanel.webview.onDidReceiveMessage(e => {
            switch (e.type) {
                case 'add':
                    this.addNewItem(document);
                    return;
                case 'delete':
                    this.deleteItem(document, e.id);
                    return;
            }
        });

        updateWebview();
    }

    private addNewItem(document: vscode.TextDocument) {
        const json = this.getDocumentAsJson(document);
        const timestamp = new Date().toISOString();
        json.items = json.items || [];
        json.items.push({
            id: Date.now().toString(),
            text: `New item ${json.items.length + 1}`,
            created: timestamp
        });

        return this.updateTextDocument(document, json);
    }

    private deleteItem(document: vscode.TextDocument, id: string) {
        const json = this.getDocumentAsJson(document);
        if (!Array.isArray(json.items)) {
            return;
        }

        json.items = json.items.filter((item: any) => item.id !== id);

        return this.updateTextDocument(document, json);
    }

    private getDocumentAsJson(document: vscode.TextDocument): any {
        const text = document.getText();
        if (text.trim().length === 0) {
            return { items: [] };
        }

        try {
            return JSON.parse(text);
        } catch {
            throw new Error('Could not get document as json. Content is not valid json');
        }
    }

    private updateTextDocument(document: vscode.TextDocument, json: any) {
        const edit = new vscode.WorkspaceEdit();
        edit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            JSON.stringify(json, null, 2)
        );

        return vscode.workspace.applyEdit(edit);
    }

    private getHtmlForWebview(webview: vscode.Webview, document: vscode.TextDocument): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>My Custom Editor</title>
            <style>
                body { 
                    font-family: var(--vscode-font-family);
                    padding: 20px;
                    color: var(--vscode-foreground);
                    background: var(--vscode-editor-background);
                }
                .header {
                    border-bottom: 1px solid var(--vscode-widget-border);
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
                .item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px;
                    margin: 5px 0;
                    background: var(--vscode-list-hoverBackground);
                    border-radius: 4px;
                }
                .add-button, .delete-button {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .delete-button {
                    background: var(--vscode-errorForeground);
                    color: white;
                    padding: 4px 8px;
                }
                .add-button:hover, .delete-button:hover {
                    opacity: 0.8;
                }
                .empty-state {
                    text-align: center;
                    color: var(--vscode-descriptionForeground);
                    margin: 40px 0;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📝 My Custom Editor</h1>
                <button class="add-button" onclick="addItem()">➕ Add Item</button>
            </div>
            <div id="items-container">
                <div class="empty-state">No items yet. Click "Add Item" to get started!</div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                let currentItems = [];

                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.type) {
                        case 'update':
                            updateContent(message.text);
                            break;
                    }
                });

                function updateContent(text) {
                    let data;
                    try {
                        data = text ? JSON.parse(text) : { items: [] };
                    } catch (error) {
                        data = { items: [] };
                    }
                    
                    currentItems = data.items || [];
                    renderItems();
                }

                function renderItems() {
                    const container = document.getElementById('items-container');
                    
                    if (currentItems.length === 0) {
                        container.innerHTML = '<div class="empty-state">No items yet. Click "Add Item" to get started!</div>';
                        return;
                    }

                    container.innerHTML = currentItems.map(item => 
                        \`<div class="item">
                            <div>
                                <strong>\${item.text}</strong>
                                <br><small>Created: \${new Date(item.created).toLocaleString()}</small>
                            </div>
                            <button class="delete-button" onclick="deleteItem('\${item.id}')">🗑️</button>
                        </div>\`
                    ).join('');
                }

                function addItem() {
                    vscode.postMessage({
                        type: 'add'
                    });
                }

                function deleteItem(id) {
                    vscode.postMessage({
                        type: 'delete',
                        id: id
                    });
                }
            </script>
        </body>
        </html>`;
    }
}

// NEW ACCORDION: Define accordion item interface
interface AccordionItem {
    label: string;
    children?: AccordionItem[];
    iconName?: string;
    command?: string;
}

// NEW ACCORDION: Tree provider for the new accordion
class NewAccordionProvider implements vscode.TreeDataProvider<AccordionItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<AccordionItem | undefined | null | void> = new vscode.EventEmitter<AccordionItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<AccordionItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private data: AccordionItem[] = [
        {
            label: '📁 Project Files',
            iconName: 'folder',
            children: [
                { label: '📄 main.ts', iconName: 'file-code' },
                { label: '📄 config.json', iconName: 'file-code' },
                { label: '📄 readme.md', iconName: 'markdown' }
            ]
        },
        {
            label: '🔧 Tools & Utilities',
            iconName: 'tools',
            children: [
                { label: '🔨 Build Tool', iconName: 'tools', command: 'myNewAccordion.itemClick' },
                { label: '🧪 Test Runner', iconName: 'beaker', command: 'myNewAccordion.itemClick' },
                { label: '📊 Analytics', iconName: 'graph', command: 'myNewAccordion.itemClick' }
            ]
        },
        {
            label: '⚙️ Settings',
            iconName: 'settings-gear',
            children: [
                { label: '🎨 Theme Settings', iconName: 'paintcan', command: 'myNewAccordion.itemClick' },
                { label: '🔐 Security', iconName: 'shield', command: 'myNewAccordion.itemClick' },
                { label: '📡 Extensions', iconName: 'extensions', command: 'myNewAccordion.itemClick' }
            ]
        },
        {
            label: '📈 Quick Actions',
            iconName: 'rocket',
            children: [
                { label: '🚀 Deploy', iconName: 'rocket', command: 'myNewAccordion.itemClick' },
                { label: '🔄 Sync', iconName: 'sync', command: 'myNewAccordion.itemClick' },
                { label: '📤 Export', iconName: 'export', command: 'myNewAccordion.itemClick' }
            ]
        }
    ];

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: AccordionItem): vscode.TreeItem {
        const hasChildren = element.children && element.children.length > 0;
        const item = new vscode.TreeItem(
            element.label,
            hasChildren ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
        );
        
        if (element.iconName) {
            item.iconPath = new vscode.ThemeIcon(element.iconName);
        }
        
        if (element.command && !hasChildren) {
            item.command = {
                command: element.command,
                title: 'Click Item',
                arguments: [element]
            };
        }
        
        if (!hasChildren) {
            item.contextValue = 'accordionItem';
        }
        
        return item;
    }

    getChildren(element?: AccordionItem): AccordionItem[] {
        if (!element) {
            return this.data;
        }
        return element.children || [];
    }
}

// THIRD PANEL: Define third panel item interface
interface ThirdPanelItem {
    label: string;
    id: string;
    iconName?: string;
    timestamp?: string;
}

// THIRD PANEL: Tree provider for the third panel
class ThirdPanelProvider implements vscode.TreeDataProvider<ThirdPanelItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ThirdPanelItem | undefined | null | void> = new vscode.EventEmitter<ThirdPanelItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ThirdPanelItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private items: ThirdPanelItem[] = [
        {
            id: '1',
            label: '📝 Todo: Review code',
            iconName: 'checklist',
            timestamp: new Date().toLocaleTimeString()
        },
        {
            id: '2',
            label: '🐛 Bug: Fix login issue',
            iconName: 'bug',
            timestamp: new Date().toLocaleTimeString()
        },
        {
            id: '3',
            label: '💡 Idea: Add dark theme',
            iconName: 'lightbulb',
            timestamp: new Date().toLocaleTimeString()
        }
    ];

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    addItem(label: string): void {
        const newItem: ThirdPanelItem = {
            id: Date.now().toString(),
            label: `📋 ${label}`,
            iconName: 'note',
            timestamp: new Date().toLocaleTimeString()
        };
        this.items.push(newItem);
        this.refresh();
    }

    removeItem(item: ThirdPanelItem): void {
        const index = this.items.findIndex(i => i.id === item.id);
        if (index > -1) {
            this.items.splice(index, 1);
            this.refresh();
        }
    }

    editItem(item: ThirdPanelItem, newLabel: string): void {
        const index = this.items.findIndex(i => i.id === item.id);
        if (index > -1) {
            this.items[index].label = newLabel;
            this.items[index].timestamp = new Date().toLocaleTimeString();
            this.refresh();
        }
    }

    getTreeItem(element: ThirdPanelItem): vscode.TreeItem {
        const item = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.None);
        
        if (element.iconName) {
            item.iconPath = new vscode.ThemeIcon(element.iconName);
        }
        
        item.tooltip = `Created: ${element.timestamp}`;
        item.contextValue = 'thirdPanelItem';
        item.description = element.timestamp;
        
        return item;
    }

    getChildren(element?: ThirdPanelItem): ThirdPanelItem[] {
        if (!element) {
            return this.items;
        }
        return [];
    }
}