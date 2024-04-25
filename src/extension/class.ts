import { Tag } from "../types.ts";
import { Extension } from "./extension.ts";

export type Class<Args extends any[] = any[], Return = any> = new (...args: Args) => Return;

export type CreateClassExtensionOptions = {
  tag?: Tag;
  checkConstructor?: boolean;
};

export const createClassExtension = <T extends Class>(
  clazz: T,
  options?: CreateClassExtensionOptions
): Extension<T> => {
  return {
    tag: options?.tag ?? clazz.name,

    check: (value): value is T =>
      value instanceof clazz &&
      // check constructor if configured
      options?.checkConstructor !== false
        ? value.constructor === clazz
        : true,

    encode: (value, { instance }) => instance.encode(value),

    decode: (value, { instance }) => {
      // create empty instance
      const instantiated = Object.create(clazz.prototype);

      // assign values
      Object.assign(instantiated, instance.decode(value));

      return instantiated;
    },
  };
};
