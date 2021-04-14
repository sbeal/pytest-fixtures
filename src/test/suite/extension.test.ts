import * as assert from 'assert';
import * as sinon from 'sinon';
import * as path from "path";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import Sinon = require('sinon');
import { afterEach, before } from 'mocha';
import { PytestFixtureCompletionItemProvider } from '../../suggestionProvider';

suite('Extension Test Suite', () => {
    const registerCompletionItemProvider = sinon.spy(vscode.languages, "registerCompletionItemProvider");
    before(async () => {
        // @ts-ignore
        const rootPath = vscode.workspace.workspaceFolders[0].uri.path;
        await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(
            path.join(rootPath, "test_example.py")
        ));
        await new Promise(resolve => setTimeout(resolve, 1000));
    });

    test("Should start extension when python file is opened", () => {
        const started = vscode.extensions.getExtension(
            "nickmillerdev.pytest-fixtures",
        );
        assert.notStrictEqual(started, undefined);
        assert.strictEqual(started?.isActive, true);
    });

    test("Should register the completion provider", () => {
        assert(registerCompletionItemProvider.calledOnce);
    });

    test("Should cache conftest fixtures for the current file", () => {
        const itemCompletionProvider = registerCompletionItemProvider.getCall(0).args[1];
        const cache = (itemCompletionProvider as PytestFixtureCompletionItemProvider).cache;
        const keys = Object.keys(cache);
        assert.strictEqual(keys.length, 1);
        const conftextFixture = cache[keys[0]].find((fixture) => fixture.name === "example_fixture");
        assert.notStrictEqual(conftextFixture, undefined);
    });

    test("Should cache built-in fixtures for the current file", () => {
        const itemCompletionProvider = registerCompletionItemProvider.getCall(0).args[1];
        const cache = (itemCompletionProvider as PytestFixtureCompletionItemProvider).cache;
        const keys = Object.keys(cache);
        assert.strictEqual(keys.length, 1);
        const conftextFixture = cache[keys[0]].find((fixture) => fixture.name === "monkeypatch");
        assert.notStrictEqual(conftextFixture, undefined);
    });
});
