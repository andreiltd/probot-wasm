export * from 'unenv/node/fs';

function writeSync(fd, buffer, position, encoding) {
  if (fd === 1 || fd === process.stdout?.fd) {
    const content = typeof buffer === 'string' ? buffer : buffer.toString(encoding || 'utf8');
    console.log(content);
    return content.length;
  } else if (fd === 2 || fd === process.stderr?.fd) {
    const content = typeof buffer === 'string' ? buffer : buffer.toString(encoding || 'utf8');
    console.error(content);
    return content.length;
  } else {
    throw new Error(`writeSync not implemented for fd: ${fd}`);
  }
}

function write(fd, buffer, offset, length, position, callback) {
  if (typeof offset === 'function') {
    callback = offset;
    offset = 0;
    length = buffer.length;
    position = null;
  } else if (typeof length === 'function') {
    callback = length;
    length = buffer.length - offset;
    position = null;
  } else if (typeof position === 'function') {
    callback = position;
    position = null;
  }

  Promise.resolve().then(() => {
    if (fd === 1 || fd === process.stdout?.fd) {
      const content = typeof buffer === 'string' ? buffer : buffer.toString('utf8');
      console.log(content);
      callback(null, content.length, buffer);
    } else if (fd === 2 || fd === process.stderr?.fd) {
      const content = typeof buffer === 'string' ? buffer : buffer.toString('utf8');
      console.error(content);
      callback(null, content.length, buffer);
    } else {
      callback(new Error(`write not implemented for fd: ${fd}`));
    }
  }).catch(error => {
    callback(error);
  });
}

export { writeSync, write };
