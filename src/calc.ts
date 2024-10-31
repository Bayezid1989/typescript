type Operator = "*" | "/" | "+" | "-" | "(" | ")";
type OperandType = "amount" | "coeff";

const countAmounts = (formula: (Operator | OperandType)[]) =>
  formula.filter((element) => element === "amount").length;

const isOperator = (element: Operator | OperandType) =>
  element === "*" ||
  element === "/" ||
  element === "+" ||
  element === "-" ||
  element === "(" ||
  element === ")";

const simpleCalc = (
  formula: (Operator | OperandType)[],
  amounts: number[],
  coeffs: number[]
) => {
  if (formula.length === 0) return 0;
  let result = 1;
  let operator: Operator = "*";
  let formulaStr = "";

  formula.forEach((element) => {
    if (isOperator(element)) {
      operator = element;
      formulaStr += `${element} `;
    } else {
      const num = element === "amount" ? amounts.shift() : coeffs.shift();
      if (typeof num !== "number") throw new Error("Operand missing");

      if (operator === "*") result *= num;
      else result /= num;

      formulaStr += `${num} `;
    }
  });

  console.log(`Formula: ${formulaStr}= ${result}`);
  return result;
};

// simpleCalc(["amount"], [100], []); // Formula: 100 = 100
// simpleCalc(["amount", "*", "coeff"], [100], [2]); // Formula: 100 * 2 = 200
// simpleCalc(["amount", "/", "amount", "*", "coeff"], [1000, 5], [3]); // Formula: 1000 / 5 * 3 = 600
// simpleCalc(
//   ["amount", "/", "coeff", "*", "amount", "*", "coeff", "*", "coeff"],
//   [100, 5],
//   [2, 3, 10]
// ); // Formula: 100 / 2 * 5 * 3 * 10 = 7500

function calculate(
  formula: (Operator | OperandType)[],
  amounts: number[],
  coeffs: number[]
): number {
  let result = 0;
  let num = 0;
  let sign = 1;

  let stack: number[] = []; // Store sign of parenthesis

  for (let element of formula) {
    if (isOperator(element)) {
      result += num * sign * (stack[stack.length - 1] || 1);
      num = 0;

      switch (element) {
        case "-":
          sign = -1;
          break;
        case "+":
          sign = 1;
          break;
        case "(":
          stack.push((stack[stack.length - 1] || 1) * sign);
          sign = 1;
          break;
        case ")":
          stack.pop();
          break;
      }
    } else {
      const num = element === "amount" ? amounts.shift() : coeffs.shift();
      if (typeof num !== "number") throw new Error("Operand missing");

      result += num * sign * (stack[stack.length - 1] || 1);
    }
  }

  result += sign * num;
  return result;
}

console.log(
  calculate(
    ["amount", "/", "coeff", "*", "amount", "*", "coeff", "*", "coeff"],
    [100, 5],
    [2, 3, 10]
  )
); // 7500
