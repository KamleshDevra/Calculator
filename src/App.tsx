/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Tactile Desk Calculator
 * -----------------------
 * A beginner-friendly, thoroughly commented calculator application featuring:
 * 1. Basic arithmetic operations: Addition (+), Subtraction (-), Multiplication (*), Division (/)
 * 2. Clear (C) and Delete/Backspace (DEL) controls
 * 3. Decimal point input with duplicate decimal prevention
 * 4. Full physical keyboard support with synchronized tactile key press feedback
 * 5. Edge case protection (division by zero, floating-point precision, chained operations)
 * 6. Interactive Calculation History Tape to reuse past results
 * 7. Standalone single-file HTML/CSS/JS viewer and one-click file download for beginners
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Delete, RotateCcw, Download, Copy, Check, History, Keyboard, Code2 } from 'lucide-react';

// ============================================================================
// 1. TYPE DEFINITIONS
// ============================================================================

/** Supported arithmetic operators */
type Operator = '+' | '-' | '*' | '/' | null;

/** Structure of a single entry in the calculation history tape */
interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

/** Structure defining each physical calculator button */
interface CalculatorKey {
  label: string;
  subLabel?: string;
  actionId: string;
  variant: 'number' | 'operator' | 'clear' | 'delete' | 'equals';
  colSpan?: number;
  ariaLabel: string;
}

// ============================================================================
// 2. STANDALONE SINGLE-FILE HTML/CSS/JS SOURCE FOR BEGINNERS
// ============================================================================
// This string contains a complete, self-contained single-file HTML version of
// the calculator so beginners can inspect or download it as a single .html file.
const STANDALONE_HTML_SOURCE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tactile Desk Calculator — Single-File Edition</title>
  <style>
    /* ==========================================================================
       1. CSS STYLING — Modern, Responsive Tactile Hardware Design
       ========================================================================== */
    :root {
      --bg-canvas: #F4F3EF;
      --chassis-bg: #1C1E21;
      --lcd-bg: #111412;
      --lcd-text: #E6F0EC;
      --lcd-muted: #7C9087;
      --key-num: #2A2D32;
      --key-op: #3D434D;
      --key-clear: #E05A2B;
      --key-equals: #D9822B;
      --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--font-sans);
      background-color: var(--bg-canvas);
      color: #1C1E21;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 24px;
    }

    /* Main Workspace Layout */
    .workspace {
      display: grid;
      grid-template-columns: 1fr;
      gap: 28px;
      max-width: 820px;
      width: 100%;
      align-items: start;
    }

    @media (min-width: 768px) {
      .workspace {
        grid-template-columns: 380px 1fr;
      }
    }

    /* Calculator Hardware Chassis */
    .calculator-chassis {
      background-color: var(--chassis-bg);
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.25);
      border: 1px solid #2E3238;
    }

    .chassis-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      color: #9BA1A8;
      font-size: 12px;
      letter-spacing: 0.06em;
    }

    /* High-Contrast Recessed Display Screen */
    .display-screen {
      background-color: var(--lcd-bg);
      border-radius: 12px;
      padding: 18px 20px;
      margin-bottom: 22px;
      min-height: 108px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-align: right;
      box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.7), 0 1px 0 rgba(255, 255, 255, 0.07);
      border: 1px solid #0A0C0B;
      overflow: hidden;
    }

    .expression-line {
      font-family: var(--font-mono);
      font-variant-numeric: tabular-nums;
      color: var(--lcd-muted);
      font-size: 14px;
      min-height: 20px;
      word-break: break-all;
    }

    .current-output {
      font-family: var(--font-mono);
      font-variant-numeric: tabular-nums;
      color: var(--lcd-text);
      font-size: 34px;
      font-weight: 600;
      line-height: 1.15;
      overflow-x: auto;
      white-space: nowrap;
    }

    .current-output.error-text {
      color: #F87171;
      font-size: 20px;
    }

    /* 4-Column Button Grid */
    .keypad-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }

    .calc-btn {
      appearance: none;
      border: none;
      border-radius: 10px;
      height: 58px;
      font-family: var(--font-mono);
      font-size: 20px;
      font-weight: 600;
      color: #F3F4F6;
      background-color: var(--key-num);
      cursor: pointer;
      user-select: none;
      box-shadow: 0 4px 0 #111315, 0 6px 10px -2px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.14);
      transition: transform 0.1s ease, box-shadow 0.1s ease, filter 0.1s ease;
    }

    .calc-btn:hover {
      filter: brightness(1.08);
    }

    .calc-btn:active,
    .calc-btn.active-key {
      transform: translateY(3px);
      box-shadow: 0 1px 0 #111315, 0 2px 4px -1px rgba(0, 0, 0, 0.4);
    }

    .calc-btn.span-2 {
      grid-column: span 2;
    }

    .calc-btn.btn-operator {
      background-color: var(--key-op);
    }

    .calc-btn.btn-clear {
      background-color: var(--key-clear);
      color: #FFFFFF;
    }

    .calc-btn.btn-equals {
      background-color: var(--key-equals);
      color: #FFFFFF;
    }

    /* Calculation History Tape Panel */
    .history-panel {
      background-color: #FAF9F5;
      border: 1px solid #DFDDD6;
      border-radius: 16px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      min-height: 460px;
    }

    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 14px;
      border-bottom: 1px solid #E6E4DD;
      margin-bottom: 14px;
    }

    .history-title {
      font-size: 16px;
      font-weight: 600;
    }

    .clear-history-btn {
      background: transparent;
      border: 1px solid #D5D3CB;
      border-radius: 6px;
      padding: 5px 10px;
      font-size: 12px;
      cursor: pointer;
      color: #4B5563;
    }

    .history-list {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 360px;
    }

    .history-item {
      text-align: right;
      padding: 10px 12px;
      border-radius: 8px;
      background: #FFFFFF;
      border: 1px solid #ECEAE3;
      cursor: pointer;
      font-family: var(--font-mono);
      transition: border-color 0.15s ease;
    }

    .history-item:hover {
      border-color: #D9822B;
    }

    .history-expr {
      font-size: 12px;
      color: #6B7280;
      margin-bottom: 2px;
    }

    .history-res {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
    }
  </style>
</head>
<body>
  <main class="workspace">
    <!-- Left Column: Tactile Calculator Unit -->
    <section class="calculator-chassis" aria-label="Calculator">
      <div class="chassis-header">
        <span>BRAUN ET-66 STUDIO</span>
        <span>12-DIGIT PRECISION</span>
      </div>

      <!-- Display Screen -->
      <div class="display-screen" role="region" aria-live="polite">
        <div id="expressionDisplay" class="expression-line"></div>
        <div id="currentDisplay" class="current-output">0</div>
      </div>

      <!-- Calculator Keypad -->
      <div class="keypad-grid">
        <button class="calc-btn btn-clear span-2" data-action="clear" aria-label="Clear All">C</button>
        <button class="calc-btn btn-operator" data-action="delete" aria-label="Delete Last Digit">DEL</button>
        <button class="calc-btn btn-operator" data-action="operator" data-value="/" aria-label="Divide">&divide;</button>

        <button class="calc-btn" data-action="digit" data-value="7">7</button>
        <button class="calc-btn" data-action="digit" data-value="8">8</button>
        <button class="calc-btn" data-action="digit" data-value="9">9</button>
        <button class="calc-btn btn-operator" data-action="operator" data-value="*" aria-label="Multiply">&times;</button>

        <button class="calc-btn" data-action="digit" data-value="4">4</button>
        <button class="calc-btn" data-action="digit" data-value="5">5</button>
        <button class="calc-btn" data-action="digit" data-value="6">6</button>
        <button class="calc-btn btn-operator" data-action="operator" data-value="-" aria-label="Subtract">&minus;</button>

        <button class="calc-btn" data-action="digit" data-value="1">1</button>
        <button class="calc-btn" data-action="digit" data-value="2">2</button>
        <button class="calc-btn" data-action="digit" data-value="3">3</button>
        <button class="calc-btn btn-operator" data-action="operator" data-value="+" aria-label="Add">+</button>

        <button class="calc-btn span-2" data-action="digit" data-value="0">0</button>
        <button class="calc-btn" data-action="decimal" data-value=".">.</button>
        <button class="calc-btn btn-equals" data-action="calculate" aria-label="Equals">=</button>
      </div>
    </section>

    <!-- Right Column: Calculation History Tape -->
    <aside class="history-panel" aria-label="Calculation History">
      <div class="history-header">
        <h2 class="history-title">Calculation Tape</h2>
        <button id="clearHistoryBtn" class="clear-history-btn">Clear Tape</button>
      </div>
      <div id="historyList" class="history-list">
        <p style="color:#6B7280;font-size:13px;padding:12px 0;">Completed calculations will appear here. Click any entry to reuse its result.</p>
      </div>
    </aside>
  </main>

  <script>
    // ==========================================================================
    // 2. JAVASCRIPT LOGIC — State Management, Edge Cases & Keyboard Support
    // ==========================================================================

    // Calculator state variables
    let currentInput = '0';
    let previousInput = '';
    let operator = null;
    let shouldResetScreen = false;
    let errorMessage = null;
    let historyTape = [];

    // DOM Element References
    const currentDisplay = document.getElementById('currentDisplay');
    const expressionDisplay = document.getElementById('expressionDisplay');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    // Helper: Convert internal operator symbol to readable math symbol
    function formatOperator(op) {
      if (op === '*') return '×';
      if (op === '/') return '÷';
      if (op === '-') return '−';
      return op || '';
    }

    // Helper: Cleanly round floating-point numbers (fixes 0.1 + 0.2 = 0.30000000000000004)
    function normalizePrecision(num) {
      if (!Number.isFinite(num)) return 'Error';
      if (Math.abs(num) >= 1e12 || (Math.abs(num) > 0 && Math.abs(num) < 1e-9)) {
        return Number(num.toPrecision(8)).toString();
      }
      return Number(Math.round(Number(num + 'e12')) + 'e-12').toString();
    }

    // Update the calculator screen UI
    function updateDisplay() {
      if (errorMessage) {
        currentDisplay.textContent = errorMessage;
        currentDisplay.classList.add('error-text');
      } else {
        currentDisplay.textContent = currentInput;
        currentDisplay.classList.remove('error-text');
      }

      if (previousInput && operator) {
        expressionDisplay.textContent = previousInput + ' ' + formatOperator(operator);
      } else {
        expressionDisplay.textContent = '';
      }
    }

    // Render the calculation history tape
    function renderHistory() {
      if (historyTape.length === 0) {
        historyList.innerHTML = '<p style="color:#6B7280;font-size:13px;padding:12px 0;">Completed calculations will appear here. Click any entry to reuse its result.</p>';
        return;
      }
      historyList.innerHTML = historyTape.map((item) => (
        '<div class="history-item" data-result="' + item.result + '">' +
          '<div class="history-expr">' + item.expression + ' =</div>' +
          '<div class="history-res">' + item.result + '</div>' +
        '</div>'
      )).join('');
    }

    // 1. Handle Digit Input (0-9)
    function appendDigit(digit) {
      if (errorMessage) clearAll();
      if (shouldResetScreen) {
        currentInput = digit;
        shouldResetScreen = false;
      } else {
        if (currentInput.replace(/[-.]/g, '').length >= 12) return;
        currentInput = currentInput === '0' ? digit : currentInput + digit;
      }
      updateDisplay();
    }

    // 2. Handle Decimal Point (.) — Prevents multiple decimals in one number
    function appendDecimal() {
      if (errorMessage) clearAll();
      if (shouldResetScreen) {
        currentInput = '0.';
        shouldResetScreen = false;
        updateDisplay();
        return;
      }
      if (!currentInput.includes('.')) {
        currentInput += '.';
        updateDisplay();
      }
    }

    // 3. Handle Operator (+, -, *, /)
    function chooseOperator(nextOp) {
      if (errorMessage) return;
      if (operator && !shouldResetScreen) {
        calculateResult();
        if (errorMessage) return;
      }
      previousInput = currentInput;
      operator = nextOp;
      shouldResetScreen = true;
      updateDisplay();
    }

    // 4. Evaluate Expression (=) — Handles Division by Zero safely
    function calculateResult() {
      if (errorMessage || !operator || !previousInput) return;

      const prev = parseFloat(previousInput);
      const current = parseFloat(currentInput);
      if (isNaN(prev) || isNaN(current)) return;

      // Edge Case: Division by zero check
      if (operator === '/' && current === 0) {
        errorMessage = 'Cannot divide by zero';
        previousInput = '';
        operator = null;
        shouldResetScreen = true;
        updateDisplay();
        return;
      }

      let rawResult = 0;
      switch (operator) {
        case '+': rawResult = prev + current; break;
        case '-': rawResult = prev - current; break;
        case '*': rawResult = prev * current; break;
        case '/': rawResult = prev / current; break;
      }

      const formattedResult = normalizePrecision(rawResult);
      const exprText = previousInput + ' ' + formatOperator(operator) + ' ' + currentInput;

      // Save to History Tape
      historyTape.unshift({ expression: exprText, result: formattedResult });
      renderHistory();

      currentInput = formattedResult;
      previousInput = '';
      operator = null;
      shouldResetScreen = true;
      updateDisplay();
    }

    // 5. Delete / Backspace (DEL)
    function deleteLastDigit() {
      if (errorMessage) {
        clearAll();
        return;
      }
      if (shouldResetScreen) return;

      if (currentInput.length === 1 || (currentInput.length === 2 && currentInput.startsWith('-'))) {
        currentInput = '0';
      } else {
        currentInput = currentInput.slice(0, -1);
      }
      updateDisplay();
    }

    // 6. All Clear (C)
    function clearAll() {
      currentInput = '0';
      previousInput = '';
      operator = null;
      shouldResetScreen = false;
      errorMessage = null;
      updateDisplay();
    }

    // Button Click Event Listener
    document.querySelector('.keypad-grid').addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const action = btn.dataset.action;
      const value = btn.dataset.value;

      if (action === 'digit') appendDigit(value);
      if (action === 'decimal') appendDecimal();
      if (action === 'operator') chooseOperator(value);
      if (action === 'calculate') calculateResult();
      if (action === 'delete') deleteLastDigit();
      if (action === 'clear') clearAll();
    });

    // History Tape Click-to-Reuse Listener
    historyList.addEventListener('click', (e) => {
      const item = e.target.closest('.history-item');
      if (!item) return;
      errorMessage = null;
      currentInput = item.dataset.result;
      shouldResetScreen = false;
      updateDisplay();
    });

    clearHistoryBtn.addEventListener('click', () => {
      historyTape = [];
      renderHistory();
    });

    // Full Physical Keyboard Support
    window.addEventListener('keydown', (e) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        appendDigit(e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        appendDecimal();
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        e.preventDefault();
        chooseOperator(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculateResult();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        deleteLastDigit();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        clearAll();
      }
    });
  </script>
</body>
</html>`;

// ============================================================================
// 3. KEYPAD LAYOUT DEFINITION
// ============================================================================
const CALCULATOR_KEYS: CalculatorKey[] = [
  { label: 'C', subLabel: 'ESC', actionId: 'clear', variant: 'clear', colSpan: 2, ariaLabel: 'Clear calculator (Escape)' },
  { label: 'DEL', subLabel: 'BKSP', actionId: 'delete', variant: 'delete', ariaLabel: 'Delete last digit (Backspace)' },
  { label: '÷', subLabel: '/', actionId: '/', variant: 'operator', ariaLabel: 'Divide (/)' },

  { label: '7', actionId: '7', variant: 'number', ariaLabel: 'Seven' },
  { label: '8', actionId: '8', variant: 'number', ariaLabel: 'Eight' },
  { label: '9', actionId: '9', variant: 'number', ariaLabel: 'Nine' },
  { label: '×', subLabel: '*', actionId: '*', variant: 'operator', ariaLabel: 'Multiply (*)' },

  { label: '4', actionId: '4', variant: 'number', ariaLabel: 'Four' },
  { label: '5', actionId: '5', variant: 'number', ariaLabel: 'Five' },
  { label: '6', actionId: '6', variant: 'number', ariaLabel: 'Six' },
  { label: '−', subLabel: '-', actionId: '-', variant: 'operator', ariaLabel: 'Subtract (-)' },

  { label: '1', actionId: '1', variant: 'number', ariaLabel: 'One' },
  { label: '2', actionId: '2', variant: 'number', ariaLabel: 'Two' },
  { label: '3', actionId: '3', variant: 'number', ariaLabel: 'Three' },
  { label: '+', subLabel: '+', actionId: '+', variant: 'operator', ariaLabel: 'Add (+)' },

  { label: '0', actionId: '0', variant: 'number', colSpan: 2, ariaLabel: 'Zero' },
  { label: '.', actionId: '.', variant: 'number', ariaLabel: 'Decimal point' },
  { label: '=', subLabel: 'ENT', actionId: '=', variant: 'equals', ariaLabel: 'Equals (Enter)' },
];

// Initial helpful sample calculations so the history tape is immediately demonstrative
const INITIAL_HISTORY: HistoryEntry[] = [
  {
    id: 'sample-1',
    expression: '125 × 8',
    result: '1000',
    timestamp: 'Ready to reuse',
  },
  {
    id: 'sample-2',
    expression: '355 ÷ 113',
    result: '3.141592920354',
    timestamp: 'Pi approximation',
  },
];

// ============================================================================
// 4. HELPER FUNCTIONS
// ============================================================================

/**
 * Formats an internal operator token ('*', '/', '-', '+') into a clean mathematical glyph.
 */
function formatOperatorGlyph(op: Operator): string {
  switch (op) {
    case '*':
      return '×';
    case '/':
      return '÷';
    case '-':
      return '−';
    case '+':
      return '+';
    default:
      return '';
  }
}

/**
 * Normalizes IEEE-754 floating-point math results so expressions like 0.1 + 0.2
 * evaluate cleanly to "0.3" instead of "0.30000000000000004".
 */
function normalizeNumberPrecision(value: number): string {
  if (!Number.isFinite(value)) {
    return 'Error';
  }
  // Use clean scientific notation for extremely large or tiny numbers
  if (Math.abs(value) >= 1e12 || (Math.abs(value) > 0 && Math.abs(value) < 1e-9)) {
    return Number(value.toPrecision(8)).toString();
  }
  // Round to 12 decimal places to strip binary floating-point representation noise
  const rounded = Number(Math.round(Number(value + 'e12')) + 'e-12');
  return rounded.toString();
}

/**
 * Adds thousand separators to the integer part of a numeric string for readability,
 * while preserving trailing decimals or exponential notation.
 */
function formatDisplayNumber(raw: string): string {
  if (!raw || raw.includes('e') || raw.includes('E') || raw === 'Error') {
    return raw;
  }
  const isNegative = raw.startsWith('-');
  const unsigned = isNegative ? raw.slice(1) : raw;
  const [integerPart, decimalPart] = unsigned.split('.');
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const combined = decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  return isNegative ? `-${combined}` : combined;
}

// ============================================================================
// 5. MAIN APPLICATION COMPONENT
// ============================================================================

export default function App() {
  // --- Core Calculator State ---
  const [currentInput, setCurrentInput] = useState<string>('0');
  const [previousInput, setPreviousInput] = useState<string>('');
  const [operator, setOperator] = useState<Operator>(null);
  const [shouldResetScreen, setShouldResetScreen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastCompletedExpr, setLastCompletedExpr] = useState<string>('');

  // --- History Tape & UI Feedback State ---
  const [historyTape, setHistoryTape] = useState<HistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('tactile_calc_history_v1');
      return saved ? JSON.parse(saved) : INITIAL_HISTORY;
    } catch {
      return INITIAL_HISTORY;
    }
  });
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [copiedResult, setCopiedResult] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [recalledId, setRecalledId] = useState<string | null>(null);
  const [activeRightTab, setActiveRightTab] = useState<'tape' | 'shortcuts' | 'code'>('tape');

  // Persist calculation history tape in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tactile_calc_history_v1', JSON.stringify(historyTape));
    } catch {
      // Ignore storage quota errors in restricted environments
    }
  }, [historyTape]);

  // Brief visual depression effect when pressing keys on a physical keyboard
  const triggerKeyVisual = useCallback((actionId: string) => {
    setActiveKey(actionId);
    const timer = window.setTimeout(() => {
      setActiveKey((prev) => (prev === actionId ? null : prev));
    }, 130);
    return () => window.clearTimeout(timer);
  }, []);

  // --------------------------------------------------------------------------
  // Calculator Operations (Well-Commented for Beginners)
  // --------------------------------------------------------------------------

  /**
   * Resets all calculator state back to its initial zero state (C button).
   */
  const clearAll = useCallback(() => {
    setCurrentInput('0');
    setPreviousInput('');
    setOperator(null);
    setShouldResetScreen(false);
    setErrorMessage(null);
    setLastCompletedExpr('');
  }, []);

  /**
   * Appends a digit (0-9) to the active input string.
   * Replaces leading '0' unless entering a decimal, and caps length at 12 digits.
   */
  const appendDigit = useCallback(
    (digit: string) => {
      // If an error is showing (like division by zero), start fresh with the new digit
      if (errorMessage) {
        setErrorMessage(null);
        setCurrentInput(digit);
        setPreviousInput('');
        setOperator(null);
        setShouldResetScreen(false);
        setLastCompletedExpr('');
        return;
      }

      // If we just completed an operation or pressed an operator, begin a brand-new number
      if (shouldResetScreen) {
        setCurrentInput(digit);
        setShouldResetScreen(false);
        setLastCompletedExpr('');
        return;
      }

      // Limit input to 12 digits so numbers stay legible inside the display
      const digitCount = currentInput.replace(/[-.]/g, '').length;
      if (digitCount >= 12) {
        return;
      }

      // Replace initial '0' with the typed digit, or append to existing digits
      setCurrentInput((prev) => (prev === '0' ? digit : prev + digit));
    },
    [currentInput, errorMessage, shouldResetScreen]
  );

  /**
   * Appends a decimal point ('.') to the current number.
   * Ensures a single number can never contain more than one decimal point.
   */
  const appendDecimal = useCallback(() => {
    if (errorMessage) {
      setErrorMessage(null);
      setCurrentInput('0.');
      setPreviousInput('');
      setOperator(null);
      setShouldResetScreen(false);
      setLastCompletedExpr('');
      return;
    }

    // If starting a new operand after an operator or '=', begin with "0."
    if (shouldResetScreen) {
      setCurrentInput('0.');
      setShouldResetScreen(false);
      setLastCompletedExpr('');
      return;
    }

    // Guard against multiple decimal points in the same operand
    if (!currentInput.includes('.')) {
      setCurrentInput((prev) => `${prev}.`);
    }
  }, [currentInput, errorMessage, shouldResetScreen]);

  /**
   * Deletes the rightmost digit from the current input (DEL / Backspace).
   */
  const deleteLastDigit = useCallback(() => {
    if (errorMessage) {
      clearAll();
      return;
    }

    // If the screen is showing a finalized result, pressing DEL clears the expression badge
    if (shouldResetScreen) {
      setLastCompletedExpr('');
      return;
    }

    setCurrentInput((prev) => {
      // If only a single digit remains (or a negative single digit like "-4"), reset to "0"
      if (prev.length <= 1 || (prev.length === 2 && prev.startsWith('-'))) {
        return '0';
      }
      return prev.slice(0, -1);
    });
  }, [clearAll, errorMessage, shouldResetScreen]);

  /**
   * Evaluates the pending binary expression (previousInput [operator] currentInput).
   * Catches division by zero and logs valid calculations to the History Tape.
   */
  const calculateResult = useCallback(() => {
    if (errorMessage || !operator || !previousInput) {
      return;
    }

    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);

    if (Number.isNaN(prev) || Number.isNaN(current)) {
      return;
    }

    // Edge Case Protection: Division by Zero
    if (operator === '/' && current === 0) {
      setErrorMessage('Cannot divide by zero');
      setPreviousInput('');
      setOperator(null);
      setShouldResetScreen(true);
      setLastCompletedExpr(`${previousInput} ÷ 0`);
      return;
    }

    let rawResult = 0;
    switch (operator) {
      case '+':
        rawResult = prev + current;
        break;
      case '-':
        rawResult = prev - current;
        break;
      case '*':
        rawResult = prev * current;
        break;
      case '/':
        rawResult = prev / current;
        break;
    }

    const cleanResult = normalizeNumberPrecision(rawResult);
    const formattedExpr = `${formatDisplayNumber(previousInput)} ${formatOperatorGlyph(operator)} ${formatDisplayNumber(currentInput)}`;

    // Prepend the finished calculation to the History Tape
    const newEntry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      expression: formattedExpr,
      result: cleanResult,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setHistoryTape((prevTape) => [newEntry, ...prevTape.slice(0, 49)]);
    setCurrentInput(cleanResult);
    setPreviousInput('');
    setOperator(null);
    setShouldResetScreen(true);
    setLastCompletedExpr(`${formattedExpr} =`);
  }, [currentInput, errorMessage, operator, previousInput]);

  /**
   * Selects an arithmetic operator (+, -, *, /).
   * Supports both immediate operator replacement and chained calculations.
   */
  const chooseOperator = useCallback(
    (nextOp: Exclude<Operator, null>) => {
      if (errorMessage) {
        return;
      }

      // If the user already selected an operator and hasn't typed a second number yet,
      // simply swap the operator (e.g., pressing '+' then '*' changes '+' to '*')
      if (operator && shouldResetScreen) {
        setOperator(nextOp);
        return;
      }

      // If a full pending operation exists (e.g., "12 + 8" and user presses "-"),
      // compute the intermediate result first so chained arithmetic works seamlessly
      if (operator && previousInput && !shouldResetScreen) {
        const prev = parseFloat(previousInput);
        const current = parseFloat(currentInput);

        if (operator === '/' && current === 0) {
          setErrorMessage('Cannot divide by zero');
          setPreviousInput('');
          setOperator(null);
          setShouldResetScreen(true);
          setLastCompletedExpr(`${previousInput} ÷ 0`);
          return;
        }

        let intermediate = 0;
        switch (operator) {
          case '+':
            intermediate = prev + current;
            break;
          case '-':
            intermediate = prev - current;
            break;
          case '*':
            intermediate = prev * current;
            break;
          case '/':
            intermediate = prev / current;
            break;
        }

        const cleanIntermediate = normalizeNumberPrecision(intermediate);
        const formattedExpr = `${formatDisplayNumber(previousInput)} ${formatOperatorGlyph(operator)} ${formatDisplayNumber(currentInput)}`;

        // Log intermediate step to the history tape as well
        setHistoryTape((prevTape) => [
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            expression: formattedExpr,
            result: cleanIntermediate,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          },
          ...prevTape.slice(0, 49),
        ]);

        setCurrentInput(cleanIntermediate);
        setPreviousInput(cleanIntermediate);
        setOperator(nextOp);
        setShouldResetScreen(true);
        setLastCompletedExpr('');
        return;
      }

      // Standard first operator selection
      setPreviousInput(currentInput);
      setOperator(nextOp);
      setShouldResetScreen(true);
      setLastCompletedExpr('');
    },
    [currentInput, errorMessage, operator, previousInput, shouldResetScreen]
  );

  /**
   * Unified dispatcher for clicking any key on the calculator pad.
   */
  const handleKeyAction = useCallback(
    (actionId: string) => {
      triggerKeyVisual(actionId);

      if (actionId >= '0' && actionId <= '9') {
        appendDigit(actionId);
      } else if (actionId === '.') {
        appendDecimal();
      } else if (actionId === '+' || actionId === '-' || actionId === '*' || actionId === '/') {
        chooseOperator(actionId);
      } else if (actionId === '=') {
        calculateResult();
      } else if (actionId === 'delete') {
        deleteLastDigit();
      } else if (actionId === 'clear') {
        clearAll();
      }
    },
    [appendDecimal, appendDigit, calculateResult, chooseOperator, clearAll, deleteLastDigit, triggerKeyVisual]
  );

  // --------------------------------------------------------------------------
  // Global Keyboard Support (window.keydown)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Do not hijack keyboard shortcuts if user is pressing Cmd/Ctrl combinations (like Ctrl+C)
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const { key } = event;

      if (key >= '0' && key <= '9') {
        event.preventDefault();
        handleKeyAction(key);
      } else if (key === '.' || key === ',') {
        event.preventDefault();
        handleKeyAction('.');
      } else if (key === '+' || key === '-') {
        event.preventDefault();
        handleKeyAction(key);
      } else if (key === '*' || key === 'x' || key === 'X') {
        event.preventDefault();
        handleKeyAction('*');
      } else if (key === '/') {
        event.preventDefault();
        handleKeyAction('/');
      } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        handleKeyAction('=');
      } else if (key === 'Backspace' || key === 'Delete') {
        event.preventDefault();
        handleKeyAction('delete');
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        event.preventDefault();
        handleKeyAction('clear');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyAction]);

  // --------------------------------------------------------------------------
  // Utility Handlers (History Recall, Copy Result, Download Single-File HTML)
  // --------------------------------------------------------------------------

  /** Loads a past result from the Calculation History Tape into the active calculator input */
  const handleRecallFromTape = (entry: HistoryEntry) => {
    setErrorMessage(null);
    setCurrentInput(entry.result);
    setShouldResetScreen(false);
    setLastCompletedExpr(`Recalled: ${entry.expression} =`);
    setRecalledId(entry.id);
    window.setTimeout(() => {
      setRecalledId((prev) => (prev === entry.id ? null : prev));
    }, 900);
  };

  /** Copies the current calculator readout to the clipboard */
  const handleCopyDisplay = async () => {
    if (errorMessage) return;
    try {
      await navigator.clipboard.writeText(currentInput);
      setCopiedResult(true);
      window.setTimeout(() => setCopiedResult(false), 1500);
    } catch {
      // Fallback ignored if clipboard permission denied
    }
  };

  /** Copies the standalone single-file HTML code to the clipboard */
  const handleCopyStandaloneCode = async () => {
    try {
      await navigator.clipboard.writeText(STANDALONE_HTML_SOURCE);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 1800);
    } catch {
      // Fallback ignored
    }
  };

  /** Triggers a browser download of the self-contained single-file calculator.html */
  const handleDownloadStandaloneHtml = () => {
    const blob = new Blob([STANDALONE_HTML_SOURCE], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tactile-calculator-single-file.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Compute formatted display string and dynamic font sizing for long numbers
  const formattedDisplay = errorMessage ? errorMessage : formatDisplayNumber(currentInput);
  const topExpressionLine =
    previousInput && operator
      ? `${formatDisplayNumber(previousInput)} ${formatOperatorGlyph(operator)}`
      : lastCompletedExpr;

  const getDisplayFontSizeClass = (text: string) => {
    if (errorMessage) return 'text-xl sm:text-2xl text-[#F87171]';
    if (text.length > 14) return 'text-2xl sm:text-3xl text-[#E6F0EC]';
    if (text.length > 10) return 'text-3xl sm:text-4xl text-[#E6F0EC]';
    return 'text-4xl sm:text-[42px] text-[#E6F0EC]';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F3EF] text-[#1C1E21] selection:bg-[#D9822B]/20">
      {/* ====================================================================
          TOP NAVIGATION BAR (Strict 3-Zone Contract)
         ==================================================================== */}
      <header className="w-full border-b border-[#E2E0D8] bg-[#FAF9F5]">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#calculator-workspace"
            className="text-lg font-bold tracking-tight text-[#1C1E21] whitespace-nowrap shrink-0"
          >
            Braun ET-66 Calculator
          </a>

          {/* Zone 2: Concise Single-Line Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#525860]">
            <button
              type="button"
              onClick={() => setActiveRightTab('tape')}
              className={`hover:text-[#1C1E21] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeRightTab === 'tape' ? 'text-[#1C1E21] underline underline-offset-8 decoration-2 decoration-[#D9822B]' : ''
              }`}
            >
              History Tape
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('shortcuts')}
              className={`hover:text-[#1C1E21] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeRightTab === 'shortcuts' ? 'text-[#1C1E21] underline underline-offset-8 decoration-2 decoration-[#D9822B]' : ''
              }`}
            >
              Keyboard Map
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('code')}
              className={`hover:text-[#1C1E21] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeRightTab === 'code' ? 'text-[#1C1E21] underline underline-offset-8 decoration-2 decoration-[#D9822B]' : ''
              }`}
            >
              Single-File Code
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="hover:text-[#E05A2B] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Reset Display
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action Button */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleDownloadStandaloneHtml}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1C1E21] rounded-lg hover:bg-[#2E3238] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Single-File HTML</span>
            </button>
          </div>
        </div>
      </header>

      {/* ====================================================================
          MAIN DESKTOP WORKSPACE (Balanced 2-Column Tactile Hardware + Tape)
         ==================================================================== */}
      <main
        id="calculator-workspace"
        className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-8 md:py-12 flex flex-col justify-center"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* ----------------------------------------------------------------
              LEFT COLUMN: Tactile Hardware Calculator Unit (5 Columns on Desktop)
             ---------------------------------------------------------------- */}
          <section
            aria-label="Tactile Calculator"
            className="lg:col-span-5 flex flex-col justify-between bg-[#1C1E21] text-[#F3F4F6] rounded-[24px] p-6 sm:p-7 border border-[#2E3238] shadow-[0_24px_48px_-16px_rgba(20,22,25,0.28)]"
          >
            <div>
              {/* Subtle Industrial Chassis Silk-Screen Legend */}
              <div className="flex items-center justify-between text-xs text-[#9BA1A8] mb-4 tracking-wider">
                <span className="font-semibold text-[#D6D9DC]">ET-66 ARITHMETIC</span>
                <div className="flex items-center gap-2 text-[11px] font-mono-tabular">
                  <span>12-DIGIT</span>
                  <span aria-hidden="true">·</span>
                  <span>FLOATING POINT</span>
                </div>
              </div>

              {/* Recessed High-Contrast LCD Readout Screen */}
              <div
                role="region"
                aria-label="Calculator Display Screen"
                aria-live="polite"
                className="recessed-lcd bg-[#111412] border border-[#0A0C0B] rounded-2xl p-5 mb-6 flex flex-col justify-between min-h-[126px]"
              >
                {/* Top row: Previous expression + Copy Value button */}
                <div className="flex items-center justify-between gap-2 min-h-[24px]">
                  <button
                    type="button"
                    onClick={handleCopyDisplay}
                    disabled={Boolean(errorMessage)}
                    title="Copy current result to clipboard"
                    className="inline-flex items-center gap-1.5 text-[11px] font-mono-tabular text-[#7C9087] hover:text-[#E6F0EC] disabled:opacity-40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {copiedResult ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#34D399]" />
                        <span className="text-[#34D399]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <div className="font-mono-tabular text-sm text-[#8CA399] text-right truncate">
                    {topExpressionLine || '\u00A0'}
                  </div>
                </div>

                {/* Main numeric input / result readout */}
                <div className="mt-2 text-right overflow-x-auto no-scrollbar">
                  <div
                    data-testid="calculator-display"
                    className={`font-mono-tabular font-semibold tracking-tight leading-none transition-all duration-100 select-all ${getDisplayFontSizeClass(
                      formattedDisplay
                    )}`}
                  >
                    {formattedDisplay}
                  </div>
                </div>
              </div>
            </div>

            {/* 4x5 Sculpted Physical Keypad Matrix */}
            <div className="grid grid-cols-4 gap-3 sm:gap-3.5" role="group" aria-label="Calculator Keypad">
              {CALCULATOR_KEYS.map((keyItem) => {
                const isPressed = activeKey === keyItem.actionId;
                const isSelectedOperator =
                  keyItem.variant === 'operator' && operator === keyItem.actionId && shouldResetScreen;

                // Resolve authentic Braun tactile color palette by key role
                let colorClasses = 'bg-[#2A2D32] hover:bg-[#32363C] text-[#F3F4F6]';
                if (keyItem.variant === 'clear') {
                  colorClasses = 'bg-[#E05A2B] hover:bg-[#EA6536] text-white';
                } else if (keyItem.variant === 'delete') {
                  colorClasses = 'bg-[#3D434D] hover:bg-[#474E59] text-[#F3F4F6]';
                } else if (keyItem.variant === 'operator') {
                  colorClasses = isSelectedOperator
                    ? 'bg-[#F3F4F6] text-[#1C1E21] ring-2 ring-[#D9822B]'
                    : 'bg-[#3D434D] hover:bg-[#474E59] text-[#F3F4F6]';
                } else if (keyItem.variant === 'equals') {
                  colorClasses = 'bg-[#D9822B] hover:bg-[#E48E36] text-white';
                }

                return (
                  <button
                    key={keyItem.actionId}
                    type="button"
                    aria-label={keyItem.ariaLabel}
                    onClick={() => handleKeyAction(keyItem.actionId)}
                    className={`tactile-key ${isPressed ? 'tactile-key-pressed' : ''} ${
                      keyItem.colSpan === 2 ? 'col-span-2' : 'col-span-1'
                    } ${colorClasses} h-14 sm:h-16 rounded-xl px-4 py-2 flex flex-col items-center justify-center cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9822B]`}
                  >
                    <span className="font-mono-tabular text-xl sm:text-2xl font-semibold leading-none whitespace-nowrap shrink-0">
                      {keyItem.label}
                    </span>
                    {keyItem.subLabel && (
                      <span className="text-[10px] font-mono-tabular opacity-65 mt-1 leading-none whitespace-nowrap shrink-0">
                        {keyItem.subLabel}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ----------------------------------------------------------------
              RIGHT COLUMN: Interactive Calculation Tape, Keyboard Guide & Code
             ---------------------------------------------------------------- */}
          <section
            aria-label="Calculation History and Reference"
            className="lg:col-span-7 bg-[#FAF9F5] border border-[#DFDDD6] rounded-[24px] p-6 sm:p-8 flex flex-col justify-between"
          >
            {/* Top Segmented Utility Bar */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#E6E4DD]">
                <div>
                  <h1 className="text-xl font-bold text-[#1C1E21] tracking-tight">
                    {activeRightTab === 'tape' && 'Calculation History Tape'}
                    {activeRightTab === 'shortcuts' && 'Keyboard Shortcuts & Edge-Case Guards'}
                    {activeRightTab === 'code' && 'Single-File HTML, CSS & JS Source'}
                  </h1>
                  <p className="text-xs text-[#646A73] mt-1">
                    {activeRightTab === 'tape' &&
                      'Click any completed entry below to load its result directly back into the calculator display.'}
                    {activeRightTab === 'shortcuts' &&
                      'Type numbers and operators directly on your keyboard with real-time tactile button feedback.'}
                    {activeRightTab === 'code' &&
                      'Clean, well-commented single-file code designed for beginners to read, copy, or run locally.'}
                  </p>
                </div>

                {/* Interactive Segmented Tab Control */}
                <div className="flex items-center gap-1 p-1 bg-[#ECEAE3] rounded-lg">
                  <button
                    type="button"
                    onClick={() => setActiveRightTab('tape')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activeRightTab === 'tape'
                        ? 'bg-white text-[#1C1E21] shadow-xs'
                        : 'text-[#525860] hover:text-[#1C1E21]'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Tape ({historyTape.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveRightTab('shortcuts')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activeRightTab === 'shortcuts'
                        ? 'bg-white text-[#1C1E21] shadow-xs'
                        : 'text-[#525860] hover:text-[#1C1E21]'
                    }`}
                  >
                    <Keyboard className="w-3.5 h-3.5" />
                    <span>Shortcuts</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveRightTab('code')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activeRightTab === 'code'
                        ? 'bg-white text-[#1C1E21] shadow-xs'
                        : 'text-[#525860] hover:text-[#1C1E21]'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>HTML Source</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: CALCULATION HISTORY TAPE */}
              {activeRightTab === 'tape' && (
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs text-[#646A73]">
                      <span>{historyTape.length} recorded calculations</span>
                      <span aria-hidden="true">·</span>
                      <span>Click row to reuse value</span>
                    </div>

                    {historyTape.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setHistoryTape([])}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-[#525860] hover:text-[#E05A2B] border border-[#DCD9D0] hover:border-[#E05A2B]/40 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Clear Tape</span>
                      </button>
                    )}
                  </div>

                  {historyTape.length === 0 ? (
                    <div className="py-16 px-6 text-center border border-dashed border-[#DCD9D0] rounded-xl bg-white/50">
                      <p className="text-sm font-medium text-[#1C1E21]">No calculations on the tape yet</p>
                      <p className="text-xs text-[#646A73] mt-1 max-w-sm mx-auto">
                        Enter an arithmetic expression using the keypad or your keyboard and press{' '}
                        <span className="font-mono-tabular font-semibold text-[#1C1E21]">=</span> to log results here.
                      </p>
                      <button
                        type="button"
                        onClick={() => setHistoryTape(INITIAL_HISTORY)}
                        className="mt-4 px-4 py-2 text-xs font-semibold text-[#1C1E21] bg-[#ECEAE3] hover:bg-[#E2DFD7] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Load Example Calculations
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                      {historyTape.map((entry) => {
                        const isRecalled = recalledId === entry.id;
                        return (
                          <button
                            key={entry.id}
                            type="button"
                            onClick={() => handleRecallFromTape(entry)}
                            className={`w-full text-left px-4 py-3 rounded-xl bg-white border transition-all flex items-center justify-between gap-4 cursor-pointer group ${
                              isRecalled
                                ? 'border-[#D9822B] bg-[#D9822B]/5'
                                : 'border-[#E6E4DD] hover:border-[#1C1E21]/40'
                            }`}
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2 text-xs text-[#646A73]">
                                <span>{entry.timestamp}</span>
                                <span aria-hidden="true">·</span>
                                <span className="group-hover:text-[#D9822B] transition-colors font-medium">
                                  {isRecalled ? 'Loaded into display' : 'Click to recall result'}
                                </span>
                              </div>
                              <div className="font-mono-tabular text-sm text-[#525860] mt-1">
                                {entry.expression} =
                              </div>
                            </div>

                            <div className="font-mono-tabular text-xl font-bold text-[#1C1E21] group-hover:text-[#D9822B] transition-colors text-right">
                              {formatDisplayNumber(entry.result)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: KEYBOARD SHORTCUTS & EDGE-CASE PROTECTION */}
              {activeRightTab === 'shortcuts' && (
                <div className="mt-5 space-y-6">
                  <div>
                    <h2 className="text-sm font-semibold text-[#1C1E21] mb-3">
                      01. Physical Keyboard Bindings
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center justify-between p-3 bg-white border border-[#E6E4DD] rounded-xl">
                        <span className="text-xs text-[#525860]">Digits & Decimal</span>
                        <kbd className="font-mono-tabular text-xs font-semibold px-2 py-1 bg-[#F4F3EF] border border-[#DCD9D0] rounded">
                          0 – 9 , .
                        </kbd>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white border border-[#E6E4DD] rounded-xl">
                        <span className="text-xs text-[#525860]">Arithmetic Operators</span>
                        <kbd className="font-mono-tabular text-xs font-semibold px-2 py-1 bg-[#F4F3EF] border border-[#DCD9D0] rounded">
                          + , - , * , /
                        </kbd>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white border border-[#E6E4DD] rounded-xl">
                        <span className="text-xs text-[#525860]">Evaluate Result</span>
                        <kbd className="font-mono-tabular text-xs font-semibold px-2 py-1 bg-[#F4F3EF] border border-[#DCD9D0] rounded">
                          Enter or =
                        </kbd>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white border border-[#E6E4DD] rounded-xl">
                        <span className="text-xs text-[#525860]">Delete Last Digit</span>
                        <kbd className="font-mono-tabular text-xs font-semibold px-2 py-1 bg-[#F4F3EF] border border-[#DCD9D0] rounded">
                          Backspace
                        </kbd>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white border border-[#E6E4DD] rounded-xl sm:col-span-2">
                        <span className="text-xs text-[#525860]">All Clear (Reset Calculator)</span>
                        <kbd className="font-mono-tabular text-xs font-semibold px-2 py-1 bg-[#F4F3EF] border border-[#DCD9D0] rounded">
                          Escape or C
                        </kbd>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-[#1C1E21] mb-3">
                      02. Built-In Edge Case Safeguards
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#525860]">
                      <div className="p-3.5 bg-white border border-[#E6E4DD] rounded-xl">
                        <div className="font-semibold text-[#1C1E21] mb-1">Division by Zero Protection</div>
                        <p>
                          Dividing any number by <span className="font-mono-tabular">0</span> safely displays{' '}
                          <span className="font-mono-tabular text-[#DC2626]">Cannot divide by zero</span> instead of{' '}
                          <span className="font-mono-tabular">Infinity</span> or <span className="font-mono-tabular">NaN</span>.
                        </p>
                      </div>
                      <div className="p-3.5 bg-white border border-[#E6E4DD] rounded-xl">
                        <div className="font-semibold text-[#1C1E21] mb-1">Duplicate Decimal Lock</div>
                        <p>
                          Pressing <span className="font-mono-tabular">.</span> multiple times in a single number is
                          ignored so invalid inputs like <span className="font-mono-tabular">3.14.5</span> cannot occur.
                        </p>
                      </div>
                      <div className="p-3.5 bg-white border border-[#E6E4DD] rounded-xl">
                        <div className="font-semibold text-[#1C1E21] mb-1">IEEE-754 Precision Rounding</div>
                        <p>
                          Normalizes binary floating-point math so <span className="font-mono-tabular">0.1 + 0.2</span>{' '}
                          evaluates cleanly to <span className="font-mono-tabular">0.3</span>.
                        </p>
                      </div>
                      <div className="p-3.5 bg-white border border-[#E6E4DD] rounded-xl">
                        <div className="font-semibold text-[#1C1E21] mb-1">Chained & Swapped Operators</div>
                        <p>
                          Pressing an operator right after another swaps the active operator; pressing an operator after
                          a second operand automatically calculates the running total.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SINGLE-FILE HTML/CSS/JS VIEWER FOR BEGINNERS */}
              {activeRightTab === 'code' && (
                <div className="mt-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="text-xs text-[#646A73]">
                      Complete single-file <span className="font-mono-tabular font-semibold text-[#1C1E21]">index.html</span>{' '}
                      combining HTML structure, CSS layout, and commented JavaScript.
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyStandaloneCode}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1C1E21] bg-white border border-[#DCD9D0] hover:border-[#1C1E21] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Copied HTML' : 'Copy Code'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadStandaloneHtml}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#D9822B] hover:bg-[#C67322] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download .html</span>
                      </button>
                    </div>
                  </div>

                  <pre className="p-4 rounded-xl bg-[#16181A] text-[#E6F0EC] font-mono-tabular text-xs leading-relaxed overflow-x-auto max-h-[320px] overflow-y-auto border border-[#2E3238]">
                    <code>{STANDALONE_HTML_SOURCE}</code>
                  </pre>
                </div>
              )}
            </div>

            {/* Bottom Quick-Action Bar */}
            <div className="mt-6 pt-4 border-t border-[#E6E4DD] flex flex-wrap items-center justify-between gap-4 text-xs text-[#646A73]">
              <div className="flex items-center gap-2">
                <span>Active State:</span>
                <span className="font-mono-tabular font-semibold text-[#1C1E21]">
                  {errorMessage
                    ? 'Error Lock (Press C or any digit)'
                    : operator
                    ? `Waiting for 2nd operand (${formatOperatorGlyph(operator)})`
                    : 'Ready for input'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleKeyAction('delete')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#ECEAE3] hover:bg-[#E2DFD7] text-[#1C1E21] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Delete className="w-3.5 h-3.5" />
                  <span>Backspace</span>
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#E05A2B]/10 hover:bg-[#E05A2B]/20 text-[#E05A2B] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Clear (C)</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
