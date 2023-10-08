import { parseFile } from '@swc/core';
import path from 'node:path';
import fs from 'node:fs/promises';

import type { RelationNode } from './@types';
import { resolveImport } from './resolveImport';
import { transformSpecifiers } from './transformSpecifiers';
import { transformAsserts } from './transformAsserts';

export const main = async (basePath: string, entryFilePath: string, outputFilePath: string): Promise<void> => {
  const fileMap: Map<string, Record<string, RelationNode>> = new Map();
  const filesQueue: string[] = [path.join(basePath, entryFilePath)];

  while (filesQueue.length > 0) {
    const currentFileFullPath = filesQueue.shift();
    if (currentFileFullPath == null) throw new Error('currentFileFullPath is null');

    const currentFile = await parseFile(currentFileFullPath, {
      syntax: 'typescript',
      decorators: false,
      dynamicImport: false,
      comments: false,
      script: false,
      target: 'es2022',
    });

    for (const node of currentFile.body) {
      if (node.type === 'ImportDeclaration'
        || node.type === 'ExportAllDeclaration'
        || node.type === 'ExportNamedDeclaration') {
        if (node.source === null || node.source === void 0) continue;

        let filePath = await resolveImport(path.join(currentFileFullPath, '..'), node.source.value);
        if (filePath instanceof Error) {
          console.log(node.source.value, filePath);
          continue;
        }
        if (filePath === 'NODE_MODULE') filePath = node.source.value;
        else if (!fileMap.has(filePath)) {
          filesQueue.push(filePath);
        }

        const relations = fileMap.get(filePath) ?? {};
        if (currentFileFullPath in relations) {
          console.log(`Probably recursion import. From file ${currentFileFullPath} import ${filePath}`);
        }
        const currentFileRelation = relations[currentFileFullPath] ?? {};
        currentFileRelation.typeOnly = 'typeOnly' in node ? node.typeOnly : false;
        currentFileRelation.asserts = transformAsserts(node.asserts);
        currentFileRelation.specifiers = 'specifiers' in node ? transformSpecifiers(node.specifiers) : [];
        relations[currentFileFullPath] = currentFileRelation;
        fileMap.set(filePath, relations);
      } else if (node.type === 'VariableDeclaration') {
        for (const declaration of node.declarations) {
          if (declaration.init?.type === 'CallExpression'
            && declaration.init.callee.type === 'Identifier'
            && declaration.init.callee.value === 'require') {
            const path: string | null = declaration.init.arguments[0]?.expression.type === 'StringLiteral' ? declaration.init.arguments[0]?.expression.value : null;
            const localVariable: string | null = declaration.id.type === 'Identifier' ? declaration.id.value : null;
            console.log(`Node is '${declaration.init.callee.value}' with args ${path} as local variable ${localVariable}`);
          }
        }
      } else if (node.type === 'ExpressionStatement'
        && node.expression.type === 'CallExpression'
        && node.expression.callee.type === 'Identifier'
        && node.expression.callee.value === 'require') {
        const path: string | null = (node.expression.arguments?.[0]?.expression as any)?.value ?? null;
        console.log(`Node is '${node.expression.callee.value}' with args ${path}`);
      } else if (node.type === 'TsImportEqualsDeclaration') {
        console.log('TsImportEqualsDeclaration');
      }
    }
  }


  const outputData = Object.fromEntries(fileMap);
  await fs.writeFile(outputFilePath, JSON.stringify(outputData, null, 2));
};
