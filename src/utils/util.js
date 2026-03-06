import fs, { constants } from 'node:fs/promises';

export const isFileOrDirectoryExist = async (path) => {
  const errorMsg = 'FS operation failed';

  try {
    await fs.access(path, constants.R_OK);
  } catch (error) {
    if (error.code === 'ENOENT') {
        console.error(errorMsg);
    } else if (error.code === 'EACCES') {
      console.error('Error: ', 'Access Denied!');
    }
    console.error('Error: ', error); 
  }
}

export const splitArrayByNumberOfCores = (arr, numberOfCores) => {
  let result = [];

  const chunkSize = Math.ceil(arr.length / numberOfCores);
  
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }

  return result;
}

export const keyMerge = (sortedArr) => {
    let result = [];

    result = sortedArr.reduce((merged, current) => {
        let i = 0, j = 0;
        const combined = [];
        while (i < merged.length && j < current.length) {
        if (merged[i] < current[j]) combined.push(merged[i++]);
        else combined.push(current[j++]);
        }
        return [...combined, ...merged.slice(i), ...current.slice(j)];
    }, []);

    return result;
}

export const hexToAsnii = (hexString) => {
    const red = parseInt(hexString.slice(1, 3), 16);
    const green = parseInt(hexString.slice(3, 5), 16);
    const blue = parseInt(hexString.slice(5), 16);
    return `\x1b[38;2;${red};${green};${blue}m`;
}

export const validateValueType = (argsKeyValueForm) => {
    if (isNaN(argsKeyValueForm.duration)) {
        process.stderr.write(new Error('No valid duration value!'))
    }

    if (isNaN(argsKeyValueForm.interval)) {
        process.stderr.write(new Error('No valid interval value!'));
    }

    if (isNaN(argsKeyValueForm.length)) {
        process.stderr.write(new Error('No valid length value!'));
    }

    const regHex = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i

    if (!regHex.test(argsKeyValueForm.color)) {
        argsKeyValueForm.color = '#FFFFFF';
    }
}