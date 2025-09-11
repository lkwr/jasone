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
import { defaultTransformers, Jasone, type Transformer } from "jasone";

class Car {
  constructor(
    public brand: string,
    public model: string,
  ) {}

  // ...
}

const carType: Transformer<Car, { brand: string; model: string }> = {
  encoder: {
    // The filter is used to determine if the transformer can encode the given value.
    // There are many different filters, but for classes, the class constructor is the most efficient.
    filter: { class: Car },
    // The handler is used to encode the value.
    handler: ({ value }) => [
      // The type Id is used to identify the type in the encoded object.
      "Car",
      // Any JSON-compatible value needed to reconstruct the original value.
      { brand: value.brand, model: value.model },
    ],
  },
  decoder: {
    // The filter is used to determine if the transformer can decode the given value.
    filter: "Car",
    // The handler is used to decode the value.
    handler: ({ value }) => new Car(value.brand, value.model),
  },
};

// Register the type with an already instantiated Jasone instance
Jasone.register(carType);

// Or create a new Jasone instance with the type already registered
new Jasone({ types: [carType] });

// Or register the type with default built-in transformers like Date, BigInt, Map, etc.
new Jasone({ types: [carType, ...defaultTransformers] });
```

## Comparison with Superjson

Jasone provides fewer features than Superjson, but is more performant, has a smaller footprint, and uses a simpler JSON format.

If you only need to encode and decode custom types, Jasone is a great choice.

If you need features like referential equality, Superjson may be a better choice. However, most of the time, you don't need those features.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](./LICENSE).
