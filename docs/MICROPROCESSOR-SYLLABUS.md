# Microprocessor — the full syllabus

Jugendra's instruction, 30 July 2026: *"jaruri nahi hai mera university ka syllabus
ho, mai ye universal sab student ke liye — decide the whole syllabus so kuch bhi
left na ho."* So this is not one university's paper. It is the union of what
Indian engineering syllabi examine, what the standard textbooks cover, and what an
embedded interview actually asks — decided here so nothing has to be guessed
lesson by lesson.

**38 lessons, 10 chapters.** The same size as the Python track. That is the honest
cost of "nothing left out" on a subject that covers two processors, a
microcontroller, six peripheral ICs and a modern-architecture unit.

Sources synthesised, not copied: Gaonkar (8085, the Indian standard), Douglas Hall
and Brey (8086), Ray & Bhurchandi (interfacing), Stallings and Patterson &
Hennessy (organisation and modern concepts), plus the AKTU / VTU / Anna / Mumbai /
Pune / GTU / RGPV / JNTU syllabus patterns and NPTEL's course ordering.

---

## The rule this course is written to

Every lesson runs. `lib/asm8085.ts` is a real 8085 assembler and simulator, so
every register value, flag and T-state count on every page was produced by
executing the code, not copied from a table. `npm run verify:lesson` re-runs all
of it. Where a topic genuinely cannot be executed — pin timing, 8255 mode
selection, DMA handshaking — it gets a purpose-built interactive visual instead,
and the lesson says plainly that it is a model rather than a simulation.

**Diagrams are hand-built SVG, never generated images.** Pin numbers, bit widths
and signal names are the one thing an engineering course cannot get wrong, and
generated diagrams get them wrong constantly.

---

## Chapter 1 — Foundations (4 lessons)

| # | Lesson | Covers | Visual |
|---|---|---|---|
| 1 | What a Microprocessor Really Is ✅ | Programmability, fetch–decode–execute, registers vs memory, a program as bytes | `asm8085-lab` |
| 2 | Evolution: what actually changed | 4004 → 8085 → 8086 → modern; word length, address space, clock; why 8-bit hurts; microprocessor vs microcontroller vs microcomputer | `cpu-evolution-lab` |
| 3 | Inside the chip | ALU, accumulator, temp register, instruction register and decoder, timing and control unit; von Neumann vs Harvard | `cpu-block-lab` |
| 4 | The three buses | Address, data, control; why 16 address lines is exactly 64 KB; bus contention; tri-state | `bus-lab` |

## Chapter 2 — 8085 architecture (5 lessons)

| # | Lesson | Covers | Visual |
|---|---|---|---|
| 5 | The register set | A, B–C, D–E, H–L, SP, PC, W–Z; register pairs as 16-bit; why seven | `register-lab` |
| 6 | The flag register, bit by bit | S, Z, AC, P, CY and their bit positions; which instructions affect which; the INR/INX/DAD exceptions | `flag-lab` |
| 7 | Pins and signals | The 40 pins by group; AD0–AD7 multiplexing and ALE; demultiplexing with a latch; generating MEMR/MEMW/IOR/IOW from IO/M, RD, WR | `pin-lab` |
| 8 | Memory organization and decoding | Memory map; absolute vs partial decoding; 74LS138; chip select; foldback and why a wrong decode aliases | `decode-lab` |
| 9 | Machine cycles, T-states, timing diagrams | Instruction cycle vs machine cycle vs T-state; opcode fetch, memory read/write, I/O read/write; drawing a timing diagram; wait states and READY | `timing-lab` |

## Chapter 3 — Instruction set and addressing (6 lessons)

| # | Lesson | Covers | Visual |
|---|---|---|---|
| 10 | The instruction set, classified | Five groups; 1/2/3-byte instructions; opcode format; hand-assembling to hex | `opcode-lab` |
| 11 | Addressing modes | Immediate, register, direct, register indirect, implied — with the same job done five ways | `addressing-lab` |
| 12 | Data transfer instructions | MOV, MVI, LXI, LDA/STA, LHLD/SHLD, LDAX/STAX, XCHG, IN/OUT; what none of them touch (flags) | `asm8085-lab` |
| 13 | Arithmetic and the flags | ADD/ADC/SUB/SBB, immediates, INR/DCR, INX/DCX, DAD, DAA; 16-bit arithmetic through the carry | `asm8085-lab` |
| 14 | Logical, compare and rotate | ANA/ORA/XRA, CMA/CMC/STC, CMP/CPI, RLC/RRC/RAL/RAR; masking and bit manipulation | `bitwise-lab` (reused) |
| 15 | Branching, the stack and subroutines | JMP and all eight conditions, CALL/RET, PUSH/POP, PSW, SP behaviour, nesting | `stack-lab` |

## Chapter 4 — Assembly programming (5 lessons)

| # | Lesson | Covers | Visual |
|---|---|---|---|
| 16 | Counters and delay loops | Up/down counters; single and nested delay loops; T-state arithmetic; designing a delay for a given clock | `delay-lab` |
| 17 | Block operations | Block transfer, block exchange, largest, smallest, sum, average, counting occurrences | `asm8085-lab` |
| 18 | Sorting and searching | Bubble sort ascending and descending; linear search; why sorting is the classic exam program | `sort-lab` |
| 19 | Code conversion | BCD ↔ binary, BCD ↔ ASCII, ASCII ↔ hex, packed/unpacked BCD, 7-segment codes; DAA in anger | `convert-lab` |
| 20 | Subroutines done properly | Parameter passing (register, memory, stack), nesting, look-up tables, reentrancy, why recursion needs care | `stack-lab` |

## Chapter 5 — Interrupts and DMA (3 lessons)

| # | Lesson | Covers | Visual |
|---|---|---|---|
| 21 | Interrupts: why, and the 8085's five | Polling vs interrupt; INTR, RST 5.5/6.5/7.5, TRAP; vectored vs non-vectored, maskable vs non-maskable; vector addresses; software RST 0–7 | `interrupt-lab` |
| 22 | Masking, priority and writing an ISR | EI/DI, SIM and RIM bit by bit; priority order; latency and response time; saving context; multiple interrupts | `interrupt-lab` |
| 23 | DMA — giving the buses away | Why DMA; HOLD/HLDA; 8257 registers and channels; cycle stealing, burst and block modes; why it beats the processor copying | `dma-lab` |

## Chapter 6 — Interfacing (6 lessons)

| # | Lesson | Covers | Visual |
|---|---|---|---|
| 24 | Memory-mapped vs I/O-mapped I/O | The two schemes compared honestly; interfacing RAM and ROM; address ranges; the trade | `decode-lab` |
| 25 | The 8255 PPI | Ports A/B/C, modes 0/1/2, BSR mode, control word construction, handshaking signals | `ppi-lab` |
| 26 | The 8253/8254 timer | Six modes, count registers, programming a frequency, square-wave generation | `timer-lab` |
| 27 | The 8259 PIC | Why you need one; ICW1–4 and OCW1–3; cascading for more than eight; priority schemes | `pic-lab` |
| 28 | ADC and DAC interfacing | ADC 0808/0809 with SOC/EOC, DAC 0800, resolution and step size, waveform generation | `adc-lab` |
| 29 | Real devices | 8279 keyboard/display, 7-segment multiplexing, LCD, stepper motor, relay, LED; traffic-light and temperature-controller patterns | `device-lab` |

## Chapter 7 — Communication (2 lessons)

| # | Lesson | Covers | Visual |
|---|---|---|---|
| 30 | Serial communication | Synchronous vs asynchronous, simplex/half/full duplex, framing, baud rate, RS-232, the 8085's own SID/SOD via SIM/RIM, the 8251 USART | `serial-lab` |
| 31 | Parallel communication and handshaking | Parallel vs serial trade; strobe and handshake protocols; Centronics; why serial won | `serial-lab` |

## Chapter 8 — 8086 and modern processors (4 lessons)

| # | Lesson | Covers | Visual |
|---|---|---|---|
| 32 | 8086 architecture | BIU and EU, the instruction queue, pipelining, why it is faster than a clock bump would explain; 8086 vs 8088 vs 8085 | `bus-lab` |
| 33 | Segmentation | Segment registers, offset, physical address generation, overlapping segments, the 1 MB space, min/max mode | `segment-lab` |
| 34 | 8086 addressing modes and instructions | All addressing modes, string instructions, the interrupt vector table, assembler basics | `addressing-lab` |
| 35 | Modern processors | Deep pipelines and hazards, cache and locality, RISC vs CISC, superscalar, branch prediction, multicore, virtual memory — and which 8085 ideas survived unchanged | `modern-cpu-lab` |

## Chapter 9 — Microcontrollers (2 lessons)

| # | Lesson | Covers | Visual |
|---|---|---|---|
| 36 | Microcontroller vs microprocessor, and the 8051 | Where each belongs; 8051 architecture, SFRs, ports, memory organization | `mcu-lab` |
| 37 | 8051 essentials | Timers/counters, interrupts, serial port, and how 8085 habits transfer | `mcu-lab` |

## Chapter 10 — Exam and interview (1 lesson)

| # | Lesson | Covers | Visual |
|---|---|---|---|
| 38 | The patterns that repeat | The question types that appear every year — timing diagrams, delay calculation, decoding, flag traces, mode words — each worked end to end; plus a one-page revision per chapter | `asm8085-lab` |

---

## Decisions taken, and why

- **8085 first, 8086 second.** Every syllabus in the list does this, and it is the
  right order regardless: the 8085 is small enough to hold in your head, and the
  8086's additions only make sense once you have felt what they fix.
- **The 8051 is included.** Roughly half the syllabi have it, it is what embedded
  interviews ask about, and two lessons is a cheap way to remove the gap.
- **Timing diagrams get a whole lesson (9), not a paragraph.** It is one of the
  most-examined and worst-taught topics in the subject.
- **Peripheral ICs get one lesson each.** 8255, 8253, 8259, ADC/DAC and the
  display/motor family are separate lessons because each has its own control-word
  construction, which is exactly what exams ask you to do.
- **Modern concepts stay (lesson 35).** The subject is otherwise a museum piece;
  one lesson connecting T-states and buses to cache and pipelining is what makes
  the rest feel worth learning.
- **No lesson on the 8085's arithmetic co-processor or bit-slice processors.**
  They appear in a few old syllabi and nowhere in exams or practice. Written down
  here so the omission is a decision rather than a gap.

## Practice problems

Every lesson carries at least four, graded by running real 8085 code. That needs
`Problem.kind = "asm8085"` support in the practice workbench, `lib/verify.ts` and
`db:check` — **the one piece of platform work still outstanding**, tracked in
`docs/HANDOFF.md`.

For the lessons where nothing executes (pins, DMA handshaking, mode words) the
problems are still code: given a mode requirement, compute the control word;
given a decode, compute the address range; given a clock, compute the delay
count. Those are exactly the exam questions, and they are all arithmetic a
function can check.
