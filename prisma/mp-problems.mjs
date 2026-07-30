// Microprocessor practice problems — shared by the full seed and the additive
// applier (apply-problems.mjs), so both stay in sync from one source.
//
// HOW AN ASSEMBLY PROBLEM IS GRADED, because it is not like the other two tracks.
//
// A Python problem returns a value and a SQL problem returns rows. An 8085 program
// returns nothing — it leaves the machine in a state. So each test says what to put
// in memory beforehand and which parts of the machine are being judged afterwards:
//
//   { memory: { 8272: 0x10, ... }, check: ["A", "M:2060"] }
//
// Grading then runs the student's program AND the reference on identical memory and
// diffs only the named state. That is the same rule the SQL verifier uses, for the
// same reason: a student who sums a block with register B where the reference used C
// is not wrong, and a grader that says otherwise teaches the wrong lesson.
//
// Two rules for writing these:
//   * Give every problem MORE THAN ONE test, with different values. One test can be
//     passed by a program that hardcodes the answer.
//   * Never let a test's checked state come out all zeros — an empty program would
//     pass it. `db:check` fails the build on this.
//
// Addresses are decimal here because JSON is: 8272 = 2050H, 8288 = 2060H.

const A50 = 8272;  // 2050H — where input blocks live, as in every lesson
const A60 = 8288;  // 2060H — where answers are stored

const MP = (lessonSlug, difficulty, order, slug, title, desc, examples, starter, solution, tests, hints, tags) => ({
  lessonSlug, order, slug, title, difficulty, kind: "asm8085",
  // There is no function to call, but the column is not nullable. Naming the
  // program is more useful than an empty string when a slug appears in a log.
  functionName: slug.replace(/^mp-/, "").replace(/-/g, "_"),
  descriptionMd: desc, tagsCsv: tags.join(","),
  examplesJson: JSON.stringify(examples),
  starterCode: starter, solutionCode: solution, testsJson: JSON.stringify(tests),
  hintsJson: JSON.stringify(hints), sqlSetup: "",
  xp: difficulty === "Easy" ? 20 : difficulty === "Medium" ? 30 : 40,
});

const HALT = "\n        HLT\n";

const mpProblems = [
  /* ============== 1. What a Microprocessor Really Is ============== */
  MP("mp-what-is-a-microprocessor", "Easy", 301, "mp-load-and-copy", "Load It, Then Copy It",
    "The two instructions every 8085 program starts with. `MVI` puts a value **into** a register; `MOV` **copies** one register to another.\n\nWrite a program that puts `25H` into the accumulator, then copies it into **B** and into **C**. End with `HLT`.\n\nRemember that `MOV` copies rather than moves — A still holds 25H at the end.",
    [{ input: "(nothing in memory)", output: "A=25 B=25 C=25" }],
    "        ; put 25H into A, then copy it to B and C\n" + HALT,
    "        MVI A, 25H\n        MOV B, A\n        MOV C, A\n        HLT\n",
    [{ memory: {}, check: ["A", "B", "C"] }],
    ["`MVI A, 25H` loads the accumulator. Note the H — it means hexadecimal.",
      "`MOV B, A` copies A into B. Destination first, source second.",
      "A hex value must start with a digit: 0FFH, not FFH. 25H is fine as it is."],
    ["8085", "data-transfer"]),

  MP("mp-what-is-a-microprocessor", "Easy", 302, "mp-add-two", "Add Two Bytes From Memory",
    "Two numbers are waiting at **2050H** and **2051H**. Add them and store the answer at **2060H**.\n\nUse `HL` as a pointer: `LXI H, 2050H` points it at the first byte, `MOV A, M` reads the byte it points at, and `INX H` moves it on by one.\n\nYour program is tested on three different pairs — including one that overflows — so it has to add whatever is there rather than a number you typed.",
    [{ input: "2050H = 12H, 2051H = 34H", output: "2060H = 46H" }, { input: "2050H = F0H, 2051H = 20H", output: "2060H = 10H, with CY set" }],
    "        LXI H, 2050H\n        ; read both bytes, add them, store at 2060H\n" + HALT,
    "        LXI H, 2050H\n        MOV A, M\n        INX H\n        ADD M\n        STA 2060H\n        HLT\n",
    [
      { memory: { [A50]: 0x12, [A50 + 1]: 0x34 }, check: ["A", "M:2060", "CY"] },
      { memory: { [A50]: 0xf0, [A50 + 1]: 0x20 }, check: ["A", "M:2060", "CY"] },
      { memory: { [A50]: 0x01, [A50 + 1]: 0x02 }, check: ["A", "M:2060", "CY"] },
    ],
    ["`MOV A, M` reads the byte HL points at into the accumulator.",
      "`INX H` adds one to the HL pair, so M now means the next byte.",
      "`ADD M` adds the byte HL points at to A. Then `STA 2060H` writes A out.",
      "The second test overflows: A holds 10H and the ninth bit is in CY. That is the correct answer, not a bug."],
    ["8085", "arithmetic", "pointers"]),

  MP("mp-what-is-a-microprocessor", "Medium", 303, "mp-swap-bytes", "Swap Two Bytes In Memory",
    "Swap the bytes at **2050H** and **2051H** — whatever is in the first should end up in the second and the other way round.\n\nThis is the first program where you have to hold something while you overwrite the place it came from, which is what registers are for.\n\n`DCX H` decrements the HL pair, the way `INX H` increments it.",
    [{ input: "2050H = AAH, 2051H = BBH", output: "2050H = BBH, 2051H = AAH" }],
    "        LXI H, 2050H\n        ; swap the two bytes\n" + HALT,
    "        LXI H, 2050H\n        MOV A, M\n        INX H\n        MOV B, M\n        MOV M, A\n        DCX H\n        MOV M, B\n        HLT\n",
    [
      { memory: { [A50]: 0xaa, [A50 + 1]: 0xbb }, check: ["M:2050", "M:2051"] },
      { memory: { [A50]: 0x01, [A50 + 1]: 0xff }, check: ["M:2050", "M:2051"] },
    ],
    ["Read the first byte into A before you overwrite anything.",
      "You need a second register for the other byte — B will do.",
      "`MOV M, A` writes A to wherever HL points, so move HL between the two writes.",
      "`DCX H` takes HL back down by one."],
    ["8085", "data-transfer", "pointers"]),

  MP("mp-what-is-a-microprocessor", "Medium", 304, "mp-sum-block", "Add Up Five Bytes",
    "Five bytes start at **2050H**. Add all five and store the total at **2060H**.\n\nThis needs a loop, and a counted loop over memory has **two** moving parts: something that counts down, and something that walks the pointer along. Leaving out the second one is the classic bug — it adds the first byte five times.\n\nStart the total at zero with `XRA A`, which is how assembly programmers clear the accumulator.",
    [{ input: "2050H..2054H = 10H 20H 30H 40H 50H", output: "2060H = F0H" }],
    "        LXI H, 2050H\n        MVI C, 05H\n        XRA A\nLOOP:   ; add, advance, count down, repeat\n" + HALT,
    "        LXI H, 2050H\n        MVI C, 05H\n        XRA A\nLOOP:   ADD M\n        INX H\n        DCR C\n        JNZ LOOP\n        STA 2060H\n        HLT\n",
    [
      { memory: { [A50]: 0x10, [A50 + 1]: 0x20, [A50 + 2]: 0x30, [A50 + 3]: 0x40, [A50 + 4]: 0x50 }, check: ["A", "M:2060"] },
      { memory: { [A50]: 0x01, [A50 + 1]: 0x02, [A50 + 2]: 0x03, [A50 + 3]: 0x04, [A50 + 4]: 0x05 }, check: ["A", "M:2060"] },
    ],
    ["`XRA A` exclusive-ORs A with itself, which always gives zero — and clears CY too.",
      "Inside the loop: `ADD M` to add, `INX H` to advance, `DCR C` to count.",
      "`JNZ LOOP` jumps back while the zero flag is clear, so the loop ends when C reaches 0.",
      "If your total is a round multiple of the first byte, the pointer never moved."],
    ["8085", "loops", "arithmetic"]),

  /* ============== 2. Memory — a Street of Numbered Boxes ============== */
  MP("mp-memory-street", "Easy", 291, "mp-read-a-box", "Read What Is In the Box",
    "Box **2050H** has a byte in it. Copy that byte into the accumulator.\n\nTwo instructions. `LXI H, 2050H` points at the box; `MOV A, M` reads what is inside it — `M` means \"the box HL is pointing at\".\n\nTwo different bytes are tested, so you have to read the box rather than type the answer.",
    [{ input: "2050H = 07H", output: "A = 07H" }],
    "        ; point at box 2050H, then read what is inside\n" + HALT,
    "        LXI H, 2050H\n        MOV A, M\n        HLT\n",
    [
      { memory: { [A50]: 0x07 }, check: ["A"] },
      { memory: { [A50]: 0xbb }, check: ["A"] },
    ],
    ["`LXI H, 2050H` puts the box NUMBER into the HL pair.",
      "`MOV A, M` copies the contents. `MOV A, L` would give you 50H — half the address, not the contents.",
      "Reading does not empty the box, so you do not need to put anything back."],
    ["8085", "memory"]),

  MP("mp-memory-street", "Easy", 292, "mp-write-a-box", "Put a Byte In a Box",
    "Write the value **5AH** into box **2060H**.\n\nGet 5AH into the accumulator first, point HL at the box, then write it. `MOV M, A` copies the accumulator into the box HL is pointing at.\n\nRemember that writing replaces whatever was there — but here the box starts empty, so there is nothing to lose.",
    [{ input: "(the box starts at 00H)", output: "2060H = 5AH" }],
    "        ; put 5AH into box 2060H\n" + HALT,
    "        MVI A, 5AH\n        LXI H, 2060H\n        MOV M, A\n        HLT\n",
    [{ memory: {}, check: ["M:2060", "A"] }],
    ["`MVI A, 5AH` loads the value into the accumulator.",
      "`LXI H, 2060H` points HL at the box you are writing into.",
      "`MOV M, A` writes it. You could also do the whole thing with `MVI M, 5AH` after setting HL."],
    ["8085", "memory"]),

  MP("mp-memory-street", "Medium", 293, "mp-copy-box", "Copy One Box Into Another",
    "Copy the byte in box **2050H** into box **2060H**, leaving the original where it is.\n\nThis is the whole lesson in one program: reading copies rather than moves, so after this both boxes hold the same byte.\n\nYou only have one HL pair, so you will need to point it at one box, then the other.",
    [{ input: "2050H = 41H", output: "2050H = 41H and 2060H = 41H" }],
    "        ; copy the byte at 2050H into 2060H\n" + HALT,
    "        LXI H, 2050H\n        MOV A, M\n        LXI H, 2060H\n        MOV M, A\n        HLT\n",
    [
      { memory: { [A50]: 0x41 }, check: ["M:2050", "M:2060"] },
      { memory: { [A50]: 0x9c }, check: ["M:2050", "M:2060"] },
    ],
    ["Read into the accumulator first — it is the only place to hold the byte while HL moves.",
      "Then point HL at the destination and write.",
      "Both tests check 2050H as well: if the original is gone, you moved it instead of copying it."],
    ["8085", "memory"]),

  MP("mp-memory-street", "Medium", 294, "mp-swap-neighbours", "Swap Two Neighbours",
    "Boxes **2050H** and **2051H** are next door to each other. Swap what is in them.\n\nThe catch is that you have to hold one byte somewhere while you overwrite the box it came from — writing destroys, so if you overwrite first you lose it.\n\n`INX H` walks one box along and `DCX H` walks back.",
    [{ input: "2050H = 11H, 2051H = 22H", output: "2050H = 22H, 2051H = 11H" }],
    "        LXI H, 2050H\n        ; swap the bytes in 2050H and 2051H\n" + HALT,
    "        LXI H, 2050H\n        MOV A, M\n        INX H\n        MOV B, M\n        MOV M, A\n        DCX H\n        MOV M, B\n        HLT\n",
    [
      { memory: { [A50]: 0x11, [A50 + 1]: 0x22 }, check: ["M:2050", "M:2051"] },
      { memory: { [A50]: 0xaa, [A50 + 1]: 0x07 }, check: ["M:2050", "M:2051"] },
    ],
    ["Read BOTH bytes into registers before you write either one back.",
      "A and B are both free — use one for each byte.",
      "Watch where HL is pointing at each write. Writing before walking, or walking before writing, puts a byte in the wrong box."],
    ["8085", "memory", "pointers"]),

  MP("mp-memory-street", "Medium", 295, "mp-third-box", "Walk to the Third Box",
    "Starting from box **2050H**, walk along to the **third** box — 2052H — read what is in it, and store a copy at **2060H**.\n\nWalk with `INX H` rather than loading 2052H directly. The point is that \"next\" in memory is just \"one more on the address\", which is how every loop over a list works.",
    [{ input: "2050H, 2051H, 2052H = 07H, 63H, FFH", output: "2060H = FFH" }],
    "        LXI H, 2050H\n        ; walk along to the third box, read it, store it at 2060H\n" + HALT,
    "        LXI H, 2050H\n        INX H\n        INX H\n        MOV A, M\n        STA 2060H\n        HLT\n",
    [
      { memory: { [A50]: 0x07, [A50 + 1]: 0x63, [A50 + 2]: 0xff }, check: ["A", "M:2060"] },
      { memory: { [A50]: 0x01, [A50 + 1]: 0x02, [A50 + 2]: 0x03 }, check: ["A", "M:2060"] },
    ],
    ["The first box is 2050H, so the third one is two steps along — two `INX H`, not three.",
      "`STA 2060H` stores the accumulator at an address written into the instruction, so HL is free.",
      "If you get 63H you walked one step too few; if you get 00H you walked too far."],
    ["8085", "memory", "pointers"]),

  /* ============== 3. What a Program Actually Is ============== */
  MP("mp-what-is-a-program", "Easy", 296, "mp-store-16bit", "Store a Number That Needs Two Boxes",
    "The number **5678H** is too big for one box, so it takes two — boxes **2050H** and **2051H**.\n\nThe 8085's rule is **low byte first**: the small half goes in the lower address. So 2050H gets 78H and 2051H gets 56H.\n\nStore it that way.",
    [{ input: "(both boxes start empty)", output: "2050H = 78H, 2051H = 56H" }],
    "        LXI H, 2050H\n        ; store 5678H across the two boxes, low half first\n" + HALT,
    "        LXI H, 2050H\n        MVI M, 78H\n        INX H\n        MVI M, 56H\n        HLT\n",
    [{ memory: {}, check: ["M:2050", "M:2051"] }],
    ["5678H splits into 56H (the high half) and 78H (the low half).",
      "Low byte goes in the LOWER address — 2050H gets 78H.",
      "`INX H` walks to the next box between the two writes."],
    ["8085", "memory", "16-bit"]),

  MP("mp-what-is-a-program", "Easy", 297, "mp-read-16bit", "Read Two Boxes as One Number",
    "Boxes **2050H** and **2051H** hold a 16-bit number, low byte first. Read the pair into HL as a single number.\n\n`LHLD` does it in one instruction: it takes the byte at the address into **L** and the next one into **H**.\n\nCheck the answer against the two bytes — if you get the digits swapped, you have loaded them the wrong way round.",
    [{ input: "2050H = 34H, 2051H = 12H", output: "HL = 1234H" }],
    "        ; read the 16-bit number at 2050H into HL\n" + HALT,
    "        LHLD 2050H\n        HLT\n",
    [
      { memory: { [A50]: 0x34, [A50 + 1]: 0x12 }, check: ["HL", "H", "L"] },
      { memory: { [A50]: 0xcd, [A50 + 1]: 0xab }, check: ["HL", "H", "L"] },
    ],
    ["`LHLD 2050H` is a single three-byte instruction that loads both halves.",
      "The byte at 2050H goes into L, and the byte at 2051H goes into H.",
      "So the bytes 34H and 12H come back as 1234H, not 3412H."],
    ["8085", "16-bit", "memory"]),

  MP("mp-what-is-a-program", "Medium", 298, "mp-split-16bit", "Take a Number Apart Again",
    "The 16-bit number at **2050H** needs to be split back into two separate bytes and stored at **2060H** and **2061H** — low half at 2060H, high half at 2061H.\n\nLoad it as one number, then write out each half. `MOV A, L` gets the low half and `MOV A, H` gets the high half.\n\nThis is the reverse of the previous problem, and it is what every \"convert a 16-bit result\" question is really asking.",
    [{ input: "2050H = 34H, 2051H = 12H  (the number 1234H)", output: "2060H = 34H, 2061H = 12H" }],
    "        LHLD 2050H\n        ; write the low half to 2060H and the high half to 2061H\n" + HALT,
    "        LHLD 2050H\n        MOV A, L\n        STA 2060H\n        MOV A, H\n        STA 2061H\n        HLT\n",
    [
      { memory: { [A50]: 0x34, [A50 + 1]: 0x12 }, check: ["M:2060", "M:2061"] },
      { memory: { [A50]: 0xff, [A50 + 1]: 0x0f }, check: ["M:2060", "M:2061"] },
    ],
    ["`LHLD` loads both halves at once — L gets the low byte, H the high byte.",
      "`STA` writes the accumulator to an address written into the instruction, so HL stays free.",
      "Do the low half first, or you will overwrite A before you have stored it."],
    ["8085", "16-bit", "memory"]),

  MP("mp-what-is-a-program", "Medium", 299, "mp-copy-16bit", "Move a 16-Bit Number Somewhere Else",
    "Copy the 16-bit number at **2050H** to **2060H**, keeping the byte order intact.\n\nTwo instructions is enough: `LHLD` reads a pair, `SHLD` writes one back. Both follow the low-byte-first rule, so the copy comes out identical without you having to think about which half is which.\n\nThe original must still be there afterwards — this is a copy, not a move.",
    [{ input: "2050H = 34H, 2051H = 12H", output: "2060H = 34H, 2061H = 12H" }],
    "        ; copy the 16-bit number at 2050H to 2060H\n" + HALT,
    "        LHLD 2050H\n        SHLD 2060H\n        HLT\n",
    [
      { memory: { [A50]: 0x34, [A50 + 1]: 0x12 }, check: ["M:2060", "M:2061", "HL"] },
      { memory: { [A50]: 0x01, [A50 + 1]: 0x80 }, check: ["M:2060", "M:2061", "HL"] },
    ],
    ["`LHLD` reads a 16-bit value from an address; `SHLD` writes one back.",
      "Both use the same byte order, so you never have to swap anything.",
      "Two instructions and a HLT is the whole program."],
    ["8085", "16-bit", "memory"]),

  /* ============== 4. Evolution — What Actually Changed ============== */
  MP("mp-evolution", "Medium", 311, "mp-overflow-catch", "Keep the Ninth Bit",
    "Add the bytes at **2050H** and **2051H** and give the **full** answer, not the eight bits that fit.\n\nPut the low byte of the sum in **L** and the carry — 0 or 1 — in **H**. So 200 + 200 gives H=01, L=90, which read together is 190H = 400.\n\nThe trick is `ACI 00H`: add zero *with carry*, which turns the carry flag into a number.",
    [{ input: "2050H = C8H, 2051H = C8H  (200 + 200)", output: "H=01 L=90" }, { input: "2050H = 10H, 2051H = 20H", output: "H=00 L=30" }],
    "        LXI H, 2050H\n        ; add the two bytes, keep the carry as the high byte\n" + HALT,
    "        LXI H, 2050H\n        MOV A, M\n        INX H\n        ADD M\n        MOV L, A\n        MVI A, 00H\n        ACI 00H\n        MOV H, A\n        HLT\n",
    [
      { memory: { [A50]: 0xc8, [A50 + 1]: 0xc8 }, check: ["H", "L"] },
      { memory: { [A50]: 0x10, [A50 + 1]: 0x20 }, check: ["H", "L"] },
      { memory: { [A50]: 0xff, [A50 + 1]: 0x01 }, check: ["H", "L"] },
    ],
    ["Add the two bytes first, then save the low byte into L before you touch A again.",
      "`MVI A, 00H` does NOT affect the flags, so the carry from the addition survives it.",
      "`ACI 00H` adds 0 plus the carry, so A becomes 1 if it carried and 0 if it did not.",
      "Order matters: save L before you reload A, or you lose the sum."],
    ["8085", "carry", "arithmetic"]),

  MP("mp-evolution", "Medium", 312, "mp-add16", "Add Two 16-Bit Numbers",
    "Two 16-bit numbers are stored at **2050H** and **2052H**, each **low byte first** — so 1234H is stored as 34H then 12H.\n\nAdd them and store the 16-bit answer at **2060H**, in the same low-byte-first order.\n\n`LHLD` loads HL from an address in one instruction, `DAD` adds a register pair to HL, and `SHLD` stores HL back. `XCHG` swaps HL with DE when you need to keep one while loading the other.",
    [{ input: "2050H = 34H 12H (1234H), 2052H = FFH 0FH (0FFFH)", output: "2060H = 33H 22H (2233H)" }],
    "        ; load both 16-bit values, add them, store the result at 2060H\n" + HALT,
    "        LHLD 2050H\n        XCHG\n        LHLD 2052H\n        DAD D\n        SHLD 2060H\n        HLT\n",
    [
      { memory: { [A50]: 0x34, [A50 + 1]: 0x12, [A50 + 2]: 0xff, [A50 + 3]: 0x0f }, check: ["HL", "M:2060", "M:2061", "CY"] },
      { memory: { [A50]: 0xff, [A50 + 1]: 0xff, [A50 + 2]: 0x01, [A50 + 3]: 0x00 }, check: ["HL", "M:2060", "M:2061", "CY"] },
    ],
    ["`LHLD 2050H` puts the low byte in L and the high byte in H — one instruction for both.",
      "`XCHG` swaps HL and DE, which parks the first number in DE while you load the second.",
      "`DAD D` adds DE to HL and affects only the carry flag.",
      "`SHLD 2060H` writes L then H, so the answer comes out low byte first like the inputs.",
      "The second test wraps past FFFFH: HL is 0000 and CY is 1. That is the right answer."],
    ["8085", "16-bit", "arithmetic"]),

  MP("mp-evolution", "Easy", 313, "mp-count-down", "Count a Loop, and Count Its Cost",
    "Load **08H** into register C and count it down to zero with a loop.\n\nThe point is the **T-state counter**, not the loop: it tells you exactly how many clock cycles the loop cost, which is the number every \"design a delay of X milliseconds\" question is built from.\n\nWork it out by hand first — 7 for the `MVI`, 4 for each `DCR`, 10 for each `JNZ` that jumps and 7 for the one that does not, 5 for the `HLT` — then run it and check.",
    [{ input: "(nothing in memory)", output: "C=00, and 121 T-states" }],
    "        MVI C, 08H\nLOOP:   ; count down to zero\n" + HALT,
    "        MVI C, 08H\nLOOP:   DCR C\n        JNZ LOOP\n        HLT\n",
    [{ memory: {}, check: ["C", "T", "Z"] }],
    ["`DCR C` subtracts one from C and sets the zero flag when it reaches 0.",
      "`JNZ LOOP` jumps back while the zero flag is clear.",
      "The T-states must come out at 121. If yours differs, count again: the JNZ costs 10 when it jumps and 7 on the last pass when it does not."],
    ["8085", "loops", "t-states"]),

  MP("mp-evolution", "Hard", 314, "mp-largest", "Find the Largest Byte",
    "A block at **2050H** starts with a **count**, followed by that many bytes. Find the largest of them and store it at **2060H**.\n\n`CMP M` is a subtraction whose answer is thrown away — only the flags survive. After it, `CY = 1` means the accumulator was **smaller** than the byte in memory.\n\nThe count is in the data, so your program has to read it rather than assume five. Three different blocks are tested, one of them only three bytes long.",
    [{ input: "2050H = 04H, then 05H 09H 03H 07H", output: "2060H = 09H" }],
    "        LXI H, 2050H\n        MOV C, M        ; the count\n        ; keep the biggest byte in A, then store it\n" + HALT,
    "        LXI H, 2050H\n        MOV C, M\n        DCR C\n        INX H\n        MOV A, M\nLOOP:   INX H\n        CMP M\n        JNC SKIP\n        MOV A, M\nSKIP:   DCR C\n        JNZ LOOP\n        STA 2060H\n        HLT\n",
    [
      { memory: { [A50]: 0x04, [A50 + 1]: 0x05, [A50 + 2]: 0x09, [A50 + 3]: 0x03, [A50 + 4]: 0x07 }, check: ["A", "M:2060"] },
      { memory: { [A50]: 0x04, [A50 + 1]: 0xf0, [A50 + 2]: 0x11, [A50 + 3]: 0x22, [A50 + 4]: 0x33 }, check: ["A", "M:2060"] },
      { memory: { [A50]: 0x03, [A50 + 1]: 0x01, [A50 + 2]: 0x01, [A50 + 3]: 0x02 }, check: ["A", "M:2060"] },
    ],
    ["Take the first number into A, then compare the rest against it — so the loop runs count-1 times, which is why the reference does `DCR C` early.",
      "`CMP M` leaves A alone and sets the flags. `JNC` skips ahead when A was already the bigger one.",
      "When A is smaller, `MOV A, M` takes the new leader.",
      "The second test has the largest byte first — a program that assumes the answer is later in the block fails it."],
    ["8085", "loops", "compare"]),
];

export { mpProblems };
