import { ImportSpecifier, ExportSpecifier } from '@swc/types';

import type { Specifier } from './@types';

export const transformSpecifiers = (specifiers: Array<ImportSpecifier | ExportSpecifier>): Specifier[] => {
  const resultList: Specifier[] = [];
  for (const specifier of specifiers) {
    switch (specifier.type) {
      case 'ImportSpecifier': {
        if (specifier.imported !== null && specifier.imported !== void 0) {
          resultList.push({
            name: specifier.imported.value,
            typeOnly: specifier.isTypeOnly,
            localName: specifier.local.value,
          });
          break;
        }
        resultList.push({
          name: specifier.local.value,
          typeOnly: specifier.isTypeOnly,
          localName: null,
        });
        break;
      }
      case 'ImportDefaultSpecifier': {
        resultList.push({
          name: specifier.local.value,
          typeOnly: false,
          localName: null,
        });
        break;
      }
      case 'ImportNamespaceSpecifier': {
        resultList.push({
          name: specifier.local.value,
          typeOnly: false,
          localName: null,
        });
        break;
      }
      case 'ExportSpecifier': {
        resultList.push({
          name: specifier.orig.value,
          typeOnly: false,
          localName: specifier.exported?.value ?? null,
        });
        break;
      }
      case 'ExportNamespaceSpecifier':
        break;

      case 'ExportDefaultSpecifier':
        break;

      default:
        break;
    }
  }

  return resultList;
};
