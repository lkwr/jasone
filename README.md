# Jasone

A lightweight, extensible JSON encoder and decoder that supports custom types.

**NOTICE:** The documentation is still in progress and a lot of things are missing.

## Features

- 🚀 Fast & Lightweight: Minimal footprint.
- 🧩 Zero dependencies: No external packages required.
- 🔌 Extensible: Easily add custom types.
- 💻 TypeScript: Written in TypeScript for type safety and better DX.

## Installation

```bash
# npm
npm install jasone

# pnpm
pnpm add jasone

# yarn
yarn add jasone

# bun
bun add jasone
```

## Basic Usage

### Encoding

```ts
import { Jasone } from "jasone";

const data = { myDate: new Date("2025-04-05T14:30:00.000Z") };
const encoded = JSON.stringify(Jasone.encode(data));

console.log(encoded); // {"myDate":{"$":1,"iso":"2025-04-05T12:30:00.000Z"}}
```

### Decoding

```ts
import { Jasone } from "jasone";

const encoded = '{"myDate":{"$":1,"iso":"2025-04-05T12:30:00.000Z"}}';
const decoded = Jasone.decode(JSON.parse(encoded));

console.log(decoded); // { myDate: new Date("2025-04-05T12:30:00.000Z") }
```

## Advanced Usage

Adding custom types is easy. You just need to create a transformer object and register it with Jasone.

```ts
import { Jasone, type Transformer } from "jasone";

class Car {
  constructor(
    public brand: string,
    public model: string,
  ) {}

  // ...
}

const carType: Transformer<Car, { brand: string; model: string }> = {
  encoder: {
    // The filter is used to determine if the encoder can encode the given value.
    // There are many different filters, but for classes, the class constructor is the most efficient.
    filter: { class: Car },
    // The handler is used to encode the value.
    handler: ({ value }) => [
      // The type Id is used to identify the type in the encoded object.
      "Car",
      // Any JSON-compatible value can be returned as the encoded value. It will be passed to the decoder when decoding.
      { brand: value.brand, model: value.model },
    ],
  },
  decoder: {
    // The filter is used to determine if the decoder can decode the given value.
    filter: "Car",
    // The handler is used to decode the value returned by the encoder.
    handler: ({ value }) => new Car(value.brand, value.model),
  },
};

// Register the transformer with an already instantiated Jasone instance
Jasone.register(carType);

// Or create a new Jasone instance with the transformer already registered
// Note: The built-in transformers are always included and are registered after your custom transformers.
new Jasone({ transformers: [carType] });

// If you don't want the built-in transformers (e.g. for a smaller bundle size),
// use the lightweight core instead.
import { Jasone } from "jasone/core";

new Jasone({ transformers: [carType] });
```

## Built-in Types

The default `Jasone` export ships with transformers for the following types:

| Type                      | Encoded as                                                  |
| ------------------------- | ----------------------------------------------------------- |
| `undefined`               | `{"$":0}`                                                   |
| `Date`                    | `{"$":1,"iso":"1970-01-01T00:00:00.000Z"}`                  |
| `BigInt`                  | `{"$":2,"bigint":"1000"}`                                   |
| `RegExp`                  | `{"$":3,"source":"[a-z]+","flags":"gi"}`                    |
| `Set`                     | `{"$":4,"values":[1]}`                                      |
| `Map`                     | `{"$":5,"entries":[[1,2]]}`                                 |
| `URL`                     | `{"$":6,"url":"https://example.com/"}`                      |
| `Temporal.Instant`        | `{"$":7,"iso":"2025-04-05T12:30:00Z"}`                      |
| `Temporal.ZonedDateTime`  | `{"$":10,"iso":"2025-04-05T14:30:00+02:00[Europe/Berlin]"}` |
| `Temporal.PlainDate`      | `{"$":11,"iso":"2025-04-05"}`                               |
| `Temporal.PlainTime`      | `{"$":12,"iso":"14:30:00"}`                                 |
| `Temporal.PlainDateTime`  | `{"$":13,"iso":"2025-04-05T14:30:00"}`                      |
| `Temporal.Duration`       | `{"$":14,"iso":"P1DT2H30M"}`                                |
| `Temporal.PlainYearMonth` | `{"$":15,"iso":"2025-04"}`                                  |
| `Temporal.PlainMonthDay`  | `{"$":16,"iso":"04-05"}`                                    |

### Temporal Runtime Support

The `Temporal.*` transformers work out of the box on runtimes that implement
the [Temporal proposal](https://github.com/tc39/proposal-temporal) or have a
Temporal polyfill loaded.

On runtimes without Temporal support, Jasone keeps working for all other
types:

- Encoding Temporal values is impossible, as the runtime cannot create them.
- Decoding a payload that contains Temporal values fails with a descriptive
  error explaining that Temporal is not supported.

To add Temporal support to a runtime without it, load the
[temporal-polyfill](https://npmx.dev/package/temporal-polyfill).
Ideally before importing Jasone, so the faster class-based encoders can be
used, but loading it afterwards works as well.

## Comparison with SuperJSON

Jasone provides fewer features than SuperJSON, but is more performant, has a smaller footprint, and uses a simpler and more readable JSON structure.

If you only need to encode and decode custom types, Jasone is a great choice.

If you need features like referential equality, SuperJSON may be a better choice. However, most of the time, you don't need those features.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](./LICENSE).
