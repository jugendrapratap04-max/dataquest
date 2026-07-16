// sql.js ships no types, and the browser runner never needed any — it loads the
// script from /public and reaches through `window`. The server verifier imports
// the package properly, so it needs this much. Just the surface we use, rather
// than a @types dependency for one import.
declare module "sql.js" {
  export type QueryExecResult = { columns: string[]; values: unknown[][] };

  export class Database {
    constructor(data?: ArrayLike<number> | Buffer | null);
    run(sql: string): Database;
    exec(sql: string): QueryExecResult[];
    close(): void;
  }

  export type SqlJsStatic = { Database: typeof Database };

  export default function initSqlJs(config?: {
    wasmBinary?: ArrayLike<number> | Buffer;
    locateFile?: (file: string) => string;
  }): Promise<SqlJsStatic>;
}
