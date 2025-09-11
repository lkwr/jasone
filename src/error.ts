import type { Decoder, TypeId } from "./types.ts";

export abstract class JasoneError extends Error {}

export class UnknownTypeIdError extends JasoneError {
  constructor(typeId: TypeId, value: unknown) {
    super(`Unknown type id: ${typeId}`, { cause: value });
  }
}

export class NonJsonValueError extends JasoneError {
  constructor(value: unknown) {
    super("Non-JSON value received", { cause: value });
  }
}

export class IllegalEncoderResultError extends JasoneError {
  constructor(value: unknown) {
    super(
      "Illegal encoder result received: The encoder result cannot contains the type identifer.",
      { cause: value },
    );
  }
}

export class UnhandledValueError extends JasoneError {
  constructor(value: unknown) {
    super("Unhandled value received: No encoder found for this value.", {
      cause: value,
    });
  }
}

export class DuplicatedTypeIdError extends JasoneError {
  constructor(typeId: TypeId, decoder: Decoder) {
    super(
      `Duplicated type id: The TypeId<${JSON.stringify(typeId)}> is already registered.`,
      { cause: decoder },
    );
  }
}
