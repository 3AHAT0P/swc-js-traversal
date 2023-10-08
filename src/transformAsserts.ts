import { ObjectExpression } from '@swc/core';

import type { ImportAssert } from './@types';

export const transformAsserts = (asserts: ObjectExpression | null = null): ImportAssert | null => {
  if (asserts === null) return null;

  let result: ImportAssert | null = null;

  for (const property of asserts.properties) {
    if ('key' in property
      && 'value' in property
      && 'value' in property.key
      && 'value' in property.value
      && property.key.value === 'type'
      && property.value.value === 'json') {
      result = { type: 'json' };
      break;
    }
  }

  return result;
};
