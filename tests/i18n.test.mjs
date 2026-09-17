import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const copy=JSON.parse(fs.readFileSync(new URL('../lib/copy.json',import.meta.url),'utf8'));
test('every screen translation exists in both languages, including parameters',()=>{for(const file of ['app/page.tsx','components/slow-space.tsx']){const source=fs.readFileSync(file,'utf8');const tree=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);function visit(n){if(ts.isCallExpression(n)&&n.expression.getText(tree)==='t'&&ts.isStringLiteral(n.arguments[0])){const key=n.arguments[0].text;assert.ok(copy[key],key);assert.ok(copy[key].en.length);assert.ok(copy[key].zh.length);const tokens=s=>[...s.matchAll(/\{\d+\}/g)].map(m=>m[0]).sort();assert.deepEqual(tokens(copy[key].en),tokens(key),key);assert.deepEqual(tokens(copy[key].zh),tokens(key),key)}ts.forEachChild(n,visit)}visit(tree)}});
test('English copy contains no untranslated Chinese or long dashes',()=>{for(const [key,entry] of Object.entries(copy)){assert.doesNotMatch(entry.en,/[\u3400-\u9fff—–]/,key);assert.doesNotMatch(entry.zh,/[—–]/,key)}});
test('selected moods keep stable values, free-text notes stay untouched',()=>{const page=fs.readFileSync('app/page.tsx','utf8');assert.match(page,/setDraft\(\{ \.\.\.draft, reason: r \}\)/);assert.match(page,/\{t\(r\)\}/);assert.doesNotMatch(page,/t\(n\.note\)/);assert.doesNotMatch(page,/t\(firstDue\?\.note\)/);assert.match(fs.readFileSync('lib/clock-out.ts','utf8'),/STORAGE_KEY='clock-out-v3'/)});
