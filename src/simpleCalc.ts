namespace SimpleCalc {
  type Operator = "*" | "/";
  type OperandType = "amount" | "coeff";

  const isOperator = (element: Operator | OperandType) =>
    element === "*" || element === "/";

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

  simpleCalc(["amount"], [100], []); // Formula: 100 = 100
  simpleCalc(["amount", "*", "coeff"], [100], [2]); // Formula: 100 * 2 = 200
  simpleCalc(["amount", "/", "amount", "*", "coeff"], [1000, 5], [3]); // Formula: 1000 / 5 * 3 = 600
  simpleCalc(
    ["amount", "/", "coeff", "*", "amount", "*", "coeff", "*", "coeff"],
    [100, 5],
    [2, 3, 10]
  ); // Formula: 100 / 2 * 5 * 3 * 10 = 7500
}
