export enum TypeIdRegistry {
  Undefined = 0,
  Date = 1,
  BigInt = 2,
  RegExp = 3,
  Set = 4,
  Map = 5,
  URL = 6,
  // Instant is the most common Temporal type, so it gets the remaining
  // single-digit id. TypeIds 8 and 9 are left reserved for future use.
  TemporalInstant = 7,
  TemporalZonedDateTime = 10,
  TemporalPlainDate = 11,
  TemporalPlainTime = 12,
  TemporalPlainDateTime = 13,
  TemporalDuration = 14,
  TemporalPlainYearMonth = 15,
  TemporalPlainMonthDay = 16,
}
