# Microprocessor — the full syllabus

Jugendra's instruction, 30 July 2026: *"jaruri nahi hai mera university ka syllabus
ho, mai ye universal sab student ke liye — decide the whole syllabus so kuch bhi
left na ho."* So this is not one university's paper. It is the union of what
Indian engineering syllabi examine, what the standard textbooks cover, and what an
embedded interview actually asks — decided here so nothing has to be guessed
lesson by lesson.

**42 lessons, 11 chapters.** Slightly larger than the Python track. That is the
honest cost of "nothing left out" on a subject that covers two processors, a
microcontroller, six peripheral ICs and a modern-architecture unit — plus four
lessons of ground floor, added after the first draft failed the test that matters.

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

## Why there is a Chapter 1 before the processor

The first draft started at "what is a microprocessor" and opened its first code
block with `MVI A, 42H`, output `A=0C`. Jugendra read it and said he could not
relate to it — *"mera base hi sahi nahi hai"*, and that it was too much theory to
hold his interest. Both were true, and measurable: **3,652 words of prose against
two visuals**, with hex, bytes and registers all assumed rather than taught.

So the course now starts one floor lower. Chapter 1 assumes **nothing** — a reader
who has only ever used a light switch can follow it — and it is built out of
things you press rather than paragraphs you accept. The format changed with it:
short sections, one interactive panel every screen or two, and one short paragraph
after each rather than three.

## Chapter 1 — Before the processor (4 lessons)

| # | Lesson | Covers | Visual |
|---|---|---|---|
| 1 | Switches, and How They Become Numbers ✅ | A bit as a switch; each switch doubles the patterns; a byte is 8 switches and 0–255; hex as four switches per symbol; why `10H` is sixteen | `doubling-lab`, `bit-switch-lab`, `hex-lab` |
| 2 | Memory — a Street of Numbered Boxes | Address versus contents; why every box holds exactly one byte; reading and writing; why an address needs 16 switches | `memory-street-lab` |
| 3 | What a Program Actually Is | Instructions as bytes in those boxes; the same byte as data or instruction depending only on where you start reading | `program-bytes-lab` |
| 4 | Counting, Carrying and Running Out of Room | Adding by hand in binary; what a carry is; why 255 + 1 is 0; the flags as answers to questions | `carry-lab` |

## Chapter 2 — Foundations (4 lessons)

| # | Lesson | Covers | Visual |
|---|---|---|---|
| 5 | What a Microprocessor Really Is ✅ | Programmability, fetch–decode–execute, registers vs memory, a program as bytes | `asm8085-lab` |
| 6 | Evolution: what actually changed | 4004 → 8085 → 8086 → modern; word length, address space, clock; why 8-bit hurts; microprocessor vs microcontroller vs microcomputer | `cpu-evolution-lab` |
| 7 | Inside the chip | ALU, accumulator, temp register, instruction register and decoder, timing and control unit; von Neumann vs Harvard | `cpu-block-lab` |
| 8 | The three buses | Address, data, control; why 16 address lines is exactly 64 KB; bus contention; tri-state | `bus-lab` |

## Chapter 3 — 8085 architecture (5 lessons)

| # | Lesson | Covers | Visual |
|---|---|---|---|
| 9 | The register set | A, B–C, D–E, H–L, SP, PC, W–Z; register pairs as 16-bit; why seven | `register-lab` |
| 10 | The flag register, bit by bit | S, Z, AC, P, CY and their bit positions; which instructions affect which; the INR/INX/DAD exceptions | `flag-lab` |
| 11 | Pins and signals | The 40 pins by group; AD0–AD7 multiplexing and ALE; demultiplexing with a latch; generating MEMR/MEMW/IOR/IOW from IO/M, RD, WR | `pin-lab` |
| 12 | Memory organization and decoding | Memory map; absolute vs partial decoding; 74LS138; chip select; foldback and why a wrong decode aliases | `decode-lab` |
| 13 | Machine cycles, T-states, timing diagrams | Instruction cycle vs machine cycle vs T-state; opcode fetch, memory read/write, I/O read/write; drawing a timing diagram; wait states and READY | `timing-lab` |

## Chapter 4 — Instruction set and addressing (6 lessons)

| # | Lesson | Covers | Visual |
|---|---|---|---|
| 14 | The instruction set, classified | Five groups; 1/2/3-byte instructions; opcode format; hand-assembling to hex | `opcode-lab` |
| 15 | Addressing modes | Immediate, register, direct, register indirect, implied — with the same job done five ways | `addressing-lab` |
| 16 | Data transfer instructions | MOV, MVI, LXI, LDA/STA, LHLD/SHLD, LDAX/STAX, XCHG, IN/OUT; what none of them touch (flags) | `asm8085-lab` |
| 17 | Arithmetic and the flags | ADD/ADC/SUB/SBB, immediates, INR/DCR, INX/DCX, DAD, DAA; 16-bit arithmetic through the carry | `asm8085-lab` |
| 18 | Logical, compare and rotate | ANA/ORA/XRA, CMA/CMC/STC, CMP/CPI, RLC/RRC/RAL/RAR; masking and bit manipulation | `bitwise-lab` (reused) |
| 19 | Branching, the stack and subroutines | JMP and all eight conditions, CALL/RET, PUSH/POP, PSW, SP behaviour, nesting | `stack-lab` |

## Chapter 5 — Assembly programming (5 lessons)

| # | Lesson | Covers | Visual |
|---|---|---|---|
| 20 | Counters and delay loops | Up/down counters; single and nested delay loops; T-state arithmetic; designing a delay for a given clock | `delay-lab` |
| 21 | Block operations | Block transfer, block exchange, largest, smallest, sum, average, counting occurrences | `asm8085-lab` |
| 22 | Sorting and searching | Bubble sort ascending and descending; linear search; why sorting is the classic exam program | `sort-lab` |
| 23 | Code conversion | BCD ↔ binary, BCD ↔ ASCII, ASCII ↔ hex, packed/unpacked BCD, 7-segment codes; DAA in anger | `convert-lab` |
| 24 | Subroutines done properly | Parameter passing (register, memory, stack), nesting, look-up tables, reentrancy, why recursion needs care | `stack-lab` |

## Chapter 6 — Interrupts and DMA (3 lessons)

| # | Lesson | Covers | Visual |
|---|---|---|---|
| 25 | Interrupts: why, and the 8085's five | Polling vs interrupt; INTR, RST 5.5/6.5/7.5, TRAP; vectored vs non-vectored, maskable vs non-maskable; vector addresses; software RST 0–7 | `interrupt-lab` |
| 26 | Masking, priority and writing an ISR | EI/DI, SIM and RIM bit by bit; priority order; latency and response time; saving context; multiple interrupts | `interrupt-lab` |
| 27 | DMA — giving the buses away | Why DMA; HOLD/HLDA; 8257 registers and channels; cycle stealing, burst and block modes; why it beats the processor copying | `dma-lab` |

## Chapter 7 — Interfacing (6 lessons)

| # | Lesson | Covers | Visual |
|---|---|---|---|
| 28 | Memory-mapped vs I/O-mapped I/O | The two schemes compared honestly; interfacing RAM and ROM; address ranges; the trade | `decode-lab` |
| 29 | The 8255 PPI | Ports A/B/C, modes 0/1/2, BSR mode, control word construction, handshaking signals | `ppi-lab` |
| 30 | The 8253/8254 timer | Six modes, count registers, programming a frequency, square-wave generation | `timer-lab` |
| 31 | The 8259 PIC | Why you need one; ICW1–4 and OCW1–3; cascading for more than eight; priority schemes | `pic-lab` |
| 32 | ADC and DAC interfacing | ADC 0808/0809 with SOC/EOC, DAC 0800, resolution and step size, waveform generation | `adc-lab` |
| 33 | Real devices | 8279 keyboard/display, 7-segment multiplexing, LCD, stepper motor, relay, LED; traffic-light and temperature-controller patterns | `device-lab` |

## Chapter 8 — Communication (2 lessons)

| # | Lesson | Covers | Visual |
|---|---|---|---|
| 34 | Serial communication | Synchronous vs asynchronous, simplex/half/full duplex, framing, baud rate, RS-232, the 8085's own SID/SOD via SIM/RIM, the 8251 USART | `serial-lab` |
| 35 | Parallel communication and handshaking | Parallel vs serial trade; strobe and handshake protocols; Centronics; why serial won | `serial-lab` |

## Chapter 9 — 8086 and modern processors (4 lessons)

| # | Lesson | Covers | Visual |
|---|---|---|---|
| 36 | 8086 architecture | BIU and EU, the instruction queue, pipelining, why it is faster than a clock bump would explain; 8086 vs 8088 vs 8085 | `bus-lab` |
| 37 | Segmentation | Segment registers, offset, physical address generation, overlapping segments, the 1 MB space, min/max mode | `segment-lab` |
| 38 | 8086 addressing modes and instructions | All addressing modes, string instructions, the interrupt vector table, assembler basics | `addressing-lab` |
| 39 | Modern processors | Deep pipelines and hazards, cache and locality, RISC vs CISC, superscalar, branch prediction, multicore, virtual memory — and which 8085 ideas survived unchanged | `modern-cpu-lab` |

## Chapter 10 — Microcontrollers (2 lessons)

| # | Lesson | Covers | Visual |
|---|---|---|---|
| 40 | Microcontroller vs microprocessor, and the 8051 | Where each belongs; 8051 architecture, SFRs, ports, memory organization | `mcu-lab` |
| 41 | 8051 essentials | Timers/counters, interrupts, serial port, and how 8085 habits transfer | `mcu-lab` |

## Chapter 11 — Exam and interview (1 lesson)

| # | Lesson | Covers | Visual |
|---|---|---|---|
| 42 | The patterns that repeat | The question types that appear every year — timing diagrams, delay calculation, decoding, flag traces, mode words — each worked end to end; plus a one-page revision per chapter | `asm8085-lab` |

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
