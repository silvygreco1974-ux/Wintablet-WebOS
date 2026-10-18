import React, { useState } from 'react';
import { Delete, History, RotateCcw } from 'lucide-react';
import { sound } from '../../utils/audio';

export const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [resetNext, setResetNext] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const handleDigit = (digit: string) => {
    sound.playClick();
    if (display === '0' || resetNext) {
      setDisplay(digit);
      setResetNext(false);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleDecimal = () => {
    sound.playClick();
    if (resetNext) {
      setDisplay('0.');
      setResetNext(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleClear = () => {
    sound.playClick();
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setResetNext(false);
  };

  const handleBackspace = () => {
    sound.playClick();
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleOperator = (op: string) => {
    sound.playClick();
    const curr = parseFloat(display);
    if (prevValue !== null && operator) {
      const res = calculate(prevValue, curr, operator);
      setDisplay(String(res));
      setPrevValue(res);
    } else {
      setPrevValue(curr);
    }
    setOperator(op);
    setResetNext(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        return b !== 0 ? a / b : 0;
      default:
        return b;
    }
  };

  const handleEqual = () => {
    sound.playNotification();
    if (prevValue === null || !operator) return;
    const curr = parseFloat(display);
    const res = calculate(prevValue, curr, operator);
    const histItem = `${prevValue} ${operator} ${curr} = ${res}`;
    setHistory([histItem, ...history.slice(0, 9)]);
    setDisplay(String(res));
    setPrevValue(null);
    setOperator(null);
    setResetNext(true);
  };

  const handlePercent = () => {
    sound.playClick();
    const curr = parseFloat(display);
    setDisplay(String(curr / 100));
  };

  const handleNegate = () => {
    sound.playClick();
    const curr = parseFloat(display);
    setDisplay(String(-curr));
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none p-3 max-w-sm mx-auto justify-between">
      {/* Display */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-right mb-3">
        <div className="text-xs text-slate-400 font-mono h-4">
          {prevValue !== null && operator ? `${prevValue} ${operator}` : ''}
        </div>
        <div className="text-3xl font-bold font-mono tracking-wider text-white truncate mt-1">
          {display}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-2 flex-1">
        <button
          onClick={handleClear}
          className="h-12 bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold rounded-xl text-sm transition-colors"
        >
          C
        </button>
        <button
          onClick={handleBackspace}
          className="h-12 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-colors flex items-center justify-center"
        >
          <Delete className="w-4 h-4" />
        </button>
        <button
          onClick={handlePercent}
          className="h-12 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-colors"
        >
          %
        </button>
        <button
          onClick={() => handleOperator('÷')}
          className="h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-base transition-colors"
        >
          ÷
        </button>

        <button
          onClick={() => handleDigit('7')}
          className="h-12 bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold rounded-xl text-base transition-colors"
        >
          7
        </button>
        <button
          onClick={() => handleDigit('8')}
          className="h-12 bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold rounded-xl text-base transition-colors"
        >
          8
        </button>
        <button
          onClick={() => handleDigit('9')}
          className="h-12 bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold rounded-xl text-base transition-colors"
        >
          9
        </button>
        <button
          onClick={() => handleOperator('×')}
          className="h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-base transition-colors"
        >
          ×
        </button>

        <button
          onClick={() => handleDigit('4')}
          className="h-12 bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold rounded-xl text-base transition-colors"
        >
          4
        </button>
        <button
          onClick={() => handleDigit('5')}
          className="h-12 bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold rounded-xl text-base transition-colors"
        >
          5
        </button>
        <button
          onClick={() => handleDigit('6')}
          className="h-12 bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold rounded-xl text-base transition-colors"
        >
          6
        </button>
        <button
          onClick={() => handleOperator('-')}
          className="h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-base transition-colors"
        >
          -
        </button>

        <button
          onClick={() => handleDigit('1')}
          className="h-12 bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold rounded-xl text-base transition-colors"
        >
          1
        </button>
        <button
          onClick={() => handleDigit('2')}
          className="h-12 bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold rounded-xl text-base transition-colors"
        >
          2
        </button>
        <button
          onClick={() => handleDigit('3')}
          className="h-12 bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold rounded-xl text-base transition-colors"
        >
          3
        </button>
        <button
          onClick={() => handleOperator('+')}
          className="h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-base transition-colors"
        >
          +
        </button>

        <button
          onClick={handleNegate}
          className="h-12 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-sm transition-colors"
        >
          ±
        </button>
        <button
          onClick={() => handleDigit('0')}
          className="h-12 bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold rounded-xl text-base transition-colors"
        >
          0
        </button>
        <button
          onClick={handleDecimal}
          className="h-12 bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold rounded-xl text-base transition-colors"
        >
          .
        </button>
        <button
          onClick={handleEqual}
          className="h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-lg shadow-md transition-colors"
        >
          =
        </button>
      </div>

      {/* Recent history */}
      {history.length > 0 && (
        <div className="mt-3 p-2 bg-slate-900/60 border border-slate-800 rounded-lg text-[10px] text-slate-400 font-mono truncate">
          <span className="text-slate-500 mr-2">Cronologia:</span> {history[0]}
        </div>
      )}
    </div>
  );
};
