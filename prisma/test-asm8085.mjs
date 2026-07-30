// Tests for the 8085 simulator. `npm run test:8085`
//
// Every expected value here was worked out by hand from the instruction set
// before the code was run, not read off the simulator afterwards — otherwise the
// suite would only prove the simulator agrees with itself.
//
// The flag cases are the ones that matter most, because they are what students
// get asked and what a simulator most easily gets subtly wrong: INR leaving CY
// alone, INX touching nothing, DAD touching only CY, ANA setting AC, CY meaning
// BORROW after a subtract.

import { run, assemble, disassemble, hex2, hex4 } from "../lib/asm8085.ts";

let pass = 0;
const fails = [];

function check(what, got, want) {
  const g = JSON.stringify(got);
  const w = JSON.stringify(want);
  if (g === w) { pass++; return; }
  fails.push(`${what}\n        expected ${w}\n        actual   ${g}`);
}

/** Run a program and check a set of register/flag/memory expectations. */
function prog(what, src, want, opts = {}) {
  const r = run(src, opts);
  if (!r.ok) { fails.push(`${what}\n        did not run: ${r.error}${r.line ? ` (line ${r.line})` : ""}`); return r; }
  for (const [k, v] of Object.entries(want)) {
    if (k === "flags") { for (const [fk, fv] of Object.entries(v)) check(`${what} — flag ${fk}`, r.flags[fk], fv); }
    else if (k === "mem") { for (const [a, mv] of Object.entries(v)) check(`${what} — memory ${hex4(Number(a))}H`, r.memory[Number(a)], mv); }
    else if (k === "T") check(`${what} — T-states`, r.tStates, v);
    else check(`${what} — ${k}`, r.regs[k], v);
  }
  return r;
}

/* ------------------------------------------------- opcodes a student hand-assembles --- */
{
  const cases = [
    ["MOV A, B", [0x78]], ["MOV B, M", [0x46]], ["MOV M, A", [0x77]],
    ["MVI A, 05H", [0x3e, 0x05]], ["MVI M, 0FFH", [0x36, 0xff]],
    ["LXI H, 2050H", [0x21, 0x50, 0x20]], ["LXI SP, 2400H", [0x31, 0x00, 0x24]],
    ["ADD B", [0x80]], ["ADD M", [0x86]], ["SUB C", [0x91]], ["ANA D", [0xa2]],
    ["XRA A", [0xaf]], ["ORA E", [0xb3]], ["CMP M", [0xbe]],
    ["ADI 07H", [0xc6, 0x07]], ["CPI 64H", [0xfe, 0x64]],
    ["INR A", [0x3c]], ["DCR C", [0x0d]], ["INR M", [0x34]],
    ["INX H", [0x23]], ["DCX B", [0x0b]], ["DAD B", [0x09]],
    ["LDA 2050H", [0x3a, 0x50, 0x20]], ["STA 2060H", [0x32, 0x60, 0x20]],
    ["LHLD 2050H", [0x2a, 0x50, 0x20]], ["SHLD 2050H", [0x22, 0x50, 0x20]],
    ["LDAX D", [0x1a]], ["STAX B", [0x02]],
    ["JMP 2010H", [0xc3, 0x10, 0x20]], ["JNZ 2010H", [0xc2, 0x10, 0x20]],
    ["JZ 2010H", [0xca, 0x10, 0x20]], ["JC 2010H", [0xda, 0x10, 0x20]],
    ["JNC 2010H", [0xd2, 0x10, 0x20]], ["JM 2010H", [0xfa, 0x10, 0x20]],
    ["JP 2010H", [0xf2, 0x10, 0x20]], ["JPE 2010H", [0xea, 0x10, 0x20]], ["JPO 2010H", [0xe2, 0x10, 0x20]],
    ["CALL 2100H", [0xcd, 0x00, 0x21]], ["CZ 2100H", [0xcc, 0x00, 0x21]], ["RET", [0xc9]], ["RZ", [0xc8]],
    ["PUSH B", [0xc5]], ["PUSH PSW", [0xf5]], ["POP H", [0xe1]], ["POP PSW", [0xf1]],
    ["RLC", [0x07]], ["RRC", [0x0f]], ["RAL", [0x17]], ["RAR", [0x1f]],
    ["DAA", [0x27]], ["CMA", [0x2f]], ["STC", [0x37]], ["CMC", [0x3f]],
    ["XCHG", [0xeb]], ["XTHL", [0xe3]], ["SPHL", [0xf9]], ["PCHL", [0xe9]],
    ["NOP", [0x00]], ["HLT", [0x76]], ["EI", [0xfb]], ["DI", [0xf3]],
    ["IN 01H", [0xdb, 0x01]], ["OUT 02H", [0xd3, 0x02]], ["RST 5", [0xef]],
  ];
  for (const [src, want] of cases) {
    const a = assemble(src + "\nHLT");
    const got = want.map((_, i) => a.code.get(0x2000 + i));
    check(`opcode ${src}`, got.map(hex2), want.map(hex2));
  }

  // Round-trip: assemble it, decode the bytes back, and the text must be what we
  // started with. This is the real check on the disassembler — it shares no table
  // with the assembler, only the same encoding formulas, so agreeing across all
  // sixty-odd forms means both are reading the 8085's opcode map the same way.
  for (const [src, want] of cases) {
    const d = disassemble(want, 0);
    check(`round-trip ${src}`, [d.text, d.length], [src, want.length]);
  }
}

/* --------------------------------------------------------------------- flags --- */

// 0F + 01 = 10. Carry out of bit 3, so AC is set; no carry out of bit 7.
// 10H is one 1-bit — odd — so P is reset.
prog("ADI sets AC", "MVI A, 0FH\nADI 01H\nHLT",
  { A: 0x10, flags: { CY: false, AC: true, Z: false, S: false, P: false } });

// FF + 01 wraps to 00: carry out of both bit 3 and bit 7, and the result is zero.
prog("ADI wraps to zero", "MVI A, 0FFH\nADI 01H\nHLT",
  { A: 0x00, flags: { CY: true, AC: true, Z: true, S: false, P: true } });

// 80 + 80: carry out of bit 7, nothing out of bit 3.
prog("ADD A doubles into carry", "MVI A, 80H\nADD A\nHLT",
  { A: 0x00, flags: { CY: true, AC: false, Z: true, S: false, P: true } });

// 05 - 0A borrows. FB is 11111011 — seven 1-bits, odd, so P is reset.
prog("SUI borrows", "MVI A, 05H\nSUI 0AH\nHLT",
  { A: 0xfb, flags: { CY: true, Z: false, S: true, P: false } });

// CMP is a subtract with the answer discarded — A must survive unchanged.
prog("CPI equal", "MVI A, 05H\nCPI 05H\nHLT", { A: 0x05, flags: { Z: true, CY: false } });
prog("CPI smaller", "MVI A, 05H\nCPI 0AH\nHLT", { A: 0x05, flags: { Z: false, CY: true } });
prog("CPI larger", "MVI A, 0AH\nCPI 05H\nHLT", { A: 0x0a, flags: { Z: false, CY: false } });

// The exception that gets examined: INR and DCR do NOT touch the carry flag.
//
// Each of these needs BOTH directions, and the first draft of this file only had
// one. Starting from CY=1 proves the instruction does not clear the flag; it does
// not prove the instruction never sets it, because a wrong implementation that
// derives CY from a zero result gives the same answer. A canary that broke INR
// on purpose slipped through until the CY=0 cases below were added.
prog("INR does not clear CY", "STC\nMVI A, 0FFH\nINR A\nHLT",
  { A: 0x00, flags: { Z: true, CY: true } });
prog("INR does not set CY when it wraps", "XRA A\nMVI A, 0FFH\nINR A\nHLT",
  { A: 0x00, flags: { Z: true, CY: false } });
prog("DCR does not clear CY", "STC\nMVI B, 01H\nDCR B\nHLT",
  { B: 0x00, flags: { Z: true, CY: true } });
prog("DCR does not set CY when it borrows", "XRA A\nMVI B, 00H\nDCR B\nHLT",
  { B: 0xff, flags: { Z: false, S: true, CY: false } });

// INX and DCX touch no flags at all — not even Z, which is the trap. Start from
// Z=0 and P=0, so an implementation that wrongly set flags from the 0000 result
// would flip both and be caught. (ORA A leaves A=01: not zero, one 1-bit, so odd.)
prog("INX touches no flags", "MVI A, 01H\nORA A\nLXI H, 0FFFFH\nINX H\nHLT",
  { H: 0x00, L: 0x00, flags: { Z: false, P: false, S: false, CY: false } });
prog("DCX touches no flags", "MVI A, 01H\nORA A\nLXI B, 0000H\nDCX B\nHLT",
  { B: 0xff, C: 0xff, flags: { Z: false, P: false, CY: false } });

// DAD touches CY and nothing else — same reasoning, so the result is 0000 while
// Z, P, S and AC must all stay where ORA A left them.
prog("DAD sets only CY", "MVI A, 01H\nORA A\nLXI H, 0FFFFH\nLXI B, 0001H\nDAD B\nHLT",
  { H: 0x00, L: 0x00, flags: { CY: true, Z: false, P: false, S: false, AC: false } });
prog("DAD adds 16 bits", "LXI H, 1234H\nLXI D, 1111H\nDAD D\nHLT",
  { H: 0x23, L: 0x45, flags: { CY: false } });

// The 8085 oddity: ANA always sets AC and always clears CY.
prog("ANI sets AC and clears CY", "STC\nMVI A, 0FFH\nANI 0F0H\nHLT",
  { A: 0xf0, flags: { CY: false, AC: true, S: true, Z: false, P: true } });
prog("ORA clears CY and AC", "STC\nMVI A, 0F0H\nORI 0FH\nHLT",
  { A: 0xff, flags: { CY: false, AC: false, S: true, P: true } });
prog("XRA A is the idiomatic clear", "MVI A, 55H\nSTC\nXRA A\nHLT",
  { A: 0x00, flags: { Z: true, CY: false, AC: false, P: true } });

/* -------------------------------------------------------------------- rotates --- */

prog("RLC", "MVI A, 80H\nRLC\nHLT", { A: 0x01, flags: { CY: true } });
prog("RRC", "MVI A, 01H\nRRC\nHLT", { A: 0x80, flags: { CY: true } });
prog("RAL through carry", "STC\nMVI A, 80H\nRAL\nHLT", { A: 0x01, flags: { CY: true } });
prog("RAR through carry", "STC\nMVI A, 01H\nRAR\nHLT", { A: 0x80, flags: { CY: true } });
prog("CMA", "MVI A, 0AAH\nCMA\nHLT", { A: 0x55 });

/* ------------------------------------------------------------------------ DAA --- */

// 38 + 45 = 7D in binary. The low nibble D is above 9, so DAA adds 06 to give 83
// — which is 38 + 45 done in decimal.
prog("DAA corrects the low nibble", "MVI A, 38H\nADI 45H\nDAA\nHLT",
  { A: 0x83, flags: { CY: false } });

// 88 + 88 = 110H. DAA adds 06 (AC set) then 60 (carry), giving 76 with CY — which
// is 88 + 88 = 176 in decimal, the 1 living in the carry flag.
prog("DAA carries out of the high nibble", "MVI A, 88H\nADI 88H\nDAA\nHLT",
  { A: 0x76, flags: { CY: true } });

/* ---------------------------------------------------------- memory and pairs --- */

prog("MOV through M", "LXI H, 2050H\nMVI M, 42H\nMOV B, M\nHLT",
  { B: 0x42, mem: { 0x2050: 0x42 } });
prog("LDA and STA", "LDA 2050H\nSTA 2060H\nHLT",
  { A: 0x37, mem: { 0x2060: 0x37 } }, { memory: { 0x2050: 0x37 } });
prog("LHLD is little-endian", "LHLD 2050H\nHLT",
  { L: 0x34, H: 0x12 }, { memory: { 0x2050: 0x34, 0x2051: 0x12 } });
prog("SHLD is little-endian", "LXI H, 1234H\nSHLD 2050H\nHLT",
  { mem: { 0x2050: 0x34, 0x2051: 0x12 } });
prog("XCHG swaps HL and DE", "LXI H, 1122H\nLXI D, 3344H\nXCHG\nHLT",
  { H: 0x33, L: 0x44, D: 0x11, E: 0x22 });
prog("LDAX D", "LXI D, 2050H\nLDAX D\nHLT", { A: 0x99 }, { memory: { 0x2050: 0x99 } });

/* ----------------------------------------------------------- stack and calls --- */

prog("PUSH then POP round-trips", "LXI SP, 2400H\nLXI H, 1234H\nPUSH H\nLXI H, 0000H\nPOP H\nHLT",
  { H: 0x12, L: 0x34, SP: 0x2400, mem: { 0x23ff: 0x12, 0x23fe: 0x34 } });

// PUSH PSW stores A at the higher address and the flag byte at the lower one.
// With only CY set, the flag byte is 03H — bit 1 always reads as 1.
prog("PUSH PSW packs the flags", "LXI SP, 2400H\nMVI A, 0AAH\nSTC\nPUSH PSW\nPOP B\nHLT",
  { B: 0xaa, C: 0x03 });

prog("CALL and RET", [
  "        LXI SP, 2400H",
  "        MVI A, 05H",
  "        CALL DOUBLE",
  "        HLT",
  "DOUBLE: ADD A",
  "        RET",
].join("\n"), { A: 0x0a, SP: 0x2400 });

prog("nested CALL", [
  "        LXI SP, 2400H",
  "        MVI A, 01H",
  "        CALL OUTER",
  "        HLT",
  "OUTER:  ADD A",
  "        CALL INNER",
  "        RET",
  "INNER:  ADD A",
  "        RET",
].join("\n"), { A: 0x04, SP: 0x2400 });

prog("conditional call not taken", [
  "        LXI SP, 2400H",
  "        MVI A, 01H",
  "        CPI 01H",
  "        CNZ BUMP",
  "        HLT",
  "BUMP:   MVI A, 0FFH",
  "        RET",
].join("\n"), { A: 0x01 });

/* ---------------------------------------------------------- T-state counting --- */

// The delay loop every syllabus asks about.
//   MVI C, 05H   7
//   DCR C        4, five times                 =  20
//   JNZ          10 taken x4, 7 not taken x1   =  47
//   HLT          5
// 7 + 20 + 47 + 5 = 79
prog("delay loop T-states", [
  "        MVI C, 05H",
  "LOOP:   DCR C",
  "        JNZ LOOP",
  "        HLT",
].join("\n"), { C: 0x00, T: 79 });

// CALL 18 + ADD A 4 + RET 10 + the MVI 7 + HLT 5 = 44
prog("CALL and RET T-states", [
  "        MVI A, 05H",
  "        CALL DOUBLE",
  "        HLT",
  "DOUBLE: ADD A",
  "        RET",
].join("\n"), { T: 44 });

/* ------------------------------------------------------------- real programs --- */

// Sum five bytes. 10+20+30+40+50 in hex is F0, with no carry out.
prog("sum of a block", [
  "        LXI H, 2050H",
  "        MVI C, 05H",
  "        XRA A",
  "LOOP:   ADD M",
  "        INX H",
  "        DCR C",
  "        JNZ LOOP",
  "        STA 2060H",
  "        HLT",
].join("\n"), { A: 0xf0, mem: { 0x2060: 0xf0 } },
  { memory: { 0x2050: 0x10, 0x2051: 0x20, 0x2052: 0x30, 0x2053: 0x40, 0x2054: 0x50 } });

// Largest of four numbers: 05, 09, 03, 07 -> 09.
prog("largest in a block", [
  "        LXI H, 2050H",
  "        MOV C, M",
  "        DCR C",
  "        INX H",
  "        MOV A, M",
  "LOOP:   INX H",
  "        CMP M",
  "        JNC SKIP",
  "        MOV A, M",
  "SKIP:   DCR C",
  "        JNZ LOOP",
  "        STA 2060H",
  "        HLT",
].join("\n"), { A: 0x09, mem: { 0x2060: 0x09 } },
  { memory: { 0x2050: 0x04, 0x2051: 0x05, 0x2052: 0x09, 0x2053: 0x03, 0x2054: 0x07 } });

// Copy three bytes from 2050H to 2060H.
prog("block transfer", [
  "        LXI H, 2050H",
  "        LXI D, 2060H",
  "        MVI C, 03H",
  "LOOP:   MOV A, M",
  "        STAX D",
  "        INX H",
  "        INX D",
  "        DCR C",
  "        JNZ LOOP",
  "        HLT",
].join("\n"), { mem: { 0x2060: 0xaa, 0x2061: 0xbb, 0x2062: 0xcc } },
  { memory: { 0x2050: 0xaa, 0x2051: 0xbb, 0x2052: 0xcc } });

// 16-bit addition through the carry: 1234 + 0FFF = 2233.
prog("16-bit add with ADC", [
  "        MVI A, 34H",
  "        ADI 0FFH",
  "        MOV L, A",
  "        MVI A, 12H",
  "        ACI 0FH",
  "        MOV H, A",
  "        HLT",
].join("\n"), { H: 0x22, L: 0x33 });

// OUT is how a program shows its answer on a trainer kit's display.
{
  const r = run("MVI A, 7FH\nOUT 01H\nHLT");
  check("OUT records the port write", r.ports, [[0x01, 0x7f]]);
}
{
  const r = run("IN 02H\nHLT", { inputs: { 0x02: 0x5a } });
  check("IN reads the port", r.regs.A, 0x5a);
}

/* --------------------------------------------------------------- error paths --- */

const err = (what, src, wantFragment, opts) => {
  const r = run(src, opts);
  if (r.ok) { fails.push(`${what}\n        expected a failure, but it ran`); return; }
  if (!r.error.includes(wantFragment)) {
    fails.push(`${what}\n        expected the message to mention "${wantFragment}"\n        actual   ${r.error}`);
    return;
  }
  pass++;
};

err("unknown instruction", "MVI A, 05H\nFOO B\nHLT", 'unknown instruction "FOO"');
err("unknown label", "JMP NOWHERE\nHLT", 'unknown label or value "NOWHERE"');
err("hex without a leading digit", "MVI A, FFH\nHLT", "must start with a digit");
err("MOV M, M", "MOV M, M\nHLT", "that opcode is HLT");
err("missing HLT", "MVI A, 05H", "did you forget HLT");
err("endless loop", "LOOP: JMP LOOP", "loop that never ends", { maxSteps: 500 });
err("LDAX with H", "LDAX H\nHLT", "only works with B or D");
err("duplicate label", "L1: NOP\nL1: NOP\nHLT", "defined twice");

/* ------------------------------------------------------------------- report --- */

console.log(`\n8085 simulator: ${pass} checks passed, ${fails.length} failed`);
for (const f of fails) console.log(` FAIL  ${f}`);
process.exit(fails.length ? 1 : 0);
