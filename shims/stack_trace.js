class CallSite {
  constructor(line) {
    this.line = line;
    this.parsed = this.parseLine(line);
  }

  parseLine(line) {
    const patterns = [
      /at\s+([^(]+)\s+\(([^:]+):(\d+):(\d+)\)/,
      /at\s+([^:]+):(\d+):(\d+)/,
      /([^@]+)@([^:]+):(\d+):(\d+)/,
      /([^@]*)@?([^:]*):?(\d+)?:?(\d+)?/
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        if (match.length >= 4) {
          return {
            functionName: (match[1] || '').trim(),
            fileName: match[2] || '',
            lineNumber: parseInt(match[3]) || 0,
            columnNumber: parseInt(match[4]) || 0
          };
        }
      }
    }

    return {
      functionName: '',
      fileName: '',
      lineNumber: 0,
      columnNumber: 0
    };
  }

  getThis() { return undefined; }
  getTypeName() { return null; }
  getFunction() { return undefined; }
  getFunctionName() { return this.parsed.functionName || null; }
  getMethodName() { return null; }
  getFileName() { return this.parsed.fileName || null; }
  getLineNumber() { return this.parsed.lineNumber || null; }
  getColumnNumber() { return this.parsed.columnNumber || null; }
  getEvalOrigin() { return null; }
  isToplevel() { return !this.parsed.functionName; }
  isEval() { return this.parsed.fileName?.includes('eval') || false; }
  isNative() { return this.parsed.fileName?.includes('native') || false; }
  isConstructor() { return this.parsed.functionName?.includes('new ') || false; }
  toString() { return this.line.trim(); }
}

const originalPrepareStackTrace = Error.prepareStackTrace;

if (!Error.captureStackTrace) {
  Error.captureStackTrace = function(targetObject, constructorOpt) {
    if (typeof targetObject !== 'object' || targetObject === null) {
      return;
    }

    const err = new Error();
    let stack = err.stack;

    if (!stack) {
      targetObject.stack = [];
      return;
    }

    const lines = stack.split('\n');
    const callSites = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        if (constructorOpt && line.includes(constructorOpt.name)) {
          continue;
        }
        if (line.includes('captureStackTrace') || line.includes('Error.captureStackTrace')) {
          continue;
        }
        callSites.push(new CallSite(line));
      }
    }

    targetObject.stack = callSites;
  };
}

Error.prepareStackTrace = function(error, structuredStackTrace) {
  if (Array.isArray(structuredStackTrace)) {
    if (structuredStackTrace[0] && typeof structuredStackTrace[0].getFileName === 'function') {
      return structuredStackTrace;
    }

    if (typeof structuredStackTrace[0] === 'string') {
      return structuredStackTrace.map(line => new CallSite(line));
    }
  }

  if (error?.stack) {
    const lines = error.stack.split('\n');
    const callSites = lines.slice(1)
      .filter(line => line.trim())
      .map(line => new CallSite(line));

    return callSites;
  }

  if (originalPrepareStackTrace) {
    return originalPrepareStackTrace(error, structuredStackTrace);
  }

  return [];
};

if (typeof Error.stackTraceLimit === 'undefined') {
  Error.stackTraceLimit = 10;
}
