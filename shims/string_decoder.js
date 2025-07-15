export class StringDecoder {
  constructor(encoding = 'utf8') {
    this.encoding = encoding;

    const textDecoderEncoding = this._mapEncoding(encoding);
    this.decoder = new TextDecoder(textDecoderEncoding);
    this.lastNeed = 0;
    this.lastTotal = 0;
    this.lastChar = new Uint8Array(0);
  }

  _mapEncoding(encoding) {
    const map = {
      'utf8': 'utf-8',
      'utf-8': 'utf-8',
      'ascii': 'ascii',
      'latin1': 'latin1',
      'binary': 'latin1',
      'base64': 'utf-8',
      'hex': 'utf-8'
    };
    return map[encoding.toLowerCase()] || 'utf-8';
  }

  write(buf) {
    if (typeof buf === 'string') {
      return buf;
    }

    if (!buf || buf.length === 0) {
      return '';
    }

    // Convert Buffer to Uint8Array if needed
    const uint8Array = buf instanceof Uint8Array ? buf : new Uint8Array(buf);

    // Handle special encodings
    if (this.encoding === 'base64') {
      return this._decodeBase64(uint8Array);
    }

    if (this.encoding === 'hex') {
      return this._decodeHex(uint8Array);
    }

    try {
      return this.decoder.decode(uint8Array, { stream: true });
    } catch (e) {
      // Fallback for invalid sequences
      return this._fallbackDecode(uint8Array);
    }
  }

  end(buf) {
    let result = '';
    if (buf && buf.length > 0) {
      result = this.write(buf);
    }

    // Flush the decoder
    try {
      result += this.decoder.decode(new Uint8Array(0), { stream: false });
    } catch (e) {
      // Ignore flush errors
    }

    return result;
  }

  text(buf, offset = 0) {
    return this.write(buf.slice(offset));
  }

  _decodeBase64(uint8Array) {
    try {
      const binaryString = String.fromCharCode.apply(null, Array.from(uint8Array));
      return atob(binaryString);
    } catch (e) {
      return '';
    }
  }

  _decodeHex(uint8Array) {
    return Array.from(uint8Array)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  _fallbackDecode(uint8Array) {
    // Simple fallback that converts each byte to a character
    return String.fromCharCode.apply(null, Array.from(uint8Array));
  }
}

export default StringDecoder;
