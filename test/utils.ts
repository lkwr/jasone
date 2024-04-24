import { JasoneCodec } from "../src/mod.ts";

export const processData = <T>(data: T, jasone: JasoneCodec): T => {
  return jasone.decode(JSON.parse(JSON.stringify(jasone.encode(data))));
};
