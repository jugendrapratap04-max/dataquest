// An Intel 8085 assembler and simulator, in about six hundred lines.
//
// WHY THIS EXISTS. Every other subject on this platform can be practised because
// something already runs it: Pyodide for Python, sql.js for SQL. Nothing runs
// 8085 assembly in a browser, and a microprocessor course where the student
// never executes an instruction is a notes website. So this is the runtime.
//
// It is used by four things and they must all agree:
//   - the student's practice editor        (components/Asm8085Workbench.tsx)
//   - the lesson panels                    (components/viz/*)
//   - `npm run verify:lesson`              (prisma/verify-lesson.mjs)
//   - the server-side re-verifier          (lib/verify.ts, prisma/check-content.mjs)
// One engine, four consumers — the same arrangement sql.js has, and for the same
// reason: a claimed register value has to be the value the student will see.
//
// WHAT IT IS NOT. It does not model the bus, the multiplexed AD0-AD7 lines, or
// interrupt hardware. It executes instructions and counts T-states. Timing
// diagrams and pin behaviour are taught with dedicated visuals instead, because
// those are about what happens *between* instructions and a register-level
// simulator is the wrong tool for them.
//
// ACCURACY NOTES — the places where sources disagree, and what was chosen:
//   * Flags are Gaonkar's (S Z x AC x P x CY, bit 1 always 1, bits 3 and 5 zero).
//   * ANA sets AC and clears CY. This is 8085 behaviour and differs from the
//     8080, where AC came from bit 3 of the operands. Gaonkar states it plainly.
//   * AC after a SUBTRACT is the "no borrow from bit 3" convention. Textbooks
//     genuinely differ here and Intel's own manual is quiet, so no lesson should
//     assert AC after a subtraction — teach AC through addition and DAA, where
//     it is unambiguous and where it actually matters.
//   * T-state counts are the standard 8085 figures (CALL 18, RET 10, conditional
//     call 18 taken / 9 not taken, conditional return 12 / 6, INX 6, DAD 10).
//     They are here because "calculate the delay of this loop" is a real exam
//     question, and a simulator that counts them turns it into something a
//     student can check instead of trust.

/* ------------------------------------------------------------------ types --- */

export type Flags = { S: boolean; Z: boolean; AC: boolean; P: boolean; CY: boolean };

export type Registers = {
  A: number; B: number; C: number; D: number; E: number; H: number; L: number;
  SP: number; PC: number;
};

export type RunResult = {
  ok: boolean;
  /** Human-readable failure, already mentioning the source line where possible. */
  error?: string;
  /** 1-based source line the failure came from. */
  line?: number;
  regs: Registers;
  flags: Flags;
  /** Only the addresses the program wrote or the assembler filled in. */
  memory: Record<number, number>;
  /** Total T-states executed — the number a delay calculation has to match. */
  tStates: number;
  /** Instructions executed. */
  steps: number;
  /** Bytes written with OUT, in order, as [port, value] pairs. */
  ports: [number, number][];
  halted: boolean;
  /** Assembled machine code, address -> byte. What a student hand-assembles. */
  code: Record<number, number>;
};

type Instr = {
  addr: number;
  line: number;
  text: string;
  bytes: number[];
  /** Executes one instruction and returns the T-states it took. */
  exec: (st: State) => number;
};

type State = {
  reg: Uint8Array;      // indexed by REG codes below; index 6 (M) is unused
  mem: Uint8Array;      // 64 KB
  f: Flags;
  SP: number;
  PC: number;
  halted: boolean;
  ports: [number, number][];
  touched: Set<number>;
  inputs: Record<number, number>;
};

/* --------------------------------------------------------------- encoding --- */

// The register codes the 8085's own opcodes use. Every arithmetic and MOV
// opcode is built from these, which is why the tables below are formulas
// rather than a 256-entry list nobody could review.
const REG: Record<string, number> = { B: 0, C: 1, D: 2, E: 3, H: 4, L: 5, M: 6, A: 7 };
const RP: Record<string, number> = { B: 0, D: 1, H: 2, SP: 3 };
const RP_PUSH: Record<string, number> = { B: 0, D: 1, H: 2, PSW: 3 };
// Condition codes, in opcode order: JNZ JZ JNC JC JPO JPE JP JM
const CC: Record<string, number> = { NZ: 0, Z: 1, NC: 2, C: 3, PO: 4, PE: 5, P: 6, M: 7 };

const ALU_BASE: Record<string, number> = { ADD: 0x80, ADC: 0x88, SUB: 0x90, SBB: 0x98, ANA: 0xa0, XRA: 0xa8, ORA: 0xb0, CMP: 0xb8 };
const IMM_OP: Record<string, number> = { ADI: 0xc6, ACI: 0xce, SUI: 0xd6, SBI: 0xde, ANI: 0xe6, XRI: 0xee, ORI: 0xf6, CPI: 0xfe };
const NO_ARG: Record<string, { op: number; t: number }> = {
  NOP: { op: 0x00, t: 4 }, RLC: { op: 0x07, t: 4 }, RRC: { op: 0x0f, t: 4 },
  RAL: { op: 0x17, t: 4 }, RAR: { op: 0x1f, t: 4 }, RIM: { op: 0x20, t: 4 },
  DAA: { op: 0x27, t: 4 }, CMA: { op: 0x2f, t: 4 }, SIM: { op: 0x30, t: 4 },
  STC: { op: 0x37, t: 4 }, CMC: { op: 0x3f, t: 4 }, HLT: { op: 0x76, t: 5 },
  RET: { op: 0xc9, t: 10 }, XTHL: { op: 0xe3, t: 16 }, PCHL: { op: 0xe9, t: 6 },
  XCHG: { op: 0xeb, t: 4 }, DI: { op: 0xf3, t: 4 }, SPHL: { op: 0xf9, t: 6 },
  EI: { op: 0xfb, t: 4 },
};

/* ---------------------------------------------------------------- helpers --- */

const lo = (v: number) => v & 0xff;
const hi = (v: number) => (v >> 8) & 0xff;
const word = (h: number, l: number) => ((h << 8) | l) & 0xffff;

/** Even parity: P is SET when the byte has an even number of 1 bits. */
function parityEven(v: number): boolean {
  let n = v & 0xff;
  let bits = 0;
  while (n) { bits += n & 1; n >>= 1; }
  return bits % 2 === 0;
}

function setSZP(st: State, v: number) {
  st.f.S = (v & 0x80) !== 0;
  st.f.Z = (v & 0xff) === 0;
  st.f.P = parityEven(v);
}

function getRP(st: State, rp: number): number {
  if (rp === 0) return word(st.reg[REG.B], st.reg[REG.C]);
  if (rp === 1) return word(st.reg[REG.D], st.reg[REG.E]);
  if (rp === 2) return word(st.reg[REG.H], st.reg[REG.L]);
  return st.SP;
}

function setRP(st: State, rp: number, v: number) {
  v &= 0xffff;
  if (rp === 0) { st.reg[REG.B] = hi(v); st.reg[REG.C] = lo(v); return; }
  if (rp === 1) { st.reg[REG.D] = hi(v); st.reg[REG.E] = lo(v); return; }
  if (rp === 2) { st.reg[REG.H] = hi(v); st.reg[REG.L] = lo(v); return; }
  st.SP = v;
}

function readMem(st: State, addr: number): number {
  return st.mem[addr & 0xffff];
}

function writeMem(st: State, addr: number, v: number) {
  st.mem[addr & 0xffff] = v & 0xff;
  st.touched.add(addr & 0xffff);
}

/** Read a register, or the byte at HL when the code is M (6). */
function readR(st: State, r: number): number {
  return r === REG.M ? readMem(st, getRP(st, 2)) : st.reg[r];
}

function writeR(st: State, r: number, v: number) {
  if (r === REG.M) writeMem(st, getRP(st, 2), v);
  else st.reg[r] = v & 0xff;
}

/* ------------------------------------------------------------- arithmetic --- */

function add8(st: State, a: number, b: number, carryIn: number) {
  const raw = a + b + carryIn;
  st.f.CY = raw > 0xff;
  st.f.AC = ((a & 0x0f) + (b & 0x0f) + carryIn) > 0x0f;
  const v = raw & 0xff;
  setSZP(st, v);
  return v;
}

/** Subtraction. CY is a BORROW (set when a < b + borrowIn), which is the 8085's
 *  own convention and the opposite of the internal adder's carry out.
 *
 *  AC here is "no borrow out of bit 3", following Gaonkar. Sources genuinely
 *  disagree about AC after a subtract, so nothing in the course asserts it. */
function sub8(st: State, a: number, b: number, borrowIn: number) {
  const raw = a - b - borrowIn;
  st.f.CY = raw < 0;
  st.f.AC = !(((a & 0x0f) - (b & 0x0f) - borrowIn) < 0);
  const v = raw & 0xff;
  setSZP(st, v);
  return v;
}

/** Decimal adjust after a BCD addition. The classic two-stage correction. */
function daa(st: State) {
  const a = st.reg[REG.A];
  let add = 0;
  let cy = st.f.CY;
  if (st.f.AC || (a & 0x0f) > 9) add |= 0x06;
  if (cy || (a >> 4) > 9 || ((a >> 4) === 9 && (a & 0x0f) > 9)) { add |= 0x60; cy = true; }
  st.f.AC = ((a & 0x0f) + (add & 0x0f)) > 0x0f;
  const raw = a + add;
  st.f.CY = cy || raw > 0xff;
  st.reg[REG.A] = raw & 0xff;
  setSZP(st, st.reg[REG.A]);
}

/** Bits of the flag register, for PUSH PSW. Bit 1 reads as 1; 3 and 5 as 0. */
function packFlags(f: Flags): number {
  return (f.S ? 0x80 : 0) | (f.Z ? 0x40 : 0) | (f.AC ? 0x10 : 0) | (f.P ? 0x04 : 0) | 0x02 | (f.CY ? 0x01 : 0);
}

function unpackFlags(v: number): Flags {
  return { S: !!(v & 0x80), Z: !!(v & 0x40), AC: !!(v & 0x10), P: !!(v & 0x04), CY: !!(v & 0x01) };
}

function testCC(f: Flags, cc: number): boolean {
  switch (cc) {
    case 0: return !f.Z;   // NZ
    case 1: return f.Z;    // Z
    case 2: return !f.CY;  // NC
    case 3: return f.CY;   // C
    case 4: return !f.P;   // PO — odd parity
    case 5: return f.P;    // PE — even parity
    case 6: return !f.S;   // P  — plus
    default: return f.S;   // M  — minus
  }
}

/* --------------------------------------------------------------- assembler --- */

export class AsmError extends Error {
  line: number;
  constructor(message: string, line: number) {
    super(message);
    this.line = line;
  }
}

/** Numbers the way an 8085 listing writes them: 2000H, 0FFH, 1010B, 25, 'A'. */
function parseNumber(tok: string, line: number, symbols: Map<string, number>): number {
  const t = tok.trim().toUpperCase();
  if (!t) throw new AsmError("a value was expected here", line);
  if (/^'.'$/.test(tok.trim())) return tok.trim().charCodeAt(1);
  if (symbols.has(t)) return symbols.get(t)!;
  let m: RegExpMatchArray | null;
  if ((m = t.match(/^([0-9][0-9A-F]*)H$/))) return parseInt(m[1], 16);
  if ((m = t.match(/^([01]+)B$/))) return parseInt(m[1], 2);
  if ((m = t.match(/^([0-7]+)O$/))) return parseInt(m[1], 8);
  if (/^\d+$/.test(t)) return parseInt(t, 10);
  // The mistake every beginner makes once. A hex literal has to START with a
  // digit, so FFH is read as a label — say so, rather than "unknown label".
  if (/^[0-9A-F]+H$/.test(t)) {
    throw new AsmError(`hex numbers must start with a digit — write 0${t} instead of ${t}`, line);
  }
  if (/^[A-Z_][A-Z0-9_]*$/.test(t)) throw new AsmError(`unknown label or value "${tok.trim()}"`, line);
  throw new AsmError(`"${tok.trim()}" is not a number the assembler understands`, line);
}

type Parsed = { line: number; label?: string; op: string; args: string[]; raw: string };

function tokenize(src: string): Parsed[] {
  const out: Parsed[] = [];
  src.split(/\r?\n/).forEach((rawLine, i) => {
    const line = i + 1;
    const noComment = rawLine.split(";")[0].trim();
    if (!noComment) return;
    let rest = noComment;
    let label: string | undefined;
    const lm = rest.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/);
    if (lm) { label = lm[1].toUpperCase(); rest = lm[2].trim(); }
    if (!rest) { out.push({ line, label, op: "", args: [], raw: rawLine }); return; }
    const sp = rest.match(/^(\S+)\s*(.*)$/)!;
    const op = sp[1].toUpperCase();
    const args = sp[2].trim() ? sp[2].split(",").map((a) => a.trim()) : [];
    out.push({ line, label, op, args, raw: rawLine });
  });
  return out;
}

/** How many bytes an instruction occupies — needed for the label pass. */
function sizeOf(p: Parsed, symbols: Map<string, number>): number {
  const { op, args, line } = p;
  if (!op) return 0;
  if (op === "ORG" || op === "EQU" || op === "END") return 0;
  if (op === "DB") return args.length;
  if (op === "DW") return args.length * 2;
  if (op === "DS") return parseNumber(args[0] ?? "", line, symbols);
  if (op in NO_ARG) return 1;
  if (op === "MOV") return 1;
  if (op === "MVI") return 2;
  if (op === "LXI") return 3;
  if (op === "INR" || op === "DCR") return 1;
  if (op === "INX" || op === "DCX" || op === "DAD") return 1;
  if (op === "PUSH" || op === "POP") return 1;
  if (op in ALU_BASE) return 1;
  if (op in IMM_OP) return 2;
  if (op === "LDA" || op === "STA" || op === "LHLD" || op === "SHLD") return 3;
  if (op === "LDAX" || op === "STAX") return 1;
  if (op === "JMP" || op === "CALL") return 3;
  if (/^J(NZ|Z|NC|C|PO|PE|P|M)$/.test(op)) return 3;
  if (/^C(NZ|Z|NC|C|PO|PE|P|M)$/.test(op)) return 3;
  if (/^R(NZ|Z|NC|C|PO|PE|P|M)$/.test(op)) return 1;
  if (op === "IN" || op === "OUT") return 2;
  if (op === "RST") return 1;
  throw new AsmError(`unknown instruction "${op}"`, line);
}

function reg(tok: string, line: number): number {
  const r = REG[(tok ?? "").trim().toUpperCase()];
  if (r === undefined) throw new AsmError(`"${tok}" is not a register (use B C D E H L M A)`, line);
  return r;
}

function rp(tok: string, line: number, table = RP): number {
  const v = table[(tok ?? "").trim().toUpperCase()];
  if (v === undefined) throw new AsmError(`"${tok}" is not a valid register pair here`, line);
  return v;
}

/** Assemble source into machine code plus an executable instruction map. */
export function assemble(src: string, origin = 0x2000) {
  const parsed = tokenize(src);
  const symbols = new Map<string, number>();

  // Pass 0: EQU, so a label pass can resolve constants used in DS/ORG.
  for (const p of parsed) {
    if (p.op === "EQU") {
      if (!p.label) throw new AsmError("EQU needs a label in front of it", p.line);
      symbols.set(p.label, parseNumber(p.args[0] ?? "", p.line, symbols));
    }
  }

  // Pass 1: addresses for every label.
  let pc = origin;
  for (const p of parsed) {
    if (p.op === "ORG") { pc = parseNumber(p.args[0] ?? "", p.line, symbols); continue; }
    if (p.op === "EQU") continue;
    if (p.label) {
      if (symbols.has(p.label) && p.op !== "EQU") throw new AsmError(`label "${p.label}" is defined twice`, p.line);
      symbols.set(p.label, pc);
    }
    pc += sizeOf(p, symbols);
  }

  // Pass 2: emit bytes and build the executable instruction map.
  const code = new Map<number, number>();
  const instrs = new Map<number, Instr>();
  pc = origin;
  let start = origin;
  let sawOrg = false;

  const emit = (addr: number, bytes: number[]) => bytes.forEach((b, i) => code.set(addr + i, b & 0xff));

  for (const p of parsed) {
    const { op, args, line } = p;
    if (op === "EQU" || op === "END" || !op) continue;
    if (op === "ORG") {
      pc = parseNumber(args[0] ?? "", line, symbols);
      if (!sawOrg) { start = pc; sawOrg = true; }
      continue;
    }
    const at = pc;
    const num = (i: number) => parseNumber(args[i] ?? "", line, symbols);

    if (op === "DB") { emit(at, args.map((_, i) => num(i) & 0xff)); pc += args.length; continue; }
    if (op === "DW") {
      const bytes: number[] = [];
      args.forEach((_, i) => { const v = num(i); bytes.push(lo(v), hi(v)); });
      emit(at, bytes); pc += bytes.length; continue;
    }
    if (op === "DS") { pc += num(0); continue; }

    const push = (bytes: number[], t: number | ((st: State) => number), exec: (st: State) => void) => {
      emit(at, bytes);
      instrs.set(at, {
        addr: at, line, text: p.raw.trim(), bytes,
        exec: (st) => { exec(st); return typeof t === "number" ? t : t(st); },
      });
      pc += bytes.length;
    };

    if (op in NO_ARG) {
      const { op: code0, t } = NO_ARG[op];
      push([code0], t, (st) => {
        switch (op) {
          case "NOP": break;
          case "HLT": st.halted = true; break;
          case "CMA": st.reg[REG.A] = ~st.reg[REG.A] & 0xff; break;
          case "STC": st.f.CY = true; break;
          case "CMC": st.f.CY = !st.f.CY; break;
          case "DAA": daa(st); break;
          case "XCHG": {
            const h = st.reg[REG.H], l = st.reg[REG.L];
            st.reg[REG.H] = st.reg[REG.D]; st.reg[REG.L] = st.reg[REG.E];
            st.reg[REG.D] = h; st.reg[REG.E] = l;
            break;
          }
          case "RLC": {
            const a = st.reg[REG.A];
            st.f.CY = (a & 0x80) !== 0;
            st.reg[REG.A] = ((a << 1) | (a >> 7)) & 0xff;
            break;
          }
          case "RRC": {
            const a = st.reg[REG.A];
            st.f.CY = (a & 0x01) !== 0;
            st.reg[REG.A] = ((a >> 1) | (a << 7)) & 0xff;
            break;
          }
          case "RAL": {
            const a = st.reg[REG.A], old = st.f.CY ? 1 : 0;
            st.f.CY = (a & 0x80) !== 0;
            st.reg[REG.A] = ((a << 1) | old) & 0xff;
            break;
          }
          case "RAR": {
            const a = st.reg[REG.A], old = st.f.CY ? 0x80 : 0;
            st.f.CY = (a & 0x01) !== 0;
            st.reg[REG.A] = ((a >> 1) | old) & 0xff;
            break;
          }
          case "RET": { st.PC = word(readMem(st, st.SP + 1), readMem(st, st.SP)); st.SP = (st.SP + 2) & 0xffff; break; }
          case "PCHL": st.PC = getRP(st, 2); break;
          case "SPHL": st.SP = getRP(st, 2); break;
          case "XTHL": {
            const l = readMem(st, st.SP), h = readMem(st, st.SP + 1);
            writeMem(st, st.SP, st.reg[REG.L]); writeMem(st, st.SP + 1, st.reg[REG.H]);
            st.reg[REG.L] = l; st.reg[REG.H] = h;
            break;
          }
          case "EI": case "DI": case "RIM": case "SIM": break;
        }
      });
      continue;
    }

    if (op === "MOV") {
      const d = reg(args[0], line), s = reg(args[1], line);
      if (d === REG.M && s === REG.M) throw new AsmError("MOV M, M is not an instruction — that opcode is HLT", line);
      push([0x40 | (d << 3) | s], d === REG.M || s === REG.M ? 7 : 4, (st) => writeR(st, d, readR(st, s)));
      continue;
    }
    if (op === "MVI") {
      const d = reg(args[0], line), v = num(1);
      push([0x06 | (d << 3), v & 0xff], d === REG.M ? 10 : 7, (st) => writeR(st, d, v));
      continue;
    }
    if (op === "LXI") {
      const p0 = rp(args[0], line), v = num(1);
      push([0x01 | (p0 << 4), lo(v), hi(v)], 10, (st) => setRP(st, p0, v));
      continue;
    }
    if (op === "INR" || op === "DCR") {
      const d = reg(args[0], line);
      const delta = op === "INR" ? 1 : -1;
      push([(op === "INR" ? 0x04 : 0x05) | (d << 3)], d === REG.M ? 10 : 4, (st) => {
        const before = readR(st, d);
        const v = (before + delta) & 0xff;
        // INR and DCR touch S, Z, AC and P — and deliberately NOT CY. That
        // exception is examined more often than the instructions themselves.
        st.f.AC = op === "INR" ? (before & 0x0f) === 0x0f : (before & 0x0f) === 0x00;
        setSZP(st, v);
        writeR(st, d, v);
      });
      continue;
    }
    if (op === "INX" || op === "DCX") {
      const p0 = rp(args[0], line);
      push([(op === "INX" ? 0x03 : 0x0b) | (p0 << 4)], 6, (st) =>
        setRP(st, p0, getRP(st, p0) + (op === "INX" ? 1 : -1)));  // no flags, by design
      continue;
    }
    if (op === "DAD") {
      const p0 = rp(args[0], line);
      push([0x09 | (p0 << 4)], 10, (st) => {
        const sum = getRP(st, 2) + getRP(st, p0);
        st.f.CY = sum > 0xffff;   // DAD touches CY and nothing else
        setRP(st, 2, sum);
      });
      continue;
    }
    if (op === "PUSH" || op === "POP") {
      const p0 = rp(args[0], line, RP_PUSH);
      if (op === "PUSH") {
        push([0xc5 | (p0 << 4)], 12, (st) => {
          const v = p0 === 3 ? word(st.reg[REG.A], packFlags(st.f)) : getRP(st, p0);
          writeMem(st, st.SP - 1, hi(v));
          writeMem(st, st.SP - 2, lo(v));
          st.SP = (st.SP - 2) & 0xffff;
        });
      } else {
        push([0xc1 | (p0 << 4)], 10, (st) => {
          const l = readMem(st, st.SP), h = readMem(st, st.SP + 1);
          if (p0 === 3) { st.reg[REG.A] = h; st.f = unpackFlags(l); }
          else setRP(st, p0, word(h, l));
          st.SP = (st.SP + 2) & 0xffff;
        });
      }
      continue;
    }
    if (op in ALU_BASE) {
      const s = reg(args[0], line);
      push([ALU_BASE[op] | s], s === REG.M ? 7 : 4, (st) => aluOp(st, op, readR(st, s)));
      continue;
    }
    if (op in IMM_OP) {
      const v = num(0);
      const base = { ADI: "ADD", ACI: "ADC", SUI: "SUB", SBI: "SBB", ANI: "ANA", XRI: "XRA", ORI: "ORA", CPI: "CMP" }[op]!;
      push([IMM_OP[op], v & 0xff], 7, (st) => aluOp(st, base, v & 0xff));
      continue;
    }
    if (op === "LDA" || op === "STA") {
      const a = num(0);
      push([op === "LDA" ? 0x3a : 0x32, lo(a), hi(a)], 13, (st) => {
        if (op === "LDA") st.reg[REG.A] = readMem(st, a);
        else writeMem(st, a, st.reg[REG.A]);
      });
      continue;
    }
    if (op === "LHLD" || op === "SHLD") {
      const a = num(0);
      push([op === "LHLD" ? 0x2a : 0x22, lo(a), hi(a)], 16, (st) => {
        if (op === "LHLD") { st.reg[REG.L] = readMem(st, a); st.reg[REG.H] = readMem(st, a + 1); }
        else { writeMem(st, a, st.reg[REG.L]); writeMem(st, a + 1, st.reg[REG.H]); }
      });
      continue;
    }
    if (op === "LDAX" || op === "STAX") {
      const p0 = rp(args[0], line);
      if (p0 > 1) throw new AsmError(`${op} only works with B or D`, line);
      push([(op === "LDAX" ? 0x0a : 0x02) | (p0 << 4)], 7, (st) => {
        const a = getRP(st, p0);
        if (op === "LDAX") st.reg[REG.A] = readMem(st, a);
        else writeMem(st, a, st.reg[REG.A]);
      });
      continue;
    }
    if (op === "JMP" || /^J(NZ|Z|NC|C|PO|PE|P|M)$/.test(op)) {
      const a = num(0);
      const cc = op === "JMP" ? -1 : CC[op.slice(1)];
      push([op === "JMP" ? 0xc3 : 0xc2 | (cc << 3), lo(a), hi(a)],
        (st) => (cc < 0 || testCC(st.f, cc) ? 10 : 7),
        (st) => { if (cc < 0 || testCC(st.f, cc)) st.PC = a; });
      continue;
    }
    if (op === "CALL" || /^C(NZ|Z|NC|C|PO|PE|P|M)$/.test(op)) {
      const a = num(0);
      const cc = op === "CALL" ? -1 : CC[op.slice(1)];
      const size = 3;
      push([op === "CALL" ? 0xcd : 0xc4 | (cc << 3), lo(a), hi(a)],
        (st) => (cc < 0 || testCC(st.f, cc) ? 18 : 9),
        (st) => {
          if (cc >= 0 && !testCC(st.f, cc)) return;
          const ret = (at + size) & 0xffff;
          writeMem(st, st.SP - 1, hi(ret));
          writeMem(st, st.SP - 2, lo(ret));
          st.SP = (st.SP - 2) & 0xffff;
          st.PC = a;
        });
      continue;
    }
    if (/^R(NZ|Z|NC|C|PO|PE|P|M)$/.test(op)) {
      const cc = CC[op.slice(1)];
      push([0xc0 | (cc << 3)],
        (st) => (testCC(st.f, cc) ? 12 : 6),
        (st) => {
          if (!testCC(st.f, cc)) return;
          st.PC = word(readMem(st, st.SP + 1), readMem(st, st.SP));
          st.SP = (st.SP + 2) & 0xffff;
        });
      continue;
    }
    if (op === "IN" || op === "OUT") {
      const port = num(0) & 0xff;
      push([op === "IN" ? 0xdb : 0xd3, port], 10, (st) => {
        if (op === "OUT") st.ports.push([port, st.reg[REG.A]]);
        else st.reg[REG.A] = (st.inputs[port] ?? 0) & 0xff;
      });
      continue;
    }
    if (op === "RST") {
      const n = num(0);
      if (n < 0 || n > 7) throw new AsmError("RST takes 0 to 7", line);
      push([0xc7 | (n << 3)], 12, (st) => {
        const ret = (at + 1) & 0xffff;
        writeMem(st, st.SP - 1, hi(ret));
        writeMem(st, st.SP - 2, lo(ret));
        st.SP = (st.SP - 2) & 0xffff;
        st.PC = n * 8;
      });
      continue;
    }
    throw new AsmError(`unknown instruction "${op}"`, line);
  }

  return { code, instrs, symbols, start };
}

function aluOp(st: State, op: string, b: number) {
  const a = st.reg[REG.A];
  switch (op) {
    case "ADD": st.reg[REG.A] = add8(st, a, b, 0); break;
    case "ADC": st.reg[REG.A] = add8(st, a, b, st.f.CY ? 1 : 0); break;
    case "SUB": st.reg[REG.A] = sub8(st, a, b, 0); break;
    case "SBB": st.reg[REG.A] = sub8(st, a, b, st.f.CY ? 1 : 0); break;
    // ANA is the 8085 oddity: it SETS AC and clears CY, whatever the operands.
    case "ANA": st.reg[REG.A] = a & b; st.f.CY = false; st.f.AC = true; setSZP(st, st.reg[REG.A]); break;
    case "XRA": st.reg[REG.A] = a ^ b; st.f.CY = false; st.f.AC = false; setSZP(st, st.reg[REG.A]); break;
    case "ORA": st.reg[REG.A] = a | b; st.f.CY = false; st.f.AC = false; setSZP(st, st.reg[REG.A]); break;
    // CMP is SUB with the answer thrown away — only the flags survive.
    case "CMP": sub8(st, a, b, 0); break;
  }
}

/* ---------------------------------------------------------------- runtime --- */

export type RunOptions = {
  /** Bytes to place in memory before the program starts, address -> value. */
  memory?: Record<number, number>;
  /** Where the program is assembled and where execution begins. */
  origin?: number;
  /** Initial stack pointer. Programs that PUSH without LXI SP rely on this. */
  sp?: number;
  /** Safety net for a loop that never ends. */
  maxSteps?: number;
  /** What IN reads from each port. Anything not listed reads as 00. */
  inputs?: Record<number, number>;
};

const BLANK_FLAGS = (): Flags => ({ S: false, Z: false, AC: false, P: false, CY: false });

/** Assemble and run a program to HLT, and report everything a lesson can claim. */
export function run(src: string, opts: RunOptions = {}): RunResult {
  const origin = opts.origin ?? 0x2000;
  const maxSteps = opts.maxSteps ?? 200000;

  const blank = (): RunResult => ({
    ok: false,
    regs: { A: 0, B: 0, C: 0, D: 0, E: 0, H: 0, L: 0, SP: opts.sp ?? 0xffff, PC: origin },
    flags: BLANK_FLAGS(), memory: {}, tStates: 0, steps: 0, ports: [], halted: false, code: {},
  });

  let asm;
  try {
    asm = assemble(src, origin);
  } catch (e) {
    const r = blank();
    if (e instanceof AsmError) { r.error = e.message; r.line = e.line; }
    else r.error = e instanceof Error ? e.message : String(e);
    return r;
  }

  const st: State = {
    reg: new Uint8Array(8),
    mem: new Uint8Array(65536),
    f: BLANK_FLAGS(),
    SP: opts.sp ?? 0xffff,
    PC: asm.start,
    halted: false,
    ports: [],
    touched: new Set<number>(),
    inputs: opts.inputs ?? {},
  };

  // The assembled bytes are really in memory, so a program is free to read its
  // own code — and a lesson can show the opcodes at 2000H and be telling the truth.
  for (const [addr, b] of asm.code) st.mem[addr & 0xffff] = b;
  for (const [addr, v] of Object.entries(opts.memory ?? {})) {
    const a = Number(addr) & 0xffff;
    st.mem[a] = Number(v) & 0xff;
    st.touched.add(a);
  }

  let tStates = 0;
  let steps = 0;
  let error: string | undefined;
  let line: number | undefined;

  while (!st.halted) {
    const ins = asm.instrs.get(st.PC);
    if (!ins) {
      error = `there is no instruction at address ${st.PC.toString(16).toUpperCase().padStart(4, "0")}H — execution ran past the end of the program (did you forget HLT?)`;
      break;
    }
    if (steps >= maxSteps) {
      error = `the program ran for ${maxSteps} instructions without reaching HLT — check for a loop that never ends`;
      line = ins.line;
      break;
    }
    st.PC = (st.PC + ins.bytes.length) & 0xffff;
    try {
      tStates += ins.exec(st);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      line = ins.line;
      break;
    }
    steps++;
  }

  const memory: Record<number, number> = {};
  for (const a of [...st.touched].sort((x, y) => x - y)) memory[a] = st.mem[a];

  const code: Record<number, number> = {};
  for (const [a, b] of [...asm.code.entries()].sort((x, y) => x[0] - y[0])) code[a] = b;

  return {
    ok: !error,
    error, line,
    regs: {
      A: st.reg[REG.A], B: st.reg[REG.B], C: st.reg[REG.C], D: st.reg[REG.D],
      E: st.reg[REG.E], H: st.reg[REG.H], L: st.reg[REG.L], SP: st.SP, PC: st.PC,
    },
    flags: { ...st.f },
    memory, tStates, steps, ports: st.ports, halted: st.halted, code,
  };
}

/* ------------------------------------------------------------- formatting --- */

export const hex2 = (v: number) => (v & 0xff).toString(16).toUpperCase().padStart(2, "0");
export const hex4 = (v: number) => (v & 0xffff).toString(16).toUpperCase().padStart(4, "0");

/** Format exactly the parts of the machine a lesson is talking about.
 *
 *  A snippet that teaches DCR should claim "B=00 Z=1", not a dump of all seven
 *  registers — the noise is what stops a student noticing the one value that
 *  matters. So a code block names what it wants and this prints that, in order:
 *
 *    A B C D E H L      one byte, hex        -> A=0A
 *    BC DE HL SP PC     two bytes, hex       -> HL=2050
 *    S Z AC P CY        one bit              -> CY=1
 *    T                  total T-states       -> T=79
 *    STEPS              instructions run     -> STEPS=12
 *    M:2060             a byte of memory     -> [2060]=F0
 *    M:2050-2054        a run of memory      -> [2050..2054]=10 20 30 40 50
 *    OUT                everything OUT wrote -> OUT 01=7F
 */
export function formatState(r: RunResult, show: string[]): string {
  if (!r.ok) return `ERROR${r.line ? ` (line ${r.line})` : ""}: ${r.error}`;
  const one: Record<string, number> = { A: r.regs.A, B: r.regs.B, C: r.regs.C, D: r.regs.D, E: r.regs.E, H: r.regs.H, L: r.regs.L };
  const pair: Record<string, number> = {
    BC: (r.regs.B << 8) | r.regs.C, DE: (r.regs.D << 8) | r.regs.E,
    HL: (r.regs.H << 8) | r.regs.L, SP: r.regs.SP, PC: r.regs.PC,
  };
  const bit: Record<string, boolean> = { S: r.flags.S, Z: r.flags.Z, AC: r.flags.AC, P: r.flags.P, CY: r.flags.CY };

  return show.map((raw) => {
    const k = raw.trim().toUpperCase();
    if (k in one) return `${k}=${hex2(one[k])}`;
    if (k in pair) return `${k}=${hex4(pair[k])}`;
    if (k in bit) return `${k}=${bit[k] ? 1 : 0}`;
    if (k === "T") return `T=${r.tStates}`;
    if (k === "STEPS") return `STEPS=${r.steps}`;
    if (k === "OUT") return r.ports.length ? r.ports.map(([p, v]) => `OUT ${hex2(p)}=${hex2(v)}`).join(" ") : "OUT none";
    const range = k.match(/^M:([0-9A-F]+)-([0-9A-F]+)$/);
    if (range) {
      const from = parseInt(range[1], 16);
      const to = parseInt(range[2], 16);
      const cells: string[] = [];
      for (let a = from; a <= to; a++) cells.push(hex2(r.memory[a] ?? 0));
      return `[${hex4(from)}..${hex4(to)}]=${cells.join(" ")}`;
    }
    const cell = k.match(/^M:([0-9A-F]+)$/);
    if (cell) {
      const a = parseInt(cell[1], 16);
      return `[${hex4(a)}]=${hex2(r.memory[a] ?? 0)}`;
    }
    return `?${raw}`;
  }).join(" ");
}

/** The one-line summary a lesson claims and verify:lesson checks. */
export function summarise(r: RunResult): string {
  if (!r.ok) return `ERROR${r.line ? ` (line ${r.line})` : ""}: ${r.error}`;
  const f = r.flags;
  return [
    `A=${hex2(r.regs.A)} B=${hex2(r.regs.B)} C=${hex2(r.regs.C)} D=${hex2(r.regs.D)} E=${hex2(r.regs.E)} H=${hex2(r.regs.H)} L=${hex2(r.regs.L)}`,
    `S=${+f.S} Z=${+f.Z} AC=${+f.AC} P=${+f.P} CY=${+f.CY}`,
    `T-states=${r.tStates}`,
  ].join("\n");
}
