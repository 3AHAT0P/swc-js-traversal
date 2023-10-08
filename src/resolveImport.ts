import path from 'node:path';
import fs from 'node:fs/promises';

export const resolveImport = async (basePath: string, filePath: string): Promise<'NODE_MODULE' | string | Error> => {
  try {
    let fullPath = path.join(basePath, filePath);
    let fileStat = await fs.stat(fullPath);
    if (fileStat.isFile()) return fullPath;

    try {
      fullPath = path.join(basePath, filePath, 'index.ts');
      fileStat = await fs.stat(fullPath);
      if (fileStat.isFile()) return fullPath;
    } catch (error) {
      fullPath = path.join(basePath, filePath, 'index.d.ts');
      fileStat = await fs.stat(fullPath);
      if (fileStat.isFile()) return fullPath;
    }

    return new Error('INCORRECT_FILE_TYPE');
  } catch (error) {
    try {
      const fullPath = path.join(basePath, filePath + '.ts');

      try {
        const fileStat = await fs.stat(fullPath);
        if (fileStat.isFile()) return fullPath;
      } catch (error) {
        const fullPath = path.join(basePath, filePath + '.d.ts');
        const fileStat = await fs.stat(fullPath);
        if (fileStat.isFile()) return fullPath;
      }

      return new Error('INCORRECT_FILE_TYPE');
    } catch (error) {
      return 'NODE_MODULE';
    }
  }
};
