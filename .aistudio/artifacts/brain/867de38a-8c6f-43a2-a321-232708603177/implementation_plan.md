# Braun-Inspired Tactile Calculator & History Tape

A modern, responsive calculator web application designed with a tactile hardware aesthetic, high-contrast digital display, interactive calculation history tape, full keyboard support, and resilient edge-case handling.

## User Review & Critical Decisions

> [!IMPORTANT]
> The plan below incorporates your confirmed design and feature choices from our initial review. Approve the plan to proceed with building the application.

- **Confirmed Visual Aesthetic**: **Tactile Hardware Style with High-Contrast Display** — Inspired by classic Dieter Rams / Braun industrial calculators (ET66), featuring a matte dark anodized casing, recessed high-contrast LCD/LED readout screen, and sculpted tactile physical keys with crisp active-press feedback.
- **Confirmed Utility Feature**: **Calculation History Tape** — An integrated side panel (or collapsible drawer on smaller screens) that logs every completed calculation, allowing users to click any past expression or result to load it directly back into the active calculator display.
- **Single-File Beginner-Friendly Architecture**: All calculator logic, layout, and styling will be cleanly organized and thoroughly commented so beginners can easily trace how state, DOM/event handling, keyboard listeners, and arithmetic edge cases work together, alongside a convenient one-click "Download Standalone HTML" button so learners can also save and open a single self-contained `.html` file anywhere.

---

## 1. Overview & Core Concept

- **What It Does**: Provides an intuitive, zero-latency arithmetic workspace supporting addition (`+`), subtraction (`-`), multiplication (`×`), division (`÷`), decimal inputs (`.`), All Clear (`C`), single-digit Delete/Backspace (`DEL`), and instant recall from a persistent calculation history tape.
- **Target Audience / Persona**: Everyday users needing quick, reliable calculations with a pleasant physical feel, as well as programming beginners looking for clean, well-documented calculator state logic.
- **Key Value**: Combines the unmistakable clarity and tactile satisfaction of a physical desk calculator with the convenience of full desktop keyboard shortcuts and clickable calculation history.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Number & Decimal Entry**: Users click number buttons (`0`–`9`) or type on their physical keyboard. Pressing `.` appends a decimal point if the current operand does not already contain one.
  2. **Chained & Immediate Operations**: Selecting an operator (`+`, `-`, `×`, `÷`) displays the pending expression in the upper expression readout line. Selecting a second operator after entering a second number automatically evaluates the intermediate result so chained calculations flow naturally.
  3. **Correction & Reset**: Pressing `DEL` (or `Backspace`) removes the rightmost digit of the current input. Pressing `C` (or `Escape`) resets the active calculation and clears any error state.
  4. **Evaluation & Edge Cases**: Pressing `=` (or `Enter`) computes the result, formats floating-point precision cleanly (preventing `0.1 + 0.2 = 0.30000000000000004`), logs the entry to the History Tape, and gracefully catches division by zero (`Cannot divide by zero`) without crashing.
  5. **History Tape Recall**: Clicking any item in the Calculation History Tape loads its result into the current input for immediate reuse, with a dedicated `Clear History` control to wipe the tape.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Industrial tactile precision (matte charcoal chassis, subtle bevel highlights, recessed amber/emerald-tinted high-contrast digital readout, and color-coded functional keys).
  - *Color Palette & Mood*:
    - **60% Dominant Neutral Canvas**: Crisp warm stone studio backdrop (`#F4F3EF`) on desktop that frames the hardware unit and paper-style history tape cleanly.
    - **30% Structural Surfaces**: Matte anthracite calculator body (`#1C1E21`), recessed dark LCD screen (`#111412`), dark slate numeric keys (`#2A2D32`), and warm off-white history tape surface (`#FAF9F5`).
    - **10% Accent Budget**: Braun-inspired burnt orange (`#E05A2B`) for the Clear (`C`) key, warm ochre/amber (`#D9822B`) for the Equals (`=`) action, and crisp steel blue-gray (`#3D434D`) for arithmetic operators.
  - *Typography & Hierarchy*:
    - **Display & UI Labels**: `Plus Jakarta Sans` (SemiBold 600 / Bold 700) for clean hardware legends, section headers, and key labels.
    - **Numeric Readout & History Tape**: `JetBrains Mono` with `font-variant-numeric: tabular-nums` so every digit, decimal point, and history row aligns with zero horizontal jitter.
  - *Component Styling & Layout*:
    - Full-viewport desktop workspace (`1440px` baseline) featuring a balanced two-column center stage: the tactile Hardware Calculator unit on the left and the interactive Calculation History Tape + Keyboard Shortcut Reference on the right.
    - Single-elevation card depth with realistic tactile button shadows that compress by `2px` (`translate-y-0.5`) when clicked or triggered via keyboard.

- **Interactive Feedback & Motion**:
  - Physical key-down visual highlight synchronized with both mouse clicks and physical keyboard keydowns (`120ms` transform transition).
  - Subtle copy confirmation and history-load indicator when reusing a value from the tape.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: IEEE-754 Floating-Point Precision Normalization**
  - *Chosen Approach*: Round evaluated results using precision normalization (`Number(Math.round(Number(val + 'e12')) + 'e-12')` with fallback to clean exponential notation for very large/small numbers).
  - *Why*: Standard JavaScript `0.1 + 0.2` produces `0.30000000000000004`, which breaks user trust and overflows calculator screens. Normalizing to 12 significant decimal places eliminates binary floating-point artifacts while keeping the code beginner-friendly.
  - *Alternatives Considered*: External arbitrary-precision math libraries (`decimal.js`), passed over to keep the codebase lightweight, dependency-free, and easy for beginners to read in a single file.

- **Decision 2: Consecutive Operator & Chained Calculation Handling**
  - *Chosen Approach*: If a user presses an operator immediately after another operator (e.g., `+` then `-`), the calculator replaces the pending operator with the new one instead of throwing a syntax error. If a second operand was already typed, pressing a new operator evaluates the running total first.
  - *Why*: Matches the forgiving, intuitive behavior of real desktop calculators.

- **Decision 3: Beginner-Friendly Code & Standalone Single-File Export**
  - *Chosen Approach*: Maintain all application logic in a single, thoroughly commented component file and include an interactive "Export Standalone HTML" button that downloads a self-contained single `.html` file (HTML + CSS + JS combined) with full beginner comments.
  - *Why*: Directly satisfies both the interactive preview environment and the user's request for a simple, well-commented single-file HTML/CSS/JS implementation that beginners can study and run anywhere.

---

## 4. Technical Architecture & Data Strategy

- **Architecture & Component Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Calculator Workspace (1440px)                       │
├───────────────────────────────────┬─────────────────────────────────────┤
│   Tactile Calculator Unit         │   Calculation History Tape          │
│                                   │                                     │
│  ┌─────────────────────────────┐  │  ┌───────────────────────────────┐  │
│  │ Recessed Digital Display    │  │  │ Tape Header & "Clear" Action  │  │
│  │  • Previous Expression Line │  │  ├───────────────────────────────┤  │
│  │  • Current Input / Result   │  │  │ Scrollable History Entries    │  │
│  └─────────────────────────────┘  │  │  • Expression (e.g. 48 × 12)  │  │
│                                   │  │  • Clickable Result (= 576)   │  │
│  ┌─────────────────────────────┐  │  └───────────────────────────────┘  │
│  │ 4×5 Sculpted Key Matrix     │  │                                     │
│  │  [ C ]  [DEL]  [ ÷ ]        │  │  ┌───────────────────────────────┐  │
│  │  [ 7 ]  [ 8 ]  [ 9 ]  [ × ] │  │  │ Keyboard Map & Single-File    │  │
│  │  [ 4 ]  [ 5 ]  [ 6 ]  [ - ] │  │  │ HTML Export Utility           │  │
│  │  [ 1 ]  [ 2 ]  [ 3 ]  [ + ] │  │  └───────────────────────────────┘  │
│  │  [   0   ]     [ . ]  [ = ] │  │                                     │
│  └─────────────────────────────┘  │                                     │
└─────────────────▲─────────────────┴──────────────────▲──────────────────┘
                  │                                    │
                  └──────────────┬─────────────────────┘
                                 │
        ┌────────────────────────▼────────────────────────┐
        │         Core Calculator State Engine            │
        │  • currentInput: string ("0")                   │
        │  • previousInput: string ("")                   │
        │  • operator: "+" | "-" | "*" | "/" | null       │
        │  • shouldResetScreen: boolean                   │
        │  • errorMessage: string | null                  │
        │  • historyTape: Array<{ id, expr, result }>     │
        │  • activeKey: string | null (visual key press)  │
        └────────────────────────▲────────────────────────┘
                                 │
        ┌────────────────────────┴────────────────────────┐
        │    Global Keyboard Listener (window.keydown)    │
        │  Maps 0-9, ., +, -, *, /, Enter/=, Backspace,   │
        │  and Escape/c to calculator actions + key flash │
        └─────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - `currentInput`: String representing the active number being typed or the latest evaluated result (defaults to `"0"`).
  - `previousInput`: String storing the left-hand operand once an arithmetic operator is chosen.
  - `operator`: Active arithmetic operation (`"+"`, `"-"`, `"*"`, `"/"`, or `null`).
  - `shouldResetScreen`: Boolean flag set after `=` or operator evaluation so typing a new digit starts a fresh number rather than appending to the result.
  - `errorMessage`: Holds user-friendly error text (such as `"Cannot divide by zero"`) and locks operator chaining until cleared or a new digit is typed.
  - `historyTape`: Array of completed calculations (`id`, `expression`, `result`, `timestamp`), persisted in `localStorage` so calculations remain available across refreshes.

- **Interactive Component & State Mapping**:
  - **Digit Handler (`appendDigit`)**: Replaces leading `"0"` (unless entering `"0."`), clears any active error state, and enforces a sensible 16-digit input cap to prevent display overflow.
  - **Decimal Handler (`appendDecimal`)**: If `shouldResetScreen` is true, starts `"0."`; otherwise checks `!currentInput.includes(".")` before appending `"."` so multiple decimal points in a single number are impossible.
  - **Delete Handler (`deleteLastDigit`)**: Removes the final character of `currentInput`; if only one digit (or a negative single digit like `"-5"`) remains, resets cleanly to `"0"`.
  - **Clear Handler (`clearAll`)**: Resets `currentInput` to `"0"`, `previousInput` to `""`, `operator` to `null`, and clears `errorMessage`.
  - **Evaluate Handler (`calculateResult`)**: Parses `previousInput` and `currentInput` as floats, checks for `operator === "/" && current === 0` to trigger the division-by-zero safeguard, applies precision rounding, updates the display, and prepends a new record to `historyTape`.
