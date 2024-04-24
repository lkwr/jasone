export class DecodeError extends Error {
  constructor(readonly value: unknown, readonly tag: unknown) {
    super(`Decoding error: ${value} with tag ${tag}`);
  }
}
