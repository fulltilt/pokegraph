
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Card
 * 
 */
export type Card = $Result.DefaultSelection<Prisma.$CardPayload>
/**
 * Model PriceEntry
 * 
 */
export type PriceEntry = $Result.DefaultSelection<Prisma.$PriceEntryPayload>
/**
 * Model Sealed
 * 
 */
export type Sealed = $Result.DefaultSelection<Prisma.$SealedPayload>
/**
 * Model SealedPriceEntry
 * 
 */
export type SealedPriceEntry = $Result.DefaultSelection<Prisma.$SealedPriceEntryPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Cards
 * const cards = await prisma.card.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Cards
   * const cards = await prisma.card.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.card`: Exposes CRUD operations for the **Card** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Cards
    * const cards = await prisma.card.findMany()
    * ```
    */
  get card(): Prisma.CardDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.priceEntry`: Exposes CRUD operations for the **PriceEntry** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PriceEntries
    * const priceEntries = await prisma.priceEntry.findMany()
    * ```
    */
  get priceEntry(): Prisma.PriceEntryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.sealed`: Exposes CRUD operations for the **Sealed** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Sealeds
    * const sealeds = await prisma.sealed.findMany()
    * ```
    */
  get sealed(): Prisma.SealedDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.sealedPriceEntry`: Exposes CRUD operations for the **SealedPriceEntry** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SealedPriceEntries
    * const sealedPriceEntries = await prisma.sealedPriceEntry.findMany()
    * ```
    */
  get sealedPriceEntry(): Prisma.SealedPriceEntryDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.7.0
   * Query Engine version: 3cff47a7f5d65c3ea74883f1d736e41d68ce91ed
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Card: 'Card',
    PriceEntry: 'PriceEntry',
    Sealed: 'Sealed',
    SealedPriceEntry: 'SealedPriceEntry'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "card" | "priceEntry" | "sealed" | "sealedPriceEntry"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Card: {
        payload: Prisma.$CardPayload<ExtArgs>
        fields: Prisma.CardFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CardFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CardFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>
          }
          findFirst: {
            args: Prisma.CardFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CardFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>
          }
          findMany: {
            args: Prisma.CardFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>[]
          }
          create: {
            args: Prisma.CardCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>
          }
          createMany: {
            args: Prisma.CardCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CardCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>[]
          }
          delete: {
            args: Prisma.CardDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>
          }
          update: {
            args: Prisma.CardUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>
          }
          deleteMany: {
            args: Prisma.CardDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CardUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CardUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>[]
          }
          upsert: {
            args: Prisma.CardUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>
          }
          aggregate: {
            args: Prisma.CardAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCard>
          }
          groupBy: {
            args: Prisma.CardGroupByArgs<ExtArgs>
            result: $Utils.Optional<CardGroupByOutputType>[]
          }
          count: {
            args: Prisma.CardCountArgs<ExtArgs>
            result: $Utils.Optional<CardCountAggregateOutputType> | number
          }
        }
      }
      PriceEntry: {
        payload: Prisma.$PriceEntryPayload<ExtArgs>
        fields: Prisma.PriceEntryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PriceEntryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceEntryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PriceEntryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceEntryPayload>
          }
          findFirst: {
            args: Prisma.PriceEntryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceEntryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PriceEntryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceEntryPayload>
          }
          findMany: {
            args: Prisma.PriceEntryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceEntryPayload>[]
          }
          create: {
            args: Prisma.PriceEntryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceEntryPayload>
          }
          createMany: {
            args: Prisma.PriceEntryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PriceEntryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceEntryPayload>[]
          }
          delete: {
            args: Prisma.PriceEntryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceEntryPayload>
          }
          update: {
            args: Prisma.PriceEntryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceEntryPayload>
          }
          deleteMany: {
            args: Prisma.PriceEntryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PriceEntryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PriceEntryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceEntryPayload>[]
          }
          upsert: {
            args: Prisma.PriceEntryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceEntryPayload>
          }
          aggregate: {
            args: Prisma.PriceEntryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePriceEntry>
          }
          groupBy: {
            args: Prisma.PriceEntryGroupByArgs<ExtArgs>
            result: $Utils.Optional<PriceEntryGroupByOutputType>[]
          }
          count: {
            args: Prisma.PriceEntryCountArgs<ExtArgs>
            result: $Utils.Optional<PriceEntryCountAggregateOutputType> | number
          }
        }
      }
      Sealed: {
        payload: Prisma.$SealedPayload<ExtArgs>
        fields: Prisma.SealedFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SealedFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SealedPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SealedFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SealedPayload>
          }
          findFirst: {
            args: Prisma.SealedFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SealedPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SealedFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SealedPayload>
          }
          findMany: {
            args: Prisma.SealedFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SealedPayload>[]
          }
          create: {
            args: Prisma.SealedCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SealedPayload>
          }
          createMany: {
            args: Prisma.SealedCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SealedCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SealedPayload>[]
          }
          delete: {
            args: Prisma.SealedDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SealedPayload>
          }
          update: {
            args: Prisma.SealedUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SealedPayload>
          }
          deleteMany: {
            args: Prisma.SealedDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SealedUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SealedUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SealedPayload>[]
          }
          upsert: {
            args: Prisma.SealedUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SealedPayload>
          }
          aggregate: {
            args: Prisma.SealedAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSealed>
          }
          groupBy: {
            args: Prisma.SealedGroupByArgs<ExtArgs>
            result: $Utils.Optional<SealedGroupByOutputType>[]
          }
          count: {
            args: Prisma.SealedCountArgs<ExtArgs>
            result: $Utils.Optional<SealedCountAggregateOutputType> | number
          }
        }
      }
      SealedPriceEntry: {
        payload: Prisma.$SealedPriceEntryPayload<ExtArgs>
        fields: Prisma.SealedPriceEntryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SealedPriceEntryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SealedPriceEntryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SealedPriceEntryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SealedPriceEntryPayload>
          }
          findFirst: {
            args: Prisma.SealedPriceEntryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SealedPriceEntryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SealedPriceEntryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SealedPriceEntryPayload>
          }
          findMany: {
            args: Prisma.SealedPriceEntryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SealedPriceEntryPayload>[]
          }
          create: {
            args: Prisma.SealedPriceEntryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SealedPriceEntryPayload>
          }
          createMany: {
            args: Prisma.SealedPriceEntryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SealedPriceEntryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SealedPriceEntryPayload>[]
          }
          delete: {
            args: Prisma.SealedPriceEntryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SealedPriceEntryPayload>
          }
          update: {
            args: Prisma.SealedPriceEntryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SealedPriceEntryPayload>
          }
          deleteMany: {
            args: Prisma.SealedPriceEntryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SealedPriceEntryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SealedPriceEntryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SealedPriceEntryPayload>[]
          }
          upsert: {
            args: Prisma.SealedPriceEntryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SealedPriceEntryPayload>
          }
          aggregate: {
            args: Prisma.SealedPriceEntryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSealedPriceEntry>
          }
          groupBy: {
            args: Prisma.SealedPriceEntryGroupByArgs<ExtArgs>
            result: $Utils.Optional<SealedPriceEntryGroupByOutputType>[]
          }
          count: {
            args: Prisma.SealedPriceEntryCountArgs<ExtArgs>
            result: $Utils.Optional<SealedPriceEntryCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    card?: CardOmit
    priceEntry?: PriceEntryOmit
    sealed?: SealedOmit
    sealedPriceEntry?: SealedPriceEntryOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type CardCountOutputType
   */

  export type CardCountOutputType = {
    prices: number
  }

  export type CardCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    prices?: boolean | CardCountOutputTypeCountPricesArgs
  }

  // Custom InputTypes
  /**
   * CardCountOutputType without action
   */
  export type CardCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CardCountOutputType
     */
    select?: CardCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CardCountOutputType without action
   */
  export type CardCountOutputTypeCountPricesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PriceEntryWhereInput
  }


  /**
   * Count Type SealedCountOutputType
   */

  export type SealedCountOutputType = {
    prices: number
  }

  export type SealedCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    prices?: boolean | SealedCountOutputTypeCountPricesArgs
  }

  // Custom InputTypes
  /**
   * SealedCountOutputType without action
   */
  export type SealedCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SealedCountOutputType
     */
    select?: SealedCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SealedCountOutputType without action
   */
  export type SealedCountOutputTypeCountPricesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SealedPriceEntryWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Card
   */

  export type AggregateCard = {
    _count: CardCountAggregateOutputType | null
    _min: CardMinAggregateOutputType | null
    _max: CardMaxAggregateOutputType | null
  }

  export type CardMinAggregateOutputType = {
    id: string | null
  }

  export type CardMaxAggregateOutputType = {
    id: string | null
  }

  export type CardCountAggregateOutputType = {
    id: number
    data: number
    _all: number
  }


  export type CardMinAggregateInputType = {
    id?: true
  }

  export type CardMaxAggregateInputType = {
    id?: true
  }

  export type CardCountAggregateInputType = {
    id?: true
    data?: true
    _all?: true
  }

  export type CardAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Card to aggregate.
     */
    where?: CardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cards to fetch.
     */
    orderBy?: CardOrderByWithRelationInput | CardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Cards
    **/
    _count?: true | CardCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CardMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CardMaxAggregateInputType
  }

  export type GetCardAggregateType<T extends CardAggregateArgs> = {
        [P in keyof T & keyof AggregateCard]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCard[P]>
      : GetScalarType<T[P], AggregateCard[P]>
  }




  export type CardGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CardWhereInput
    orderBy?: CardOrderByWithAggregationInput | CardOrderByWithAggregationInput[]
    by: CardScalarFieldEnum[] | CardScalarFieldEnum
    having?: CardScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CardCountAggregateInputType | true
    _min?: CardMinAggregateInputType
    _max?: CardMaxAggregateInputType
  }

  export type CardGroupByOutputType = {
    id: string
    data: JsonValue
    _count: CardCountAggregateOutputType | null
    _min: CardMinAggregateOutputType | null
    _max: CardMaxAggregateOutputType | null
  }

  type GetCardGroupByPayload<T extends CardGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CardGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CardGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CardGroupByOutputType[P]>
            : GetScalarType<T[P], CardGroupByOutputType[P]>
        }
      >
    >


  export type CardSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    data?: boolean
    prices?: boolean | Card$pricesArgs<ExtArgs>
    _count?: boolean | CardCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["card"]>

  export type CardSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    data?: boolean
  }, ExtArgs["result"]["card"]>

  export type CardSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    data?: boolean
  }, ExtArgs["result"]["card"]>

  export type CardSelectScalar = {
    id?: boolean
    data?: boolean
  }

  export type CardOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "data", ExtArgs["result"]["card"]>
  export type CardInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    prices?: boolean | Card$pricesArgs<ExtArgs>
    _count?: boolean | CardCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CardIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type CardIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CardPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Card"
    objects: {
      prices: Prisma.$PriceEntryPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      data: Prisma.JsonValue
    }, ExtArgs["result"]["card"]>
    composites: {}
  }

  type CardGetPayload<S extends boolean | null | undefined | CardDefaultArgs> = $Result.GetResult<Prisma.$CardPayload, S>

  type CardCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CardFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CardCountAggregateInputType | true
    }

  export interface CardDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Card'], meta: { name: 'Card' } }
    /**
     * Find zero or one Card that matches the filter.
     * @param {CardFindUniqueArgs} args - Arguments to find a Card
     * @example
     * // Get one Card
     * const card = await prisma.card.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CardFindUniqueArgs>(args: SelectSubset<T, CardFindUniqueArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Card that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CardFindUniqueOrThrowArgs} args - Arguments to find a Card
     * @example
     * // Get one Card
     * const card = await prisma.card.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CardFindUniqueOrThrowArgs>(args: SelectSubset<T, CardFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Card that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardFindFirstArgs} args - Arguments to find a Card
     * @example
     * // Get one Card
     * const card = await prisma.card.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CardFindFirstArgs>(args?: SelectSubset<T, CardFindFirstArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Card that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardFindFirstOrThrowArgs} args - Arguments to find a Card
     * @example
     * // Get one Card
     * const card = await prisma.card.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CardFindFirstOrThrowArgs>(args?: SelectSubset<T, CardFindFirstOrThrowArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Cards that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Cards
     * const cards = await prisma.card.findMany()
     * 
     * // Get first 10 Cards
     * const cards = await prisma.card.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cardWithIdOnly = await prisma.card.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CardFindManyArgs>(args?: SelectSubset<T, CardFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Card.
     * @param {CardCreateArgs} args - Arguments to create a Card.
     * @example
     * // Create one Card
     * const Card = await prisma.card.create({
     *   data: {
     *     // ... data to create a Card
     *   }
     * })
     * 
     */
    create<T extends CardCreateArgs>(args: SelectSubset<T, CardCreateArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Cards.
     * @param {CardCreateManyArgs} args - Arguments to create many Cards.
     * @example
     * // Create many Cards
     * const card = await prisma.card.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CardCreateManyArgs>(args?: SelectSubset<T, CardCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Cards and returns the data saved in the database.
     * @param {CardCreateManyAndReturnArgs} args - Arguments to create many Cards.
     * @example
     * // Create many Cards
     * const card = await prisma.card.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Cards and only return the `id`
     * const cardWithIdOnly = await prisma.card.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CardCreateManyAndReturnArgs>(args?: SelectSubset<T, CardCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Card.
     * @param {CardDeleteArgs} args - Arguments to delete one Card.
     * @example
     * // Delete one Card
     * const Card = await prisma.card.delete({
     *   where: {
     *     // ... filter to delete one Card
     *   }
     * })
     * 
     */
    delete<T extends CardDeleteArgs>(args: SelectSubset<T, CardDeleteArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Card.
     * @param {CardUpdateArgs} args - Arguments to update one Card.
     * @example
     * // Update one Card
     * const card = await prisma.card.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CardUpdateArgs>(args: SelectSubset<T, CardUpdateArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Cards.
     * @param {CardDeleteManyArgs} args - Arguments to filter Cards to delete.
     * @example
     * // Delete a few Cards
     * const { count } = await prisma.card.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CardDeleteManyArgs>(args?: SelectSubset<T, CardDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Cards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Cards
     * const card = await prisma.card.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CardUpdateManyArgs>(args: SelectSubset<T, CardUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Cards and returns the data updated in the database.
     * @param {CardUpdateManyAndReturnArgs} args - Arguments to update many Cards.
     * @example
     * // Update many Cards
     * const card = await prisma.card.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Cards and only return the `id`
     * const cardWithIdOnly = await prisma.card.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CardUpdateManyAndReturnArgs>(args: SelectSubset<T, CardUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Card.
     * @param {CardUpsertArgs} args - Arguments to update or create a Card.
     * @example
     * // Update or create a Card
     * const card = await prisma.card.upsert({
     *   create: {
     *     // ... data to create a Card
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Card we want to update
     *   }
     * })
     */
    upsert<T extends CardUpsertArgs>(args: SelectSubset<T, CardUpsertArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Cards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardCountArgs} args - Arguments to filter Cards to count.
     * @example
     * // Count the number of Cards
     * const count = await prisma.card.count({
     *   where: {
     *     // ... the filter for the Cards we want to count
     *   }
     * })
    **/
    count<T extends CardCountArgs>(
      args?: Subset<T, CardCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CardCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Card.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CardAggregateArgs>(args: Subset<T, CardAggregateArgs>): Prisma.PrismaPromise<GetCardAggregateType<T>>

    /**
     * Group by Card.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CardGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CardGroupByArgs['orderBy'] }
        : { orderBy?: CardGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CardGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCardGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Card model
   */
  readonly fields: CardFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Card.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CardClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    prices<T extends Card$pricesArgs<ExtArgs> = {}>(args?: Subset<T, Card$pricesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PriceEntryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Card model
   */
  interface CardFieldRefs {
    readonly id: FieldRef<"Card", 'String'>
    readonly data: FieldRef<"Card", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * Card findUnique
   */
  export type CardFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * Filter, which Card to fetch.
     */
    where: CardWhereUniqueInput
  }

  /**
   * Card findUniqueOrThrow
   */
  export type CardFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * Filter, which Card to fetch.
     */
    where: CardWhereUniqueInput
  }

  /**
   * Card findFirst
   */
  export type CardFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * Filter, which Card to fetch.
     */
    where?: CardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cards to fetch.
     */
    orderBy?: CardOrderByWithRelationInput | CardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Cards.
     */
    cursor?: CardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Cards.
     */
    distinct?: CardScalarFieldEnum | CardScalarFieldEnum[]
  }

  /**
   * Card findFirstOrThrow
   */
  export type CardFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * Filter, which Card to fetch.
     */
    where?: CardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cards to fetch.
     */
    orderBy?: CardOrderByWithRelationInput | CardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Cards.
     */
    cursor?: CardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Cards.
     */
    distinct?: CardScalarFieldEnum | CardScalarFieldEnum[]
  }

  /**
   * Card findMany
   */
  export type CardFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * Filter, which Cards to fetch.
     */
    where?: CardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cards to fetch.
     */
    orderBy?: CardOrderByWithRelationInput | CardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Cards.
     */
    cursor?: CardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cards.
     */
    skip?: number
    distinct?: CardScalarFieldEnum | CardScalarFieldEnum[]
  }

  /**
   * Card create
   */
  export type CardCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * The data needed to create a Card.
     */
    data: XOR<CardCreateInput, CardUncheckedCreateInput>
  }

  /**
   * Card createMany
   */
  export type CardCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Cards.
     */
    data: CardCreateManyInput | CardCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Card createManyAndReturn
   */
  export type CardCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * The data used to create many Cards.
     */
    data: CardCreateManyInput | CardCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Card update
   */
  export type CardUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * The data needed to update a Card.
     */
    data: XOR<CardUpdateInput, CardUncheckedUpdateInput>
    /**
     * Choose, which Card to update.
     */
    where: CardWhereUniqueInput
  }

  /**
   * Card updateMany
   */
  export type CardUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Cards.
     */
    data: XOR<CardUpdateManyMutationInput, CardUncheckedUpdateManyInput>
    /**
     * Filter which Cards to update
     */
    where?: CardWhereInput
    /**
     * Limit how many Cards to update.
     */
    limit?: number
  }

  /**
   * Card updateManyAndReturn
   */
  export type CardUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * The data used to update Cards.
     */
    data: XOR<CardUpdateManyMutationInput, CardUncheckedUpdateManyInput>
    /**
     * Filter which Cards to update
     */
    where?: CardWhereInput
    /**
     * Limit how many Cards to update.
     */
    limit?: number
  }

  /**
   * Card upsert
   */
  export type CardUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * The filter to search for the Card to update in case it exists.
     */
    where: CardWhereUniqueInput
    /**
     * In case the Card found by the `where` argument doesn't exist, create a new Card with this data.
     */
    create: XOR<CardCreateInput, CardUncheckedCreateInput>
    /**
     * In case the Card was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CardUpdateInput, CardUncheckedUpdateInput>
  }

  /**
   * Card delete
   */
  export type CardDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * Filter which Card to delete.
     */
    where: CardWhereUniqueInput
  }

  /**
   * Card deleteMany
   */
  export type CardDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Cards to delete
     */
    where?: CardWhereInput
    /**
     * Limit how many Cards to delete.
     */
    limit?: number
  }

  /**
   * Card.prices
   */
  export type Card$pricesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceEntry
     */
    select?: PriceEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceEntry
     */
    omit?: PriceEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceEntryInclude<ExtArgs> | null
    where?: PriceEntryWhereInput
    orderBy?: PriceEntryOrderByWithRelationInput | PriceEntryOrderByWithRelationInput[]
    cursor?: PriceEntryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PriceEntryScalarFieldEnum | PriceEntryScalarFieldEnum[]
  }

  /**
   * Card without action
   */
  export type CardDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
  }


  /**
   * Model PriceEntry
   */

  export type AggregatePriceEntry = {
    _count: PriceEntryCountAggregateOutputType | null
    _avg: PriceEntryAvgAggregateOutputType | null
    _sum: PriceEntrySumAggregateOutputType | null
    _min: PriceEntryMinAggregateOutputType | null
    _max: PriceEntryMaxAggregateOutputType | null
  }

  export type PriceEntryAvgAggregateOutputType = {
    id: number | null
    price: number | null
  }

  export type PriceEntrySumAggregateOutputType = {
    id: number | null
    price: number | null
  }

  export type PriceEntryMinAggregateOutputType = {
    id: number | null
    cardId: string | null
    price: number | null
    date: Date | null
  }

  export type PriceEntryMaxAggregateOutputType = {
    id: number | null
    cardId: string | null
    price: number | null
    date: Date | null
  }

  export type PriceEntryCountAggregateOutputType = {
    id: number
    cardId: number
    price: number
    date: number
    _all: number
  }


  export type PriceEntryAvgAggregateInputType = {
    id?: true
    price?: true
  }

  export type PriceEntrySumAggregateInputType = {
    id?: true
    price?: true
  }

  export type PriceEntryMinAggregateInputType = {
    id?: true
    cardId?: true
    price?: true
    date?: true
  }

  export type PriceEntryMaxAggregateInputType = {
    id?: true
    cardId?: true
    price?: true
    date?: true
  }

  export type PriceEntryCountAggregateInputType = {
    id?: true
    cardId?: true
    price?: true
    date?: true
    _all?: true
  }

  export type PriceEntryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PriceEntry to aggregate.
     */
    where?: PriceEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PriceEntries to fetch.
     */
    orderBy?: PriceEntryOrderByWithRelationInput | PriceEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PriceEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PriceEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PriceEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PriceEntries
    **/
    _count?: true | PriceEntryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PriceEntryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PriceEntrySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PriceEntryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PriceEntryMaxAggregateInputType
  }

  export type GetPriceEntryAggregateType<T extends PriceEntryAggregateArgs> = {
        [P in keyof T & keyof AggregatePriceEntry]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePriceEntry[P]>
      : GetScalarType<T[P], AggregatePriceEntry[P]>
  }




  export type PriceEntryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PriceEntryWhereInput
    orderBy?: PriceEntryOrderByWithAggregationInput | PriceEntryOrderByWithAggregationInput[]
    by: PriceEntryScalarFieldEnum[] | PriceEntryScalarFieldEnum
    having?: PriceEntryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PriceEntryCountAggregateInputType | true
    _avg?: PriceEntryAvgAggregateInputType
    _sum?: PriceEntrySumAggregateInputType
    _min?: PriceEntryMinAggregateInputType
    _max?: PriceEntryMaxAggregateInputType
  }

  export type PriceEntryGroupByOutputType = {
    id: number
    cardId: string
    price: number
    date: Date
    _count: PriceEntryCountAggregateOutputType | null
    _avg: PriceEntryAvgAggregateOutputType | null
    _sum: PriceEntrySumAggregateOutputType | null
    _min: PriceEntryMinAggregateOutputType | null
    _max: PriceEntryMaxAggregateOutputType | null
  }

  type GetPriceEntryGroupByPayload<T extends PriceEntryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PriceEntryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PriceEntryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PriceEntryGroupByOutputType[P]>
            : GetScalarType<T[P], PriceEntryGroupByOutputType[P]>
        }
      >
    >


  export type PriceEntrySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cardId?: boolean
    price?: boolean
    date?: boolean
    card?: boolean | CardDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["priceEntry"]>

  export type PriceEntrySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cardId?: boolean
    price?: boolean
    date?: boolean
    card?: boolean | CardDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["priceEntry"]>

  export type PriceEntrySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cardId?: boolean
    price?: boolean
    date?: boolean
    card?: boolean | CardDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["priceEntry"]>

  export type PriceEntrySelectScalar = {
    id?: boolean
    cardId?: boolean
    price?: boolean
    date?: boolean
  }

  export type PriceEntryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "cardId" | "price" | "date", ExtArgs["result"]["priceEntry"]>
  export type PriceEntryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    card?: boolean | CardDefaultArgs<ExtArgs>
  }
  export type PriceEntryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    card?: boolean | CardDefaultArgs<ExtArgs>
  }
  export type PriceEntryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    card?: boolean | CardDefaultArgs<ExtArgs>
  }

  export type $PriceEntryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PriceEntry"
    objects: {
      card: Prisma.$CardPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      cardId: string
      price: number
      date: Date
    }, ExtArgs["result"]["priceEntry"]>
    composites: {}
  }

  type PriceEntryGetPayload<S extends boolean | null | undefined | PriceEntryDefaultArgs> = $Result.GetResult<Prisma.$PriceEntryPayload, S>

  type PriceEntryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PriceEntryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PriceEntryCountAggregateInputType | true
    }

  export interface PriceEntryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PriceEntry'], meta: { name: 'PriceEntry' } }
    /**
     * Find zero or one PriceEntry that matches the filter.
     * @param {PriceEntryFindUniqueArgs} args - Arguments to find a PriceEntry
     * @example
     * // Get one PriceEntry
     * const priceEntry = await prisma.priceEntry.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PriceEntryFindUniqueArgs>(args: SelectSubset<T, PriceEntryFindUniqueArgs<ExtArgs>>): Prisma__PriceEntryClient<$Result.GetResult<Prisma.$PriceEntryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PriceEntry that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PriceEntryFindUniqueOrThrowArgs} args - Arguments to find a PriceEntry
     * @example
     * // Get one PriceEntry
     * const priceEntry = await prisma.priceEntry.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PriceEntryFindUniqueOrThrowArgs>(args: SelectSubset<T, PriceEntryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PriceEntryClient<$Result.GetResult<Prisma.$PriceEntryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PriceEntry that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PriceEntryFindFirstArgs} args - Arguments to find a PriceEntry
     * @example
     * // Get one PriceEntry
     * const priceEntry = await prisma.priceEntry.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PriceEntryFindFirstArgs>(args?: SelectSubset<T, PriceEntryFindFirstArgs<ExtArgs>>): Prisma__PriceEntryClient<$Result.GetResult<Prisma.$PriceEntryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PriceEntry that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PriceEntryFindFirstOrThrowArgs} args - Arguments to find a PriceEntry
     * @example
     * // Get one PriceEntry
     * const priceEntry = await prisma.priceEntry.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PriceEntryFindFirstOrThrowArgs>(args?: SelectSubset<T, PriceEntryFindFirstOrThrowArgs<ExtArgs>>): Prisma__PriceEntryClient<$Result.GetResult<Prisma.$PriceEntryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PriceEntries that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PriceEntryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PriceEntries
     * const priceEntries = await prisma.priceEntry.findMany()
     * 
     * // Get first 10 PriceEntries
     * const priceEntries = await prisma.priceEntry.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const priceEntryWithIdOnly = await prisma.priceEntry.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PriceEntryFindManyArgs>(args?: SelectSubset<T, PriceEntryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PriceEntryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PriceEntry.
     * @param {PriceEntryCreateArgs} args - Arguments to create a PriceEntry.
     * @example
     * // Create one PriceEntry
     * const PriceEntry = await prisma.priceEntry.create({
     *   data: {
     *     // ... data to create a PriceEntry
     *   }
     * })
     * 
     */
    create<T extends PriceEntryCreateArgs>(args: SelectSubset<T, PriceEntryCreateArgs<ExtArgs>>): Prisma__PriceEntryClient<$Result.GetResult<Prisma.$PriceEntryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PriceEntries.
     * @param {PriceEntryCreateManyArgs} args - Arguments to create many PriceEntries.
     * @example
     * // Create many PriceEntries
     * const priceEntry = await prisma.priceEntry.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PriceEntryCreateManyArgs>(args?: SelectSubset<T, PriceEntryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PriceEntries and returns the data saved in the database.
     * @param {PriceEntryCreateManyAndReturnArgs} args - Arguments to create many PriceEntries.
     * @example
     * // Create many PriceEntries
     * const priceEntry = await prisma.priceEntry.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PriceEntries and only return the `id`
     * const priceEntryWithIdOnly = await prisma.priceEntry.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PriceEntryCreateManyAndReturnArgs>(args?: SelectSubset<T, PriceEntryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PriceEntryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PriceEntry.
     * @param {PriceEntryDeleteArgs} args - Arguments to delete one PriceEntry.
     * @example
     * // Delete one PriceEntry
     * const PriceEntry = await prisma.priceEntry.delete({
     *   where: {
     *     // ... filter to delete one PriceEntry
     *   }
     * })
     * 
     */
    delete<T extends PriceEntryDeleteArgs>(args: SelectSubset<T, PriceEntryDeleteArgs<ExtArgs>>): Prisma__PriceEntryClient<$Result.GetResult<Prisma.$PriceEntryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PriceEntry.
     * @param {PriceEntryUpdateArgs} args - Arguments to update one PriceEntry.
     * @example
     * // Update one PriceEntry
     * const priceEntry = await prisma.priceEntry.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PriceEntryUpdateArgs>(args: SelectSubset<T, PriceEntryUpdateArgs<ExtArgs>>): Prisma__PriceEntryClient<$Result.GetResult<Prisma.$PriceEntryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PriceEntries.
     * @param {PriceEntryDeleteManyArgs} args - Arguments to filter PriceEntries to delete.
     * @example
     * // Delete a few PriceEntries
     * const { count } = await prisma.priceEntry.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PriceEntryDeleteManyArgs>(args?: SelectSubset<T, PriceEntryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PriceEntries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PriceEntryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PriceEntries
     * const priceEntry = await prisma.priceEntry.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PriceEntryUpdateManyArgs>(args: SelectSubset<T, PriceEntryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PriceEntries and returns the data updated in the database.
     * @param {PriceEntryUpdateManyAndReturnArgs} args - Arguments to update many PriceEntries.
     * @example
     * // Update many PriceEntries
     * const priceEntry = await prisma.priceEntry.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PriceEntries and only return the `id`
     * const priceEntryWithIdOnly = await prisma.priceEntry.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PriceEntryUpdateManyAndReturnArgs>(args: SelectSubset<T, PriceEntryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PriceEntryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PriceEntry.
     * @param {PriceEntryUpsertArgs} args - Arguments to update or create a PriceEntry.
     * @example
     * // Update or create a PriceEntry
     * const priceEntry = await prisma.priceEntry.upsert({
     *   create: {
     *     // ... data to create a PriceEntry
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PriceEntry we want to update
     *   }
     * })
     */
    upsert<T extends PriceEntryUpsertArgs>(args: SelectSubset<T, PriceEntryUpsertArgs<ExtArgs>>): Prisma__PriceEntryClient<$Result.GetResult<Prisma.$PriceEntryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PriceEntries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PriceEntryCountArgs} args - Arguments to filter PriceEntries to count.
     * @example
     * // Count the number of PriceEntries
     * const count = await prisma.priceEntry.count({
     *   where: {
     *     // ... the filter for the PriceEntries we want to count
     *   }
     * })
    **/
    count<T extends PriceEntryCountArgs>(
      args?: Subset<T, PriceEntryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PriceEntryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PriceEntry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PriceEntryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PriceEntryAggregateArgs>(args: Subset<T, PriceEntryAggregateArgs>): Prisma.PrismaPromise<GetPriceEntryAggregateType<T>>

    /**
     * Group by PriceEntry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PriceEntryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PriceEntryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PriceEntryGroupByArgs['orderBy'] }
        : { orderBy?: PriceEntryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PriceEntryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPriceEntryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PriceEntry model
   */
  readonly fields: PriceEntryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PriceEntry.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PriceEntryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    card<T extends CardDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CardDefaultArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PriceEntry model
   */
  interface PriceEntryFieldRefs {
    readonly id: FieldRef<"PriceEntry", 'Int'>
    readonly cardId: FieldRef<"PriceEntry", 'String'>
    readonly price: FieldRef<"PriceEntry", 'Float'>
    readonly date: FieldRef<"PriceEntry", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PriceEntry findUnique
   */
  export type PriceEntryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceEntry
     */
    select?: PriceEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceEntry
     */
    omit?: PriceEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceEntryInclude<ExtArgs> | null
    /**
     * Filter, which PriceEntry to fetch.
     */
    where: PriceEntryWhereUniqueInput
  }

  /**
   * PriceEntry findUniqueOrThrow
   */
  export type PriceEntryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceEntry
     */
    select?: PriceEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceEntry
     */
    omit?: PriceEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceEntryInclude<ExtArgs> | null
    /**
     * Filter, which PriceEntry to fetch.
     */
    where: PriceEntryWhereUniqueInput
  }

  /**
   * PriceEntry findFirst
   */
  export type PriceEntryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceEntry
     */
    select?: PriceEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceEntry
     */
    omit?: PriceEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceEntryInclude<ExtArgs> | null
    /**
     * Filter, which PriceEntry to fetch.
     */
    where?: PriceEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PriceEntries to fetch.
     */
    orderBy?: PriceEntryOrderByWithRelationInput | PriceEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PriceEntries.
     */
    cursor?: PriceEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PriceEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PriceEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PriceEntries.
     */
    distinct?: PriceEntryScalarFieldEnum | PriceEntryScalarFieldEnum[]
  }

  /**
   * PriceEntry findFirstOrThrow
   */
  export type PriceEntryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceEntry
     */
    select?: PriceEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceEntry
     */
    omit?: PriceEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceEntryInclude<ExtArgs> | null
    /**
     * Filter, which PriceEntry to fetch.
     */
    where?: PriceEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PriceEntries to fetch.
     */
    orderBy?: PriceEntryOrderByWithRelationInput | PriceEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PriceEntries.
     */
    cursor?: PriceEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PriceEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PriceEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PriceEntries.
     */
    distinct?: PriceEntryScalarFieldEnum | PriceEntryScalarFieldEnum[]
  }

  /**
   * PriceEntry findMany
   */
  export type PriceEntryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceEntry
     */
    select?: PriceEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceEntry
     */
    omit?: PriceEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceEntryInclude<ExtArgs> | null
    /**
     * Filter, which PriceEntries to fetch.
     */
    where?: PriceEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PriceEntries to fetch.
     */
    orderBy?: PriceEntryOrderByWithRelationInput | PriceEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PriceEntries.
     */
    cursor?: PriceEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PriceEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PriceEntries.
     */
    skip?: number
    distinct?: PriceEntryScalarFieldEnum | PriceEntryScalarFieldEnum[]
  }

  /**
   * PriceEntry create
   */
  export type PriceEntryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceEntry
     */
    select?: PriceEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceEntry
     */
    omit?: PriceEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceEntryInclude<ExtArgs> | null
    /**
     * The data needed to create a PriceEntry.
     */
    data: XOR<PriceEntryCreateInput, PriceEntryUncheckedCreateInput>
  }

  /**
   * PriceEntry createMany
   */
  export type PriceEntryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PriceEntries.
     */
    data: PriceEntryCreateManyInput | PriceEntryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PriceEntry createManyAndReturn
   */
  export type PriceEntryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceEntry
     */
    select?: PriceEntrySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PriceEntry
     */
    omit?: PriceEntryOmit<ExtArgs> | null
    /**
     * The data used to create many PriceEntries.
     */
    data: PriceEntryCreateManyInput | PriceEntryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceEntryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PriceEntry update
   */
  export type PriceEntryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceEntry
     */
    select?: PriceEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceEntry
     */
    omit?: PriceEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceEntryInclude<ExtArgs> | null
    /**
     * The data needed to update a PriceEntry.
     */
    data: XOR<PriceEntryUpdateInput, PriceEntryUncheckedUpdateInput>
    /**
     * Choose, which PriceEntry to update.
     */
    where: PriceEntryWhereUniqueInput
  }

  /**
   * PriceEntry updateMany
   */
  export type PriceEntryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PriceEntries.
     */
    data: XOR<PriceEntryUpdateManyMutationInput, PriceEntryUncheckedUpdateManyInput>
    /**
     * Filter which PriceEntries to update
     */
    where?: PriceEntryWhereInput
    /**
     * Limit how many PriceEntries to update.
     */
    limit?: number
  }

  /**
   * PriceEntry updateManyAndReturn
   */
  export type PriceEntryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceEntry
     */
    select?: PriceEntrySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PriceEntry
     */
    omit?: PriceEntryOmit<ExtArgs> | null
    /**
     * The data used to update PriceEntries.
     */
    data: XOR<PriceEntryUpdateManyMutationInput, PriceEntryUncheckedUpdateManyInput>
    /**
     * Filter which PriceEntries to update
     */
    where?: PriceEntryWhereInput
    /**
     * Limit how many PriceEntries to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceEntryIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * PriceEntry upsert
   */
  export type PriceEntryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceEntry
     */
    select?: PriceEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceEntry
     */
    omit?: PriceEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceEntryInclude<ExtArgs> | null
    /**
     * The filter to search for the PriceEntry to update in case it exists.
     */
    where: PriceEntryWhereUniqueInput
    /**
     * In case the PriceEntry found by the `where` argument doesn't exist, create a new PriceEntry with this data.
     */
    create: XOR<PriceEntryCreateInput, PriceEntryUncheckedCreateInput>
    /**
     * In case the PriceEntry was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PriceEntryUpdateInput, PriceEntryUncheckedUpdateInput>
  }

  /**
   * PriceEntry delete
   */
  export type PriceEntryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceEntry
     */
    select?: PriceEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceEntry
     */
    omit?: PriceEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceEntryInclude<ExtArgs> | null
    /**
     * Filter which PriceEntry to delete.
     */
    where: PriceEntryWhereUniqueInput
  }

  /**
   * PriceEntry deleteMany
   */
  export type PriceEntryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PriceEntries to delete
     */
    where?: PriceEntryWhereInput
    /**
     * Limit how many PriceEntries to delete.
     */
    limit?: number
  }

  /**
   * PriceEntry without action
   */
  export type PriceEntryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceEntry
     */
    select?: PriceEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceEntry
     */
    omit?: PriceEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceEntryInclude<ExtArgs> | null
  }


  /**
   * Model Sealed
   */

  export type AggregateSealed = {
    _count: SealedCountAggregateOutputType | null
    _min: SealedMinAggregateOutputType | null
    _max: SealedMaxAggregateOutputType | null
  }

  export type SealedMinAggregateOutputType = {
    id: string | null
    product: string | null
    createdAt: Date | null
  }

  export type SealedMaxAggregateOutputType = {
    id: string | null
    product: string | null
    createdAt: Date | null
  }

  export type SealedCountAggregateOutputType = {
    id: number
    product: number
    createdAt: number
    _all: number
  }


  export type SealedMinAggregateInputType = {
    id?: true
    product?: true
    createdAt?: true
  }

  export type SealedMaxAggregateInputType = {
    id?: true
    product?: true
    createdAt?: true
  }

  export type SealedCountAggregateInputType = {
    id?: true
    product?: true
    createdAt?: true
    _all?: true
  }

  export type SealedAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sealed to aggregate.
     */
    where?: SealedWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sealeds to fetch.
     */
    orderBy?: SealedOrderByWithRelationInput | SealedOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SealedWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sealeds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sealeds.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Sealeds
    **/
    _count?: true | SealedCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SealedMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SealedMaxAggregateInputType
  }

  export type GetSealedAggregateType<T extends SealedAggregateArgs> = {
        [P in keyof T & keyof AggregateSealed]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSealed[P]>
      : GetScalarType<T[P], AggregateSealed[P]>
  }




  export type SealedGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SealedWhereInput
    orderBy?: SealedOrderByWithAggregationInput | SealedOrderByWithAggregationInput[]
    by: SealedScalarFieldEnum[] | SealedScalarFieldEnum
    having?: SealedScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SealedCountAggregateInputType | true
    _min?: SealedMinAggregateInputType
    _max?: SealedMaxAggregateInputType
  }

  export type SealedGroupByOutputType = {
    id: string
    product: string
    createdAt: Date
    _count: SealedCountAggregateOutputType | null
    _min: SealedMinAggregateOutputType | null
    _max: SealedMaxAggregateOutputType | null
  }

  type GetSealedGroupByPayload<T extends SealedGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SealedGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SealedGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SealedGroupByOutputType[P]>
            : GetScalarType<T[P], SealedGroupByOutputType[P]>
        }
      >
    >


  export type SealedSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    product?: boolean
    createdAt?: boolean
    prices?: boolean | Sealed$pricesArgs<ExtArgs>
    _count?: boolean | SealedCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sealed"]>

  export type SealedSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    product?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["sealed"]>

  export type SealedSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    product?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["sealed"]>

  export type SealedSelectScalar = {
    id?: boolean
    product?: boolean
    createdAt?: boolean
  }

  export type SealedOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "product" | "createdAt", ExtArgs["result"]["sealed"]>
  export type SealedInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    prices?: boolean | Sealed$pricesArgs<ExtArgs>
    _count?: boolean | SealedCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SealedIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type SealedIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $SealedPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Sealed"
    objects: {
      prices: Prisma.$SealedPriceEntryPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      product: string
      createdAt: Date
    }, ExtArgs["result"]["sealed"]>
    composites: {}
  }

  type SealedGetPayload<S extends boolean | null | undefined | SealedDefaultArgs> = $Result.GetResult<Prisma.$SealedPayload, S>

  type SealedCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SealedFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SealedCountAggregateInputType | true
    }

  export interface SealedDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Sealed'], meta: { name: 'Sealed' } }
    /**
     * Find zero or one Sealed that matches the filter.
     * @param {SealedFindUniqueArgs} args - Arguments to find a Sealed
     * @example
     * // Get one Sealed
     * const sealed = await prisma.sealed.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SealedFindUniqueArgs>(args: SelectSubset<T, SealedFindUniqueArgs<ExtArgs>>): Prisma__SealedClient<$Result.GetResult<Prisma.$SealedPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Sealed that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SealedFindUniqueOrThrowArgs} args - Arguments to find a Sealed
     * @example
     * // Get one Sealed
     * const sealed = await prisma.sealed.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SealedFindUniqueOrThrowArgs>(args: SelectSubset<T, SealedFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SealedClient<$Result.GetResult<Prisma.$SealedPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Sealed that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SealedFindFirstArgs} args - Arguments to find a Sealed
     * @example
     * // Get one Sealed
     * const sealed = await prisma.sealed.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SealedFindFirstArgs>(args?: SelectSubset<T, SealedFindFirstArgs<ExtArgs>>): Prisma__SealedClient<$Result.GetResult<Prisma.$SealedPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Sealed that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SealedFindFirstOrThrowArgs} args - Arguments to find a Sealed
     * @example
     * // Get one Sealed
     * const sealed = await prisma.sealed.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SealedFindFirstOrThrowArgs>(args?: SelectSubset<T, SealedFindFirstOrThrowArgs<ExtArgs>>): Prisma__SealedClient<$Result.GetResult<Prisma.$SealedPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Sealeds that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SealedFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Sealeds
     * const sealeds = await prisma.sealed.findMany()
     * 
     * // Get first 10 Sealeds
     * const sealeds = await prisma.sealed.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sealedWithIdOnly = await prisma.sealed.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SealedFindManyArgs>(args?: SelectSubset<T, SealedFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SealedPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Sealed.
     * @param {SealedCreateArgs} args - Arguments to create a Sealed.
     * @example
     * // Create one Sealed
     * const Sealed = await prisma.sealed.create({
     *   data: {
     *     // ... data to create a Sealed
     *   }
     * })
     * 
     */
    create<T extends SealedCreateArgs>(args: SelectSubset<T, SealedCreateArgs<ExtArgs>>): Prisma__SealedClient<$Result.GetResult<Prisma.$SealedPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Sealeds.
     * @param {SealedCreateManyArgs} args - Arguments to create many Sealeds.
     * @example
     * // Create many Sealeds
     * const sealed = await prisma.sealed.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SealedCreateManyArgs>(args?: SelectSubset<T, SealedCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Sealeds and returns the data saved in the database.
     * @param {SealedCreateManyAndReturnArgs} args - Arguments to create many Sealeds.
     * @example
     * // Create many Sealeds
     * const sealed = await prisma.sealed.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Sealeds and only return the `id`
     * const sealedWithIdOnly = await prisma.sealed.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SealedCreateManyAndReturnArgs>(args?: SelectSubset<T, SealedCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SealedPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Sealed.
     * @param {SealedDeleteArgs} args - Arguments to delete one Sealed.
     * @example
     * // Delete one Sealed
     * const Sealed = await prisma.sealed.delete({
     *   where: {
     *     // ... filter to delete one Sealed
     *   }
     * })
     * 
     */
    delete<T extends SealedDeleteArgs>(args: SelectSubset<T, SealedDeleteArgs<ExtArgs>>): Prisma__SealedClient<$Result.GetResult<Prisma.$SealedPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Sealed.
     * @param {SealedUpdateArgs} args - Arguments to update one Sealed.
     * @example
     * // Update one Sealed
     * const sealed = await prisma.sealed.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SealedUpdateArgs>(args: SelectSubset<T, SealedUpdateArgs<ExtArgs>>): Prisma__SealedClient<$Result.GetResult<Prisma.$SealedPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Sealeds.
     * @param {SealedDeleteManyArgs} args - Arguments to filter Sealeds to delete.
     * @example
     * // Delete a few Sealeds
     * const { count } = await prisma.sealed.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SealedDeleteManyArgs>(args?: SelectSubset<T, SealedDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sealeds.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SealedUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Sealeds
     * const sealed = await prisma.sealed.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SealedUpdateManyArgs>(args: SelectSubset<T, SealedUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sealeds and returns the data updated in the database.
     * @param {SealedUpdateManyAndReturnArgs} args - Arguments to update many Sealeds.
     * @example
     * // Update many Sealeds
     * const sealed = await prisma.sealed.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Sealeds and only return the `id`
     * const sealedWithIdOnly = await prisma.sealed.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SealedUpdateManyAndReturnArgs>(args: SelectSubset<T, SealedUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SealedPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Sealed.
     * @param {SealedUpsertArgs} args - Arguments to update or create a Sealed.
     * @example
     * // Update or create a Sealed
     * const sealed = await prisma.sealed.upsert({
     *   create: {
     *     // ... data to create a Sealed
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Sealed we want to update
     *   }
     * })
     */
    upsert<T extends SealedUpsertArgs>(args: SelectSubset<T, SealedUpsertArgs<ExtArgs>>): Prisma__SealedClient<$Result.GetResult<Prisma.$SealedPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Sealeds.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SealedCountArgs} args - Arguments to filter Sealeds to count.
     * @example
     * // Count the number of Sealeds
     * const count = await prisma.sealed.count({
     *   where: {
     *     // ... the filter for the Sealeds we want to count
     *   }
     * })
    **/
    count<T extends SealedCountArgs>(
      args?: Subset<T, SealedCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SealedCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Sealed.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SealedAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SealedAggregateArgs>(args: Subset<T, SealedAggregateArgs>): Prisma.PrismaPromise<GetSealedAggregateType<T>>

    /**
     * Group by Sealed.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SealedGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SealedGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SealedGroupByArgs['orderBy'] }
        : { orderBy?: SealedGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SealedGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSealedGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Sealed model
   */
  readonly fields: SealedFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Sealed.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SealedClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    prices<T extends Sealed$pricesArgs<ExtArgs> = {}>(args?: Subset<T, Sealed$pricesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SealedPriceEntryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Sealed model
   */
  interface SealedFieldRefs {
    readonly id: FieldRef<"Sealed", 'String'>
    readonly product: FieldRef<"Sealed", 'String'>
    readonly createdAt: FieldRef<"Sealed", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Sealed findUnique
   */
  export type SealedFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sealed
     */
    select?: SealedSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sealed
     */
    omit?: SealedOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SealedInclude<ExtArgs> | null
    /**
     * Filter, which Sealed to fetch.
     */
    where: SealedWhereUniqueInput
  }

  /**
   * Sealed findUniqueOrThrow
   */
  export type SealedFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sealed
     */
    select?: SealedSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sealed
     */
    omit?: SealedOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SealedInclude<ExtArgs> | null
    /**
     * Filter, which Sealed to fetch.
     */
    where: SealedWhereUniqueInput
  }

  /**
   * Sealed findFirst
   */
  export type SealedFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sealed
     */
    select?: SealedSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sealed
     */
    omit?: SealedOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SealedInclude<ExtArgs> | null
    /**
     * Filter, which Sealed to fetch.
     */
    where?: SealedWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sealeds to fetch.
     */
    orderBy?: SealedOrderByWithRelationInput | SealedOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sealeds.
     */
    cursor?: SealedWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sealeds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sealeds.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sealeds.
     */
    distinct?: SealedScalarFieldEnum | SealedScalarFieldEnum[]
  }

  /**
   * Sealed findFirstOrThrow
   */
  export type SealedFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sealed
     */
    select?: SealedSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sealed
     */
    omit?: SealedOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SealedInclude<ExtArgs> | null
    /**
     * Filter, which Sealed to fetch.
     */
    where?: SealedWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sealeds to fetch.
     */
    orderBy?: SealedOrderByWithRelationInput | SealedOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sealeds.
     */
    cursor?: SealedWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sealeds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sealeds.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sealeds.
     */
    distinct?: SealedScalarFieldEnum | SealedScalarFieldEnum[]
  }

  /**
   * Sealed findMany
   */
  export type SealedFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sealed
     */
    select?: SealedSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sealed
     */
    omit?: SealedOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SealedInclude<ExtArgs> | null
    /**
     * Filter, which Sealeds to fetch.
     */
    where?: SealedWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sealeds to fetch.
     */
    orderBy?: SealedOrderByWithRelationInput | SealedOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Sealeds.
     */
    cursor?: SealedWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sealeds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sealeds.
     */
    skip?: number
    distinct?: SealedScalarFieldEnum | SealedScalarFieldEnum[]
  }

  /**
   * Sealed create
   */
  export type SealedCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sealed
     */
    select?: SealedSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sealed
     */
    omit?: SealedOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SealedInclude<ExtArgs> | null
    /**
     * The data needed to create a Sealed.
     */
    data: XOR<SealedCreateInput, SealedUncheckedCreateInput>
  }

  /**
   * Sealed createMany
   */
  export type SealedCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Sealeds.
     */
    data: SealedCreateManyInput | SealedCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Sealed createManyAndReturn
   */
  export type SealedCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sealed
     */
    select?: SealedSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Sealed
     */
    omit?: SealedOmit<ExtArgs> | null
    /**
     * The data used to create many Sealeds.
     */
    data: SealedCreateManyInput | SealedCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Sealed update
   */
  export type SealedUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sealed
     */
    select?: SealedSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sealed
     */
    omit?: SealedOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SealedInclude<ExtArgs> | null
    /**
     * The data needed to update a Sealed.
     */
    data: XOR<SealedUpdateInput, SealedUncheckedUpdateInput>
    /**
     * Choose, which Sealed to update.
     */
    where: SealedWhereUniqueInput
  }

  /**
   * Sealed updateMany
   */
  export type SealedUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Sealeds.
     */
    data: XOR<SealedUpdateManyMutationInput, SealedUncheckedUpdateManyInput>
    /**
     * Filter which Sealeds to update
     */
    where?: SealedWhereInput
    /**
     * Limit how many Sealeds to update.
     */
    limit?: number
  }

  /**
   * Sealed updateManyAndReturn
   */
  export type SealedUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sealed
     */
    select?: SealedSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Sealed
     */
    omit?: SealedOmit<ExtArgs> | null
    /**
     * The data used to update Sealeds.
     */
    data: XOR<SealedUpdateManyMutationInput, SealedUncheckedUpdateManyInput>
    /**
     * Filter which Sealeds to update
     */
    where?: SealedWhereInput
    /**
     * Limit how many Sealeds to update.
     */
    limit?: number
  }

  /**
   * Sealed upsert
   */
  export type SealedUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sealed
     */
    select?: SealedSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sealed
     */
    omit?: SealedOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SealedInclude<ExtArgs> | null
    /**
     * The filter to search for the Sealed to update in case it exists.
     */
    where: SealedWhereUniqueInput
    /**
     * In case the Sealed found by the `where` argument doesn't exist, create a new Sealed with this data.
     */
    create: XOR<SealedCreateInput, SealedUncheckedCreateInput>
    /**
     * In case the Sealed was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SealedUpdateInput, SealedUncheckedUpdateInput>
  }

  /**
   * Sealed delete
   */
  export type SealedDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sealed
     */
    select?: SealedSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sealed
     */
    omit?: SealedOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SealedInclude<ExtArgs> | null
    /**
     * Filter which Sealed to delete.
     */
    where: SealedWhereUniqueInput
  }

  /**
   * Sealed deleteMany
   */
  export type SealedDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sealeds to delete
     */
    where?: SealedWhereInput
    /**
     * Limit how many Sealeds to delete.
     */
    limit?: number
  }

  /**
   * Sealed.prices
   */
  export type Sealed$pricesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SealedPriceEntry
     */
    select?: SealedPriceEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the SealedPriceEntry
     */
    omit?: SealedPriceEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SealedPriceEntryInclude<ExtArgs> | null
    where?: SealedPriceEntryWhereInput
    orderBy?: SealedPriceEntryOrderByWithRelationInput | SealedPriceEntryOrderByWithRelationInput[]
    cursor?: SealedPriceEntryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SealedPriceEntryScalarFieldEnum | SealedPriceEntryScalarFieldEnum[]
  }

  /**
   * Sealed without action
   */
  export type SealedDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sealed
     */
    select?: SealedSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sealed
     */
    omit?: SealedOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SealedInclude<ExtArgs> | null
  }


  /**
   * Model SealedPriceEntry
   */

  export type AggregateSealedPriceEntry = {
    _count: SealedPriceEntryCountAggregateOutputType | null
    _avg: SealedPriceEntryAvgAggregateOutputType | null
    _sum: SealedPriceEntrySumAggregateOutputType | null
    _min: SealedPriceEntryMinAggregateOutputType | null
    _max: SealedPriceEntryMaxAggregateOutputType | null
  }

  export type SealedPriceEntryAvgAggregateOutputType = {
    price: number | null
  }

  export type SealedPriceEntrySumAggregateOutputType = {
    price: number | null
  }

  export type SealedPriceEntryMinAggregateOutputType = {
    id: string | null
    sealedId: string | null
    price: number | null
    title: string | null
    url: string | null
    soldAt: Date | null
  }

  export type SealedPriceEntryMaxAggregateOutputType = {
    id: string | null
    sealedId: string | null
    price: number | null
    title: string | null
    url: string | null
    soldAt: Date | null
  }

  export type SealedPriceEntryCountAggregateOutputType = {
    id: number
    sealedId: number
    price: number
    title: number
    url: number
    soldAt: number
    _all: number
  }


  export type SealedPriceEntryAvgAggregateInputType = {
    price?: true
  }

  export type SealedPriceEntrySumAggregateInputType = {
    price?: true
  }

  export type SealedPriceEntryMinAggregateInputType = {
    id?: true
    sealedId?: true
    price?: true
    title?: true
    url?: true
    soldAt?: true
  }

  export type SealedPriceEntryMaxAggregateInputType = {
    id?: true
    sealedId?: true
    price?: true
    title?: true
    url?: true
    soldAt?: true
  }

  export type SealedPriceEntryCountAggregateInputType = {
    id?: true
    sealedId?: true
    price?: true
    title?: true
    url?: true
    soldAt?: true
    _all?: true
  }

  export type SealedPriceEntryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SealedPriceEntry to aggregate.
     */
    where?: SealedPriceEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SealedPriceEntries to fetch.
     */
    orderBy?: SealedPriceEntryOrderByWithRelationInput | SealedPriceEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SealedPriceEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SealedPriceEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SealedPriceEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SealedPriceEntries
    **/
    _count?: true | SealedPriceEntryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SealedPriceEntryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SealedPriceEntrySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SealedPriceEntryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SealedPriceEntryMaxAggregateInputType
  }

  export type GetSealedPriceEntryAggregateType<T extends SealedPriceEntryAggregateArgs> = {
        [P in keyof T & keyof AggregateSealedPriceEntry]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSealedPriceEntry[P]>
      : GetScalarType<T[P], AggregateSealedPriceEntry[P]>
  }




  export type SealedPriceEntryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SealedPriceEntryWhereInput
    orderBy?: SealedPriceEntryOrderByWithAggregationInput | SealedPriceEntryOrderByWithAggregationInput[]
    by: SealedPriceEntryScalarFieldEnum[] | SealedPriceEntryScalarFieldEnum
    having?: SealedPriceEntryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SealedPriceEntryCountAggregateInputType | true
    _avg?: SealedPriceEntryAvgAggregateInputType
    _sum?: SealedPriceEntrySumAggregateInputType
    _min?: SealedPriceEntryMinAggregateInputType
    _max?: SealedPriceEntryMaxAggregateInputType
  }

  export type SealedPriceEntryGroupByOutputType = {
    id: string
    sealedId: string
    price: number
    title: string
    url: string
    soldAt: Date
    _count: SealedPriceEntryCountAggregateOutputType | null
    _avg: SealedPriceEntryAvgAggregateOutputType | null
    _sum: SealedPriceEntrySumAggregateOutputType | null
    _min: SealedPriceEntryMinAggregateOutputType | null
    _max: SealedPriceEntryMaxAggregateOutputType | null
  }

  type GetSealedPriceEntryGroupByPayload<T extends SealedPriceEntryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SealedPriceEntryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SealedPriceEntryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SealedPriceEntryGroupByOutputType[P]>
            : GetScalarType<T[P], SealedPriceEntryGroupByOutputType[P]>
        }
      >
    >


  export type SealedPriceEntrySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sealedId?: boolean
    price?: boolean
    title?: boolean
    url?: boolean
    soldAt?: boolean
    sealed?: boolean | SealedDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sealedPriceEntry"]>

  export type SealedPriceEntrySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sealedId?: boolean
    price?: boolean
    title?: boolean
    url?: boolean
    soldAt?: boolean
    sealed?: boolean | SealedDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sealedPriceEntry"]>

  export type SealedPriceEntrySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sealedId?: boolean
    price?: boolean
    title?: boolean
    url?: boolean
    soldAt?: boolean
    sealed?: boolean | SealedDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sealedPriceEntry"]>

  export type SealedPriceEntrySelectScalar = {
    id?: boolean
    sealedId?: boolean
    price?: boolean
    title?: boolean
    url?: boolean
    soldAt?: boolean
  }

  export type SealedPriceEntryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "sealedId" | "price" | "title" | "url" | "soldAt", ExtArgs["result"]["sealedPriceEntry"]>
  export type SealedPriceEntryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sealed?: boolean | SealedDefaultArgs<ExtArgs>
  }
  export type SealedPriceEntryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sealed?: boolean | SealedDefaultArgs<ExtArgs>
  }
  export type SealedPriceEntryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sealed?: boolean | SealedDefaultArgs<ExtArgs>
  }

  export type $SealedPriceEntryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SealedPriceEntry"
    objects: {
      sealed: Prisma.$SealedPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sealedId: string
      price: number
      title: string
      url: string
      soldAt: Date
    }, ExtArgs["result"]["sealedPriceEntry"]>
    composites: {}
  }

  type SealedPriceEntryGetPayload<S extends boolean | null | undefined | SealedPriceEntryDefaultArgs> = $Result.GetResult<Prisma.$SealedPriceEntryPayload, S>

  type SealedPriceEntryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SealedPriceEntryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SealedPriceEntryCountAggregateInputType | true
    }

  export interface SealedPriceEntryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SealedPriceEntry'], meta: { name: 'SealedPriceEntry' } }
    /**
     * Find zero or one SealedPriceEntry that matches the filter.
     * @param {SealedPriceEntryFindUniqueArgs} args - Arguments to find a SealedPriceEntry
     * @example
     * // Get one SealedPriceEntry
     * const sealedPriceEntry = await prisma.sealedPriceEntry.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SealedPriceEntryFindUniqueArgs>(args: SelectSubset<T, SealedPriceEntryFindUniqueArgs<ExtArgs>>): Prisma__SealedPriceEntryClient<$Result.GetResult<Prisma.$SealedPriceEntryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SealedPriceEntry that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SealedPriceEntryFindUniqueOrThrowArgs} args - Arguments to find a SealedPriceEntry
     * @example
     * // Get one SealedPriceEntry
     * const sealedPriceEntry = await prisma.sealedPriceEntry.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SealedPriceEntryFindUniqueOrThrowArgs>(args: SelectSubset<T, SealedPriceEntryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SealedPriceEntryClient<$Result.GetResult<Prisma.$SealedPriceEntryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SealedPriceEntry that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SealedPriceEntryFindFirstArgs} args - Arguments to find a SealedPriceEntry
     * @example
     * // Get one SealedPriceEntry
     * const sealedPriceEntry = await prisma.sealedPriceEntry.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SealedPriceEntryFindFirstArgs>(args?: SelectSubset<T, SealedPriceEntryFindFirstArgs<ExtArgs>>): Prisma__SealedPriceEntryClient<$Result.GetResult<Prisma.$SealedPriceEntryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SealedPriceEntry that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SealedPriceEntryFindFirstOrThrowArgs} args - Arguments to find a SealedPriceEntry
     * @example
     * // Get one SealedPriceEntry
     * const sealedPriceEntry = await prisma.sealedPriceEntry.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SealedPriceEntryFindFirstOrThrowArgs>(args?: SelectSubset<T, SealedPriceEntryFindFirstOrThrowArgs<ExtArgs>>): Prisma__SealedPriceEntryClient<$Result.GetResult<Prisma.$SealedPriceEntryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SealedPriceEntries that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SealedPriceEntryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SealedPriceEntries
     * const sealedPriceEntries = await prisma.sealedPriceEntry.findMany()
     * 
     * // Get first 10 SealedPriceEntries
     * const sealedPriceEntries = await prisma.sealedPriceEntry.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sealedPriceEntryWithIdOnly = await prisma.sealedPriceEntry.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SealedPriceEntryFindManyArgs>(args?: SelectSubset<T, SealedPriceEntryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SealedPriceEntryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SealedPriceEntry.
     * @param {SealedPriceEntryCreateArgs} args - Arguments to create a SealedPriceEntry.
     * @example
     * // Create one SealedPriceEntry
     * const SealedPriceEntry = await prisma.sealedPriceEntry.create({
     *   data: {
     *     // ... data to create a SealedPriceEntry
     *   }
     * })
     * 
     */
    create<T extends SealedPriceEntryCreateArgs>(args: SelectSubset<T, SealedPriceEntryCreateArgs<ExtArgs>>): Prisma__SealedPriceEntryClient<$Result.GetResult<Prisma.$SealedPriceEntryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SealedPriceEntries.
     * @param {SealedPriceEntryCreateManyArgs} args - Arguments to create many SealedPriceEntries.
     * @example
     * // Create many SealedPriceEntries
     * const sealedPriceEntry = await prisma.sealedPriceEntry.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SealedPriceEntryCreateManyArgs>(args?: SelectSubset<T, SealedPriceEntryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SealedPriceEntries and returns the data saved in the database.
     * @param {SealedPriceEntryCreateManyAndReturnArgs} args - Arguments to create many SealedPriceEntries.
     * @example
     * // Create many SealedPriceEntries
     * const sealedPriceEntry = await prisma.sealedPriceEntry.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SealedPriceEntries and only return the `id`
     * const sealedPriceEntryWithIdOnly = await prisma.sealedPriceEntry.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SealedPriceEntryCreateManyAndReturnArgs>(args?: SelectSubset<T, SealedPriceEntryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SealedPriceEntryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SealedPriceEntry.
     * @param {SealedPriceEntryDeleteArgs} args - Arguments to delete one SealedPriceEntry.
     * @example
     * // Delete one SealedPriceEntry
     * const SealedPriceEntry = await prisma.sealedPriceEntry.delete({
     *   where: {
     *     // ... filter to delete one SealedPriceEntry
     *   }
     * })
     * 
     */
    delete<T extends SealedPriceEntryDeleteArgs>(args: SelectSubset<T, SealedPriceEntryDeleteArgs<ExtArgs>>): Prisma__SealedPriceEntryClient<$Result.GetResult<Prisma.$SealedPriceEntryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SealedPriceEntry.
     * @param {SealedPriceEntryUpdateArgs} args - Arguments to update one SealedPriceEntry.
     * @example
     * // Update one SealedPriceEntry
     * const sealedPriceEntry = await prisma.sealedPriceEntry.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SealedPriceEntryUpdateArgs>(args: SelectSubset<T, SealedPriceEntryUpdateArgs<ExtArgs>>): Prisma__SealedPriceEntryClient<$Result.GetResult<Prisma.$SealedPriceEntryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SealedPriceEntries.
     * @param {SealedPriceEntryDeleteManyArgs} args - Arguments to filter SealedPriceEntries to delete.
     * @example
     * // Delete a few SealedPriceEntries
     * const { count } = await prisma.sealedPriceEntry.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SealedPriceEntryDeleteManyArgs>(args?: SelectSubset<T, SealedPriceEntryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SealedPriceEntries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SealedPriceEntryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SealedPriceEntries
     * const sealedPriceEntry = await prisma.sealedPriceEntry.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SealedPriceEntryUpdateManyArgs>(args: SelectSubset<T, SealedPriceEntryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SealedPriceEntries and returns the data updated in the database.
     * @param {SealedPriceEntryUpdateManyAndReturnArgs} args - Arguments to update many SealedPriceEntries.
     * @example
     * // Update many SealedPriceEntries
     * const sealedPriceEntry = await prisma.sealedPriceEntry.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SealedPriceEntries and only return the `id`
     * const sealedPriceEntryWithIdOnly = await prisma.sealedPriceEntry.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SealedPriceEntryUpdateManyAndReturnArgs>(args: SelectSubset<T, SealedPriceEntryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SealedPriceEntryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SealedPriceEntry.
     * @param {SealedPriceEntryUpsertArgs} args - Arguments to update or create a SealedPriceEntry.
     * @example
     * // Update or create a SealedPriceEntry
     * const sealedPriceEntry = await prisma.sealedPriceEntry.upsert({
     *   create: {
     *     // ... data to create a SealedPriceEntry
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SealedPriceEntry we want to update
     *   }
     * })
     */
    upsert<T extends SealedPriceEntryUpsertArgs>(args: SelectSubset<T, SealedPriceEntryUpsertArgs<ExtArgs>>): Prisma__SealedPriceEntryClient<$Result.GetResult<Prisma.$SealedPriceEntryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SealedPriceEntries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SealedPriceEntryCountArgs} args - Arguments to filter SealedPriceEntries to count.
     * @example
     * // Count the number of SealedPriceEntries
     * const count = await prisma.sealedPriceEntry.count({
     *   where: {
     *     // ... the filter for the SealedPriceEntries we want to count
     *   }
     * })
    **/
    count<T extends SealedPriceEntryCountArgs>(
      args?: Subset<T, SealedPriceEntryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SealedPriceEntryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SealedPriceEntry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SealedPriceEntryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SealedPriceEntryAggregateArgs>(args: Subset<T, SealedPriceEntryAggregateArgs>): Prisma.PrismaPromise<GetSealedPriceEntryAggregateType<T>>

    /**
     * Group by SealedPriceEntry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SealedPriceEntryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SealedPriceEntryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SealedPriceEntryGroupByArgs['orderBy'] }
        : { orderBy?: SealedPriceEntryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SealedPriceEntryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSealedPriceEntryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SealedPriceEntry model
   */
  readonly fields: SealedPriceEntryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SealedPriceEntry.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SealedPriceEntryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    sealed<T extends SealedDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SealedDefaultArgs<ExtArgs>>): Prisma__SealedClient<$Result.GetResult<Prisma.$SealedPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SealedPriceEntry model
   */
  interface SealedPriceEntryFieldRefs {
    readonly id: FieldRef<"SealedPriceEntry", 'String'>
    readonly sealedId: FieldRef<"SealedPriceEntry", 'String'>
    readonly price: FieldRef<"SealedPriceEntry", 'Float'>
    readonly title: FieldRef<"SealedPriceEntry", 'String'>
    readonly url: FieldRef<"SealedPriceEntry", 'String'>
    readonly soldAt: FieldRef<"SealedPriceEntry", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SealedPriceEntry findUnique
   */
  export type SealedPriceEntryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SealedPriceEntry
     */
    select?: SealedPriceEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the SealedPriceEntry
     */
    omit?: SealedPriceEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SealedPriceEntryInclude<ExtArgs> | null
    /**
     * Filter, which SealedPriceEntry to fetch.
     */
    where: SealedPriceEntryWhereUniqueInput
  }

  /**
   * SealedPriceEntry findUniqueOrThrow
   */
  export type SealedPriceEntryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SealedPriceEntry
     */
    select?: SealedPriceEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the SealedPriceEntry
     */
    omit?: SealedPriceEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SealedPriceEntryInclude<ExtArgs> | null
    /**
     * Filter, which SealedPriceEntry to fetch.
     */
    where: SealedPriceEntryWhereUniqueInput
  }

  /**
   * SealedPriceEntry findFirst
   */
  export type SealedPriceEntryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SealedPriceEntry
     */
    select?: SealedPriceEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the SealedPriceEntry
     */
    omit?: SealedPriceEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SealedPriceEntryInclude<ExtArgs> | null
    /**
     * Filter, which SealedPriceEntry to fetch.
     */
    where?: SealedPriceEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SealedPriceEntries to fetch.
     */
    orderBy?: SealedPriceEntryOrderByWithRelationInput | SealedPriceEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SealedPriceEntries.
     */
    cursor?: SealedPriceEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SealedPriceEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SealedPriceEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SealedPriceEntries.
     */
    distinct?: SealedPriceEntryScalarFieldEnum | SealedPriceEntryScalarFieldEnum[]
  }

  /**
   * SealedPriceEntry findFirstOrThrow
   */
  export type SealedPriceEntryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SealedPriceEntry
     */
    select?: SealedPriceEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the SealedPriceEntry
     */
    omit?: SealedPriceEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SealedPriceEntryInclude<ExtArgs> | null
    /**
     * Filter, which SealedPriceEntry to fetch.
     */
    where?: SealedPriceEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SealedPriceEntries to fetch.
     */
    orderBy?: SealedPriceEntryOrderByWithRelationInput | SealedPriceEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SealedPriceEntries.
     */
    cursor?: SealedPriceEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SealedPriceEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SealedPriceEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SealedPriceEntries.
     */
    distinct?: SealedPriceEntryScalarFieldEnum | SealedPriceEntryScalarFieldEnum[]
  }

  /**
   * SealedPriceEntry findMany
   */
  export type SealedPriceEntryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SealedPriceEntry
     */
    select?: SealedPriceEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the SealedPriceEntry
     */
    omit?: SealedPriceEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SealedPriceEntryInclude<ExtArgs> | null
    /**
     * Filter, which SealedPriceEntries to fetch.
     */
    where?: SealedPriceEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SealedPriceEntries to fetch.
     */
    orderBy?: SealedPriceEntryOrderByWithRelationInput | SealedPriceEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SealedPriceEntries.
     */
    cursor?: SealedPriceEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SealedPriceEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SealedPriceEntries.
     */
    skip?: number
    distinct?: SealedPriceEntryScalarFieldEnum | SealedPriceEntryScalarFieldEnum[]
  }

  /**
   * SealedPriceEntry create
   */
  export type SealedPriceEntryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SealedPriceEntry
     */
    select?: SealedPriceEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the SealedPriceEntry
     */
    omit?: SealedPriceEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SealedPriceEntryInclude<ExtArgs> | null
    /**
     * The data needed to create a SealedPriceEntry.
     */
    data: XOR<SealedPriceEntryCreateInput, SealedPriceEntryUncheckedCreateInput>
  }

  /**
   * SealedPriceEntry createMany
   */
  export type SealedPriceEntryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SealedPriceEntries.
     */
    data: SealedPriceEntryCreateManyInput | SealedPriceEntryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SealedPriceEntry createManyAndReturn
   */
  export type SealedPriceEntryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SealedPriceEntry
     */
    select?: SealedPriceEntrySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SealedPriceEntry
     */
    omit?: SealedPriceEntryOmit<ExtArgs> | null
    /**
     * The data used to create many SealedPriceEntries.
     */
    data: SealedPriceEntryCreateManyInput | SealedPriceEntryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SealedPriceEntryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SealedPriceEntry update
   */
  export type SealedPriceEntryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SealedPriceEntry
     */
    select?: SealedPriceEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the SealedPriceEntry
     */
    omit?: SealedPriceEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SealedPriceEntryInclude<ExtArgs> | null
    /**
     * The data needed to update a SealedPriceEntry.
     */
    data: XOR<SealedPriceEntryUpdateInput, SealedPriceEntryUncheckedUpdateInput>
    /**
     * Choose, which SealedPriceEntry to update.
     */
    where: SealedPriceEntryWhereUniqueInput
  }

  /**
   * SealedPriceEntry updateMany
   */
  export type SealedPriceEntryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SealedPriceEntries.
     */
    data: XOR<SealedPriceEntryUpdateManyMutationInput, SealedPriceEntryUncheckedUpdateManyInput>
    /**
     * Filter which SealedPriceEntries to update
     */
    where?: SealedPriceEntryWhereInput
    /**
     * Limit how many SealedPriceEntries to update.
     */
    limit?: number
  }

  /**
   * SealedPriceEntry updateManyAndReturn
   */
  export type SealedPriceEntryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SealedPriceEntry
     */
    select?: SealedPriceEntrySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SealedPriceEntry
     */
    omit?: SealedPriceEntryOmit<ExtArgs> | null
    /**
     * The data used to update SealedPriceEntries.
     */
    data: XOR<SealedPriceEntryUpdateManyMutationInput, SealedPriceEntryUncheckedUpdateManyInput>
    /**
     * Filter which SealedPriceEntries to update
     */
    where?: SealedPriceEntryWhereInput
    /**
     * Limit how many SealedPriceEntries to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SealedPriceEntryIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * SealedPriceEntry upsert
   */
  export type SealedPriceEntryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SealedPriceEntry
     */
    select?: SealedPriceEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the SealedPriceEntry
     */
    omit?: SealedPriceEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SealedPriceEntryInclude<ExtArgs> | null
    /**
     * The filter to search for the SealedPriceEntry to update in case it exists.
     */
    where: SealedPriceEntryWhereUniqueInput
    /**
     * In case the SealedPriceEntry found by the `where` argument doesn't exist, create a new SealedPriceEntry with this data.
     */
    create: XOR<SealedPriceEntryCreateInput, SealedPriceEntryUncheckedCreateInput>
    /**
     * In case the SealedPriceEntry was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SealedPriceEntryUpdateInput, SealedPriceEntryUncheckedUpdateInput>
  }

  /**
   * SealedPriceEntry delete
   */
  export type SealedPriceEntryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SealedPriceEntry
     */
    select?: SealedPriceEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the SealedPriceEntry
     */
    omit?: SealedPriceEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SealedPriceEntryInclude<ExtArgs> | null
    /**
     * Filter which SealedPriceEntry to delete.
     */
    where: SealedPriceEntryWhereUniqueInput
  }

  /**
   * SealedPriceEntry deleteMany
   */
  export type SealedPriceEntryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SealedPriceEntries to delete
     */
    where?: SealedPriceEntryWhereInput
    /**
     * Limit how many SealedPriceEntries to delete.
     */
    limit?: number
  }

  /**
   * SealedPriceEntry without action
   */
  export type SealedPriceEntryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SealedPriceEntry
     */
    select?: SealedPriceEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the SealedPriceEntry
     */
    omit?: SealedPriceEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SealedPriceEntryInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const CardScalarFieldEnum: {
    id: 'id',
    data: 'data'
  };

  export type CardScalarFieldEnum = (typeof CardScalarFieldEnum)[keyof typeof CardScalarFieldEnum]


  export const PriceEntryScalarFieldEnum: {
    id: 'id',
    cardId: 'cardId',
    price: 'price',
    date: 'date'
  };

  export type PriceEntryScalarFieldEnum = (typeof PriceEntryScalarFieldEnum)[keyof typeof PriceEntryScalarFieldEnum]


  export const SealedScalarFieldEnum: {
    id: 'id',
    product: 'product',
    createdAt: 'createdAt'
  };

  export type SealedScalarFieldEnum = (typeof SealedScalarFieldEnum)[keyof typeof SealedScalarFieldEnum]


  export const SealedPriceEntryScalarFieldEnum: {
    id: 'id',
    sealedId: 'sealedId',
    price: 'price',
    title: 'title',
    url: 'url',
    soldAt: 'soldAt'
  };

  export type SealedPriceEntryScalarFieldEnum = (typeof SealedPriceEntryScalarFieldEnum)[keyof typeof SealedPriceEntryScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    
  /**
   * Deep Input Types
   */


  export type CardWhereInput = {
    AND?: CardWhereInput | CardWhereInput[]
    OR?: CardWhereInput[]
    NOT?: CardWhereInput | CardWhereInput[]
    id?: StringFilter<"Card"> | string
    data?: JsonFilter<"Card">
    prices?: PriceEntryListRelationFilter
  }

  export type CardOrderByWithRelationInput = {
    id?: SortOrder
    data?: SortOrder
    prices?: PriceEntryOrderByRelationAggregateInput
  }

  export type CardWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CardWhereInput | CardWhereInput[]
    OR?: CardWhereInput[]
    NOT?: CardWhereInput | CardWhereInput[]
    data?: JsonFilter<"Card">
    prices?: PriceEntryListRelationFilter
  }, "id">

  export type CardOrderByWithAggregationInput = {
    id?: SortOrder
    data?: SortOrder
    _count?: CardCountOrderByAggregateInput
    _max?: CardMaxOrderByAggregateInput
    _min?: CardMinOrderByAggregateInput
  }

  export type CardScalarWhereWithAggregatesInput = {
    AND?: CardScalarWhereWithAggregatesInput | CardScalarWhereWithAggregatesInput[]
    OR?: CardScalarWhereWithAggregatesInput[]
    NOT?: CardScalarWhereWithAggregatesInput | CardScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Card"> | string
    data?: JsonWithAggregatesFilter<"Card">
  }

  export type PriceEntryWhereInput = {
    AND?: PriceEntryWhereInput | PriceEntryWhereInput[]
    OR?: PriceEntryWhereInput[]
    NOT?: PriceEntryWhereInput | PriceEntryWhereInput[]
    id?: IntFilter<"PriceEntry"> | number
    cardId?: StringFilter<"PriceEntry"> | string
    price?: FloatFilter<"PriceEntry"> | number
    date?: DateTimeFilter<"PriceEntry"> | Date | string
    card?: XOR<CardScalarRelationFilter, CardWhereInput>
  }

  export type PriceEntryOrderByWithRelationInput = {
    id?: SortOrder
    cardId?: SortOrder
    price?: SortOrder
    date?: SortOrder
    card?: CardOrderByWithRelationInput
  }

  export type PriceEntryWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    cardId_date?: PriceEntryCardIdDateCompoundUniqueInput
    AND?: PriceEntryWhereInput | PriceEntryWhereInput[]
    OR?: PriceEntryWhereInput[]
    NOT?: PriceEntryWhereInput | PriceEntryWhereInput[]
    cardId?: StringFilter<"PriceEntry"> | string
    price?: FloatFilter<"PriceEntry"> | number
    date?: DateTimeFilter<"PriceEntry"> | Date | string
    card?: XOR<CardScalarRelationFilter, CardWhereInput>
  }, "id" | "cardId_date">

  export type PriceEntryOrderByWithAggregationInput = {
    id?: SortOrder
    cardId?: SortOrder
    price?: SortOrder
    date?: SortOrder
    _count?: PriceEntryCountOrderByAggregateInput
    _avg?: PriceEntryAvgOrderByAggregateInput
    _max?: PriceEntryMaxOrderByAggregateInput
    _min?: PriceEntryMinOrderByAggregateInput
    _sum?: PriceEntrySumOrderByAggregateInput
  }

  export type PriceEntryScalarWhereWithAggregatesInput = {
    AND?: PriceEntryScalarWhereWithAggregatesInput | PriceEntryScalarWhereWithAggregatesInput[]
    OR?: PriceEntryScalarWhereWithAggregatesInput[]
    NOT?: PriceEntryScalarWhereWithAggregatesInput | PriceEntryScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"PriceEntry"> | number
    cardId?: StringWithAggregatesFilter<"PriceEntry"> | string
    price?: FloatWithAggregatesFilter<"PriceEntry"> | number
    date?: DateTimeWithAggregatesFilter<"PriceEntry"> | Date | string
  }

  export type SealedWhereInput = {
    AND?: SealedWhereInput | SealedWhereInput[]
    OR?: SealedWhereInput[]
    NOT?: SealedWhereInput | SealedWhereInput[]
    id?: StringFilter<"Sealed"> | string
    product?: StringFilter<"Sealed"> | string
    createdAt?: DateTimeFilter<"Sealed"> | Date | string
    prices?: SealedPriceEntryListRelationFilter
  }

  export type SealedOrderByWithRelationInput = {
    id?: SortOrder
    product?: SortOrder
    createdAt?: SortOrder
    prices?: SealedPriceEntryOrderByRelationAggregateInput
  }

  export type SealedWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    product?: string
    AND?: SealedWhereInput | SealedWhereInput[]
    OR?: SealedWhereInput[]
    NOT?: SealedWhereInput | SealedWhereInput[]
    createdAt?: DateTimeFilter<"Sealed"> | Date | string
    prices?: SealedPriceEntryListRelationFilter
  }, "id" | "product">

  export type SealedOrderByWithAggregationInput = {
    id?: SortOrder
    product?: SortOrder
    createdAt?: SortOrder
    _count?: SealedCountOrderByAggregateInput
    _max?: SealedMaxOrderByAggregateInput
    _min?: SealedMinOrderByAggregateInput
  }

  export type SealedScalarWhereWithAggregatesInput = {
    AND?: SealedScalarWhereWithAggregatesInput | SealedScalarWhereWithAggregatesInput[]
    OR?: SealedScalarWhereWithAggregatesInput[]
    NOT?: SealedScalarWhereWithAggregatesInput | SealedScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Sealed"> | string
    product?: StringWithAggregatesFilter<"Sealed"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Sealed"> | Date | string
  }

  export type SealedPriceEntryWhereInput = {
    AND?: SealedPriceEntryWhereInput | SealedPriceEntryWhereInput[]
    OR?: SealedPriceEntryWhereInput[]
    NOT?: SealedPriceEntryWhereInput | SealedPriceEntryWhereInput[]
    id?: StringFilter<"SealedPriceEntry"> | string
    sealedId?: StringFilter<"SealedPriceEntry"> | string
    price?: FloatFilter<"SealedPriceEntry"> | number
    title?: StringFilter<"SealedPriceEntry"> | string
    url?: StringFilter<"SealedPriceEntry"> | string
    soldAt?: DateTimeFilter<"SealedPriceEntry"> | Date | string
    sealed?: XOR<SealedScalarRelationFilter, SealedWhereInput>
  }

  export type SealedPriceEntryOrderByWithRelationInput = {
    id?: SortOrder
    sealedId?: SortOrder
    price?: SortOrder
    title?: SortOrder
    url?: SortOrder
    soldAt?: SortOrder
    sealed?: SealedOrderByWithRelationInput
  }

  export type SealedPriceEntryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    title?: string
    AND?: SealedPriceEntryWhereInput | SealedPriceEntryWhereInput[]
    OR?: SealedPriceEntryWhereInput[]
    NOT?: SealedPriceEntryWhereInput | SealedPriceEntryWhereInput[]
    sealedId?: StringFilter<"SealedPriceEntry"> | string
    price?: FloatFilter<"SealedPriceEntry"> | number
    url?: StringFilter<"SealedPriceEntry"> | string
    soldAt?: DateTimeFilter<"SealedPriceEntry"> | Date | string
    sealed?: XOR<SealedScalarRelationFilter, SealedWhereInput>
  }, "id" | "title">

  export type SealedPriceEntryOrderByWithAggregationInput = {
    id?: SortOrder
    sealedId?: SortOrder
    price?: SortOrder
    title?: SortOrder
    url?: SortOrder
    soldAt?: SortOrder
    _count?: SealedPriceEntryCountOrderByAggregateInput
    _avg?: SealedPriceEntryAvgOrderByAggregateInput
    _max?: SealedPriceEntryMaxOrderByAggregateInput
    _min?: SealedPriceEntryMinOrderByAggregateInput
    _sum?: SealedPriceEntrySumOrderByAggregateInput
  }

  export type SealedPriceEntryScalarWhereWithAggregatesInput = {
    AND?: SealedPriceEntryScalarWhereWithAggregatesInput | SealedPriceEntryScalarWhereWithAggregatesInput[]
    OR?: SealedPriceEntryScalarWhereWithAggregatesInput[]
    NOT?: SealedPriceEntryScalarWhereWithAggregatesInput | SealedPriceEntryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SealedPriceEntry"> | string
    sealedId?: StringWithAggregatesFilter<"SealedPriceEntry"> | string
    price?: FloatWithAggregatesFilter<"SealedPriceEntry"> | number
    title?: StringWithAggregatesFilter<"SealedPriceEntry"> | string
    url?: StringWithAggregatesFilter<"SealedPriceEntry"> | string
    soldAt?: DateTimeWithAggregatesFilter<"SealedPriceEntry"> | Date | string
  }

  export type CardCreateInput = {
    id: string
    data: JsonNullValueInput | InputJsonValue
    prices?: PriceEntryCreateNestedManyWithoutCardInput
  }

  export type CardUncheckedCreateInput = {
    id: string
    data: JsonNullValueInput | InputJsonValue
    prices?: PriceEntryUncheckedCreateNestedManyWithoutCardInput
  }

  export type CardUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: JsonNullValueInput | InputJsonValue
    prices?: PriceEntryUpdateManyWithoutCardNestedInput
  }

  export type CardUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: JsonNullValueInput | InputJsonValue
    prices?: PriceEntryUncheckedUpdateManyWithoutCardNestedInput
  }

  export type CardCreateManyInput = {
    id: string
    data: JsonNullValueInput | InputJsonValue
  }

  export type CardUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: JsonNullValueInput | InputJsonValue
  }

  export type CardUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: JsonNullValueInput | InputJsonValue
  }

  export type PriceEntryCreateInput = {
    price: number
    date?: Date | string
    card: CardCreateNestedOneWithoutPricesInput
  }

  export type PriceEntryUncheckedCreateInput = {
    id?: number
    cardId: string
    price: number
    date?: Date | string
  }

  export type PriceEntryUpdateInput = {
    price?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    card?: CardUpdateOneRequiredWithoutPricesNestedInput
  }

  export type PriceEntryUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    cardId?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PriceEntryCreateManyInput = {
    id?: number
    cardId: string
    price: number
    date?: Date | string
  }

  export type PriceEntryUpdateManyMutationInput = {
    price?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PriceEntryUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    cardId?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SealedCreateInput = {
    id?: string
    product: string
    createdAt?: Date | string
    prices?: SealedPriceEntryCreateNestedManyWithoutSealedInput
  }

  export type SealedUncheckedCreateInput = {
    id?: string
    product: string
    createdAt?: Date | string
    prices?: SealedPriceEntryUncheckedCreateNestedManyWithoutSealedInput
  }

  export type SealedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    product?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    prices?: SealedPriceEntryUpdateManyWithoutSealedNestedInput
  }

  export type SealedUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    product?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    prices?: SealedPriceEntryUncheckedUpdateManyWithoutSealedNestedInput
  }

  export type SealedCreateManyInput = {
    id?: string
    product: string
    createdAt?: Date | string
  }

  export type SealedUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    product?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SealedUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    product?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SealedPriceEntryCreateInput = {
    id?: string
    price: number
    title: string
    url: string
    soldAt: Date | string
    sealed: SealedCreateNestedOneWithoutPricesInput
  }

  export type SealedPriceEntryUncheckedCreateInput = {
    id?: string
    sealedId: string
    price: number
    title: string
    url: string
    soldAt: Date | string
  }

  export type SealedPriceEntryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    soldAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sealed?: SealedUpdateOneRequiredWithoutPricesNestedInput
  }

  export type SealedPriceEntryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sealedId?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    soldAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SealedPriceEntryCreateManyInput = {
    id?: string
    sealedId: string
    price: number
    title: string
    url: string
    soldAt: Date | string
  }

  export type SealedPriceEntryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    soldAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SealedPriceEntryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sealedId?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    soldAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type PriceEntryListRelationFilter = {
    every?: PriceEntryWhereInput
    some?: PriceEntryWhereInput
    none?: PriceEntryWhereInput
  }

  export type PriceEntryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CardCountOrderByAggregateInput = {
    id?: SortOrder
    data?: SortOrder
  }

  export type CardMaxOrderByAggregateInput = {
    id?: SortOrder
  }

  export type CardMinOrderByAggregateInput = {
    id?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type CardScalarRelationFilter = {
    is?: CardWhereInput
    isNot?: CardWhereInput
  }

  export type PriceEntryCardIdDateCompoundUniqueInput = {
    cardId: string
    date: Date | string
  }

  export type PriceEntryCountOrderByAggregateInput = {
    id?: SortOrder
    cardId?: SortOrder
    price?: SortOrder
    date?: SortOrder
  }

  export type PriceEntryAvgOrderByAggregateInput = {
    id?: SortOrder
    price?: SortOrder
  }

  export type PriceEntryMaxOrderByAggregateInput = {
    id?: SortOrder
    cardId?: SortOrder
    price?: SortOrder
    date?: SortOrder
  }

  export type PriceEntryMinOrderByAggregateInput = {
    id?: SortOrder
    cardId?: SortOrder
    price?: SortOrder
    date?: SortOrder
  }

  export type PriceEntrySumOrderByAggregateInput = {
    id?: SortOrder
    price?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type SealedPriceEntryListRelationFilter = {
    every?: SealedPriceEntryWhereInput
    some?: SealedPriceEntryWhereInput
    none?: SealedPriceEntryWhereInput
  }

  export type SealedPriceEntryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SealedCountOrderByAggregateInput = {
    id?: SortOrder
    product?: SortOrder
    createdAt?: SortOrder
  }

  export type SealedMaxOrderByAggregateInput = {
    id?: SortOrder
    product?: SortOrder
    createdAt?: SortOrder
  }

  export type SealedMinOrderByAggregateInput = {
    id?: SortOrder
    product?: SortOrder
    createdAt?: SortOrder
  }

  export type SealedScalarRelationFilter = {
    is?: SealedWhereInput
    isNot?: SealedWhereInput
  }

  export type SealedPriceEntryCountOrderByAggregateInput = {
    id?: SortOrder
    sealedId?: SortOrder
    price?: SortOrder
    title?: SortOrder
    url?: SortOrder
    soldAt?: SortOrder
  }

  export type SealedPriceEntryAvgOrderByAggregateInput = {
    price?: SortOrder
  }

  export type SealedPriceEntryMaxOrderByAggregateInput = {
    id?: SortOrder
    sealedId?: SortOrder
    price?: SortOrder
    title?: SortOrder
    url?: SortOrder
    soldAt?: SortOrder
  }

  export type SealedPriceEntryMinOrderByAggregateInput = {
    id?: SortOrder
    sealedId?: SortOrder
    price?: SortOrder
    title?: SortOrder
    url?: SortOrder
    soldAt?: SortOrder
  }

  export type SealedPriceEntrySumOrderByAggregateInput = {
    price?: SortOrder
  }

  export type PriceEntryCreateNestedManyWithoutCardInput = {
    create?: XOR<PriceEntryCreateWithoutCardInput, PriceEntryUncheckedCreateWithoutCardInput> | PriceEntryCreateWithoutCardInput[] | PriceEntryUncheckedCreateWithoutCardInput[]
    connectOrCreate?: PriceEntryCreateOrConnectWithoutCardInput | PriceEntryCreateOrConnectWithoutCardInput[]
    createMany?: PriceEntryCreateManyCardInputEnvelope
    connect?: PriceEntryWhereUniqueInput | PriceEntryWhereUniqueInput[]
  }

  export type PriceEntryUncheckedCreateNestedManyWithoutCardInput = {
    create?: XOR<PriceEntryCreateWithoutCardInput, PriceEntryUncheckedCreateWithoutCardInput> | PriceEntryCreateWithoutCardInput[] | PriceEntryUncheckedCreateWithoutCardInput[]
    connectOrCreate?: PriceEntryCreateOrConnectWithoutCardInput | PriceEntryCreateOrConnectWithoutCardInput[]
    createMany?: PriceEntryCreateManyCardInputEnvelope
    connect?: PriceEntryWhereUniqueInput | PriceEntryWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type PriceEntryUpdateManyWithoutCardNestedInput = {
    create?: XOR<PriceEntryCreateWithoutCardInput, PriceEntryUncheckedCreateWithoutCardInput> | PriceEntryCreateWithoutCardInput[] | PriceEntryUncheckedCreateWithoutCardInput[]
    connectOrCreate?: PriceEntryCreateOrConnectWithoutCardInput | PriceEntryCreateOrConnectWithoutCardInput[]
    upsert?: PriceEntryUpsertWithWhereUniqueWithoutCardInput | PriceEntryUpsertWithWhereUniqueWithoutCardInput[]
    createMany?: PriceEntryCreateManyCardInputEnvelope
    set?: PriceEntryWhereUniqueInput | PriceEntryWhereUniqueInput[]
    disconnect?: PriceEntryWhereUniqueInput | PriceEntryWhereUniqueInput[]
    delete?: PriceEntryWhereUniqueInput | PriceEntryWhereUniqueInput[]
    connect?: PriceEntryWhereUniqueInput | PriceEntryWhereUniqueInput[]
    update?: PriceEntryUpdateWithWhereUniqueWithoutCardInput | PriceEntryUpdateWithWhereUniqueWithoutCardInput[]
    updateMany?: PriceEntryUpdateManyWithWhereWithoutCardInput | PriceEntryUpdateManyWithWhereWithoutCardInput[]
    deleteMany?: PriceEntryScalarWhereInput | PriceEntryScalarWhereInput[]
  }

  export type PriceEntryUncheckedUpdateManyWithoutCardNestedInput = {
    create?: XOR<PriceEntryCreateWithoutCardInput, PriceEntryUncheckedCreateWithoutCardInput> | PriceEntryCreateWithoutCardInput[] | PriceEntryUncheckedCreateWithoutCardInput[]
    connectOrCreate?: PriceEntryCreateOrConnectWithoutCardInput | PriceEntryCreateOrConnectWithoutCardInput[]
    upsert?: PriceEntryUpsertWithWhereUniqueWithoutCardInput | PriceEntryUpsertWithWhereUniqueWithoutCardInput[]
    createMany?: PriceEntryCreateManyCardInputEnvelope
    set?: PriceEntryWhereUniqueInput | PriceEntryWhereUniqueInput[]
    disconnect?: PriceEntryWhereUniqueInput | PriceEntryWhereUniqueInput[]
    delete?: PriceEntryWhereUniqueInput | PriceEntryWhereUniqueInput[]
    connect?: PriceEntryWhereUniqueInput | PriceEntryWhereUniqueInput[]
    update?: PriceEntryUpdateWithWhereUniqueWithoutCardInput | PriceEntryUpdateWithWhereUniqueWithoutCardInput[]
    updateMany?: PriceEntryUpdateManyWithWhereWithoutCardInput | PriceEntryUpdateManyWithWhereWithoutCardInput[]
    deleteMany?: PriceEntryScalarWhereInput | PriceEntryScalarWhereInput[]
  }

  export type CardCreateNestedOneWithoutPricesInput = {
    create?: XOR<CardCreateWithoutPricesInput, CardUncheckedCreateWithoutPricesInput>
    connectOrCreate?: CardCreateOrConnectWithoutPricesInput
    connect?: CardWhereUniqueInput
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type CardUpdateOneRequiredWithoutPricesNestedInput = {
    create?: XOR<CardCreateWithoutPricesInput, CardUncheckedCreateWithoutPricesInput>
    connectOrCreate?: CardCreateOrConnectWithoutPricesInput
    upsert?: CardUpsertWithoutPricesInput
    connect?: CardWhereUniqueInput
    update?: XOR<XOR<CardUpdateToOneWithWhereWithoutPricesInput, CardUpdateWithoutPricesInput>, CardUncheckedUpdateWithoutPricesInput>
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type SealedPriceEntryCreateNestedManyWithoutSealedInput = {
    create?: XOR<SealedPriceEntryCreateWithoutSealedInput, SealedPriceEntryUncheckedCreateWithoutSealedInput> | SealedPriceEntryCreateWithoutSealedInput[] | SealedPriceEntryUncheckedCreateWithoutSealedInput[]
    connectOrCreate?: SealedPriceEntryCreateOrConnectWithoutSealedInput | SealedPriceEntryCreateOrConnectWithoutSealedInput[]
    createMany?: SealedPriceEntryCreateManySealedInputEnvelope
    connect?: SealedPriceEntryWhereUniqueInput | SealedPriceEntryWhereUniqueInput[]
  }

  export type SealedPriceEntryUncheckedCreateNestedManyWithoutSealedInput = {
    create?: XOR<SealedPriceEntryCreateWithoutSealedInput, SealedPriceEntryUncheckedCreateWithoutSealedInput> | SealedPriceEntryCreateWithoutSealedInput[] | SealedPriceEntryUncheckedCreateWithoutSealedInput[]
    connectOrCreate?: SealedPriceEntryCreateOrConnectWithoutSealedInput | SealedPriceEntryCreateOrConnectWithoutSealedInput[]
    createMany?: SealedPriceEntryCreateManySealedInputEnvelope
    connect?: SealedPriceEntryWhereUniqueInput | SealedPriceEntryWhereUniqueInput[]
  }

  export type SealedPriceEntryUpdateManyWithoutSealedNestedInput = {
    create?: XOR<SealedPriceEntryCreateWithoutSealedInput, SealedPriceEntryUncheckedCreateWithoutSealedInput> | SealedPriceEntryCreateWithoutSealedInput[] | SealedPriceEntryUncheckedCreateWithoutSealedInput[]
    connectOrCreate?: SealedPriceEntryCreateOrConnectWithoutSealedInput | SealedPriceEntryCreateOrConnectWithoutSealedInput[]
    upsert?: SealedPriceEntryUpsertWithWhereUniqueWithoutSealedInput | SealedPriceEntryUpsertWithWhereUniqueWithoutSealedInput[]
    createMany?: SealedPriceEntryCreateManySealedInputEnvelope
    set?: SealedPriceEntryWhereUniqueInput | SealedPriceEntryWhereUniqueInput[]
    disconnect?: SealedPriceEntryWhereUniqueInput | SealedPriceEntryWhereUniqueInput[]
    delete?: SealedPriceEntryWhereUniqueInput | SealedPriceEntryWhereUniqueInput[]
    connect?: SealedPriceEntryWhereUniqueInput | SealedPriceEntryWhereUniqueInput[]
    update?: SealedPriceEntryUpdateWithWhereUniqueWithoutSealedInput | SealedPriceEntryUpdateWithWhereUniqueWithoutSealedInput[]
    updateMany?: SealedPriceEntryUpdateManyWithWhereWithoutSealedInput | SealedPriceEntryUpdateManyWithWhereWithoutSealedInput[]
    deleteMany?: SealedPriceEntryScalarWhereInput | SealedPriceEntryScalarWhereInput[]
  }

  export type SealedPriceEntryUncheckedUpdateManyWithoutSealedNestedInput = {
    create?: XOR<SealedPriceEntryCreateWithoutSealedInput, SealedPriceEntryUncheckedCreateWithoutSealedInput> | SealedPriceEntryCreateWithoutSealedInput[] | SealedPriceEntryUncheckedCreateWithoutSealedInput[]
    connectOrCreate?: SealedPriceEntryCreateOrConnectWithoutSealedInput | SealedPriceEntryCreateOrConnectWithoutSealedInput[]
    upsert?: SealedPriceEntryUpsertWithWhereUniqueWithoutSealedInput | SealedPriceEntryUpsertWithWhereUniqueWithoutSealedInput[]
    createMany?: SealedPriceEntryCreateManySealedInputEnvelope
    set?: SealedPriceEntryWhereUniqueInput | SealedPriceEntryWhereUniqueInput[]
    disconnect?: SealedPriceEntryWhereUniqueInput | SealedPriceEntryWhereUniqueInput[]
    delete?: SealedPriceEntryWhereUniqueInput | SealedPriceEntryWhereUniqueInput[]
    connect?: SealedPriceEntryWhereUniqueInput | SealedPriceEntryWhereUniqueInput[]
    update?: SealedPriceEntryUpdateWithWhereUniqueWithoutSealedInput | SealedPriceEntryUpdateWithWhereUniqueWithoutSealedInput[]
    updateMany?: SealedPriceEntryUpdateManyWithWhereWithoutSealedInput | SealedPriceEntryUpdateManyWithWhereWithoutSealedInput[]
    deleteMany?: SealedPriceEntryScalarWhereInput | SealedPriceEntryScalarWhereInput[]
  }

  export type SealedCreateNestedOneWithoutPricesInput = {
    create?: XOR<SealedCreateWithoutPricesInput, SealedUncheckedCreateWithoutPricesInput>
    connectOrCreate?: SealedCreateOrConnectWithoutPricesInput
    connect?: SealedWhereUniqueInput
  }

  export type SealedUpdateOneRequiredWithoutPricesNestedInput = {
    create?: XOR<SealedCreateWithoutPricesInput, SealedUncheckedCreateWithoutPricesInput>
    connectOrCreate?: SealedCreateOrConnectWithoutPricesInput
    upsert?: SealedUpsertWithoutPricesInput
    connect?: SealedWhereUniqueInput
    update?: XOR<XOR<SealedUpdateToOneWithWhereWithoutPricesInput, SealedUpdateWithoutPricesInput>, SealedUncheckedUpdateWithoutPricesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type PriceEntryCreateWithoutCardInput = {
    price: number
    date?: Date | string
  }

  export type PriceEntryUncheckedCreateWithoutCardInput = {
    id?: number
    price: number
    date?: Date | string
  }

  export type PriceEntryCreateOrConnectWithoutCardInput = {
    where: PriceEntryWhereUniqueInput
    create: XOR<PriceEntryCreateWithoutCardInput, PriceEntryUncheckedCreateWithoutCardInput>
  }

  export type PriceEntryCreateManyCardInputEnvelope = {
    data: PriceEntryCreateManyCardInput | PriceEntryCreateManyCardInput[]
    skipDuplicates?: boolean
  }

  export type PriceEntryUpsertWithWhereUniqueWithoutCardInput = {
    where: PriceEntryWhereUniqueInput
    update: XOR<PriceEntryUpdateWithoutCardInput, PriceEntryUncheckedUpdateWithoutCardInput>
    create: XOR<PriceEntryCreateWithoutCardInput, PriceEntryUncheckedCreateWithoutCardInput>
  }

  export type PriceEntryUpdateWithWhereUniqueWithoutCardInput = {
    where: PriceEntryWhereUniqueInput
    data: XOR<PriceEntryUpdateWithoutCardInput, PriceEntryUncheckedUpdateWithoutCardInput>
  }

  export type PriceEntryUpdateManyWithWhereWithoutCardInput = {
    where: PriceEntryScalarWhereInput
    data: XOR<PriceEntryUpdateManyMutationInput, PriceEntryUncheckedUpdateManyWithoutCardInput>
  }

  export type PriceEntryScalarWhereInput = {
    AND?: PriceEntryScalarWhereInput | PriceEntryScalarWhereInput[]
    OR?: PriceEntryScalarWhereInput[]
    NOT?: PriceEntryScalarWhereInput | PriceEntryScalarWhereInput[]
    id?: IntFilter<"PriceEntry"> | number
    cardId?: StringFilter<"PriceEntry"> | string
    price?: FloatFilter<"PriceEntry"> | number
    date?: DateTimeFilter<"PriceEntry"> | Date | string
  }

  export type CardCreateWithoutPricesInput = {
    id: string
    data: JsonNullValueInput | InputJsonValue
  }

  export type CardUncheckedCreateWithoutPricesInput = {
    id: string
    data: JsonNullValueInput | InputJsonValue
  }

  export type CardCreateOrConnectWithoutPricesInput = {
    where: CardWhereUniqueInput
    create: XOR<CardCreateWithoutPricesInput, CardUncheckedCreateWithoutPricesInput>
  }

  export type CardUpsertWithoutPricesInput = {
    update: XOR<CardUpdateWithoutPricesInput, CardUncheckedUpdateWithoutPricesInput>
    create: XOR<CardCreateWithoutPricesInput, CardUncheckedCreateWithoutPricesInput>
    where?: CardWhereInput
  }

  export type CardUpdateToOneWithWhereWithoutPricesInput = {
    where?: CardWhereInput
    data: XOR<CardUpdateWithoutPricesInput, CardUncheckedUpdateWithoutPricesInput>
  }

  export type CardUpdateWithoutPricesInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: JsonNullValueInput | InputJsonValue
  }

  export type CardUncheckedUpdateWithoutPricesInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: JsonNullValueInput | InputJsonValue
  }

  export type SealedPriceEntryCreateWithoutSealedInput = {
    id?: string
    price: number
    title: string
    url: string
    soldAt: Date | string
  }

  export type SealedPriceEntryUncheckedCreateWithoutSealedInput = {
    id?: string
    price: number
    title: string
    url: string
    soldAt: Date | string
  }

  export type SealedPriceEntryCreateOrConnectWithoutSealedInput = {
    where: SealedPriceEntryWhereUniqueInput
    create: XOR<SealedPriceEntryCreateWithoutSealedInput, SealedPriceEntryUncheckedCreateWithoutSealedInput>
  }

  export type SealedPriceEntryCreateManySealedInputEnvelope = {
    data: SealedPriceEntryCreateManySealedInput | SealedPriceEntryCreateManySealedInput[]
    skipDuplicates?: boolean
  }

  export type SealedPriceEntryUpsertWithWhereUniqueWithoutSealedInput = {
    where: SealedPriceEntryWhereUniqueInput
    update: XOR<SealedPriceEntryUpdateWithoutSealedInput, SealedPriceEntryUncheckedUpdateWithoutSealedInput>
    create: XOR<SealedPriceEntryCreateWithoutSealedInput, SealedPriceEntryUncheckedCreateWithoutSealedInput>
  }

  export type SealedPriceEntryUpdateWithWhereUniqueWithoutSealedInput = {
    where: SealedPriceEntryWhereUniqueInput
    data: XOR<SealedPriceEntryUpdateWithoutSealedInput, SealedPriceEntryUncheckedUpdateWithoutSealedInput>
  }

  export type SealedPriceEntryUpdateManyWithWhereWithoutSealedInput = {
    where: SealedPriceEntryScalarWhereInput
    data: XOR<SealedPriceEntryUpdateManyMutationInput, SealedPriceEntryUncheckedUpdateManyWithoutSealedInput>
  }

  export type SealedPriceEntryScalarWhereInput = {
    AND?: SealedPriceEntryScalarWhereInput | SealedPriceEntryScalarWhereInput[]
    OR?: SealedPriceEntryScalarWhereInput[]
    NOT?: SealedPriceEntryScalarWhereInput | SealedPriceEntryScalarWhereInput[]
    id?: StringFilter<"SealedPriceEntry"> | string
    sealedId?: StringFilter<"SealedPriceEntry"> | string
    price?: FloatFilter<"SealedPriceEntry"> | number
    title?: StringFilter<"SealedPriceEntry"> | string
    url?: StringFilter<"SealedPriceEntry"> | string
    soldAt?: DateTimeFilter<"SealedPriceEntry"> | Date | string
  }

  export type SealedCreateWithoutPricesInput = {
    id?: string
    product: string
    createdAt?: Date | string
  }

  export type SealedUncheckedCreateWithoutPricesInput = {
    id?: string
    product: string
    createdAt?: Date | string
  }

  export type SealedCreateOrConnectWithoutPricesInput = {
    where: SealedWhereUniqueInput
    create: XOR<SealedCreateWithoutPricesInput, SealedUncheckedCreateWithoutPricesInput>
  }

  export type SealedUpsertWithoutPricesInput = {
    update: XOR<SealedUpdateWithoutPricesInput, SealedUncheckedUpdateWithoutPricesInput>
    create: XOR<SealedCreateWithoutPricesInput, SealedUncheckedCreateWithoutPricesInput>
    where?: SealedWhereInput
  }

  export type SealedUpdateToOneWithWhereWithoutPricesInput = {
    where?: SealedWhereInput
    data: XOR<SealedUpdateWithoutPricesInput, SealedUncheckedUpdateWithoutPricesInput>
  }

  export type SealedUpdateWithoutPricesInput = {
    id?: StringFieldUpdateOperationsInput | string
    product?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SealedUncheckedUpdateWithoutPricesInput = {
    id?: StringFieldUpdateOperationsInput | string
    product?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PriceEntryCreateManyCardInput = {
    id?: number
    price: number
    date?: Date | string
  }

  export type PriceEntryUpdateWithoutCardInput = {
    price?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PriceEntryUncheckedUpdateWithoutCardInput = {
    id?: IntFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PriceEntryUncheckedUpdateManyWithoutCardInput = {
    id?: IntFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SealedPriceEntryCreateManySealedInput = {
    id?: string
    price: number
    title: string
    url: string
    soldAt: Date | string
  }

  export type SealedPriceEntryUpdateWithoutSealedInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    soldAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SealedPriceEntryUncheckedUpdateWithoutSealedInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    soldAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SealedPriceEntryUncheckedUpdateManyWithoutSealedInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    soldAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}