namespace Calculator {
  type Operator = "*" | "/" | "+" | "-";
  type Bracket = "(" | ")";
  type Operand = "amount" | "coeff";
  type Formula = (Operand | Operator | Bracket)[];
  type NumberFormula = (number | Operator | Bracket)[];
  type FlatNumberFormula = (number | Operator)[];

  const isOperator = (element: NumberFormula[number]) =>
    element === "*" || element === "/" || element === "+" || element === "-";

  const extractNumber = (numbers: number[]) => {
    const num = numbers.shift();
    if (typeof num !== "number") throw new Error("Operand missing");
    return num;
  };

  const replaceOperands = (
    formula: Formula,
    amounts: number[],
    coeffs: number[]
  ): NumberFormula =>
    formula.map((element) => {
      if (element === "amount") return extractNumber(amounts);
      if (element === "coeff") return extractNumber(coeffs);
      return element;
    });

  const operate = (num1: number, operator: Operator, num2: number) => {
    if (operator === "*") return num1 * num2;
    if (operator === "/") return num1 / num2;
    if (operator === "+") return num1 + num2;
    if (operator === "-") return num1 - num2;
    throw new Error("Invalid operator");
  };

  const calculateHalf = (
    formula: FlatNumberFormula,
    operators: [Operator, Operator]
  ) => {
    const newFormula = [...formula];
    let index = 0;

    while (index < newFormula.length) {
      if (
        newFormula[index] === operators[0] ||
        newFormula[index] === operators[1]
      ) {
        const num1 = newFormula[index - 1];
        const num2 = newFormula[index + 1];
        if (typeof num1 !== "number" || typeof num2 !== "number") {
          throw new Error("Invalid formula");
        }
        const operator = newFormula[index];
        if (!isOperator(operator)) {
          throw new Error("Invalid formula");
        }

        const result = operate(num1, operator, num2);
        newFormula.splice(index - 1, 3, result);
      } else {
        index++;
      }
    }
    return newFormula;
  };

  const calculate = (formula: FlatNumberFormula) =>
    calculateHalf(calculateHalf(formula, ["*", "/"]), ["+", "-"]);

  const verifyFlatFormula = (formula: NumberFormula) => {
    const flatFormula: FlatNumberFormula = [];
    formula.forEach((element) => {
      if (element === "(" || element === ")") {
        throw new Error("Invalid brackets");
      }
      flatFormula.push(element);
    });

    return flatFormula;
  };

  const clearBrackets = (formula: NumberFormula) => {
    const stack: NumberFormula = [];

    for (let i = 0; i < formula.length; i++) {
      if (formula[i] === ")") {
        let flatFormula: FlatNumberFormula = [];
        let element = stack.pop();

        while (element !== "(") {
          if (element === undefined || element === ")") {
            throw new Error("Invalid brackets");
          }
          flatFormula.unshift(element);
          element = stack.pop();
        }
        stack.push(...calculate(flatFormula));
      } else {
        stack.push(formula[i]);
      }
    }

    return verifyFlatFormula(stack);
  };

  const solve = (formula: Formula, amounts: number[], coeffs: number[]) => {
    console.log("Original", formula.join(" "));

    const hydratedFormula = replaceOperands(formula, amounts, coeffs);
    console.log("Number", hydratedFormula.join(" "));

    const flatFormula = clearBrackets(hydratedFormula);
    console.log("Flat", flatFormula.join(" "));

    const result = calculate(flatFormula)[0];
    console.log("Result", result);

    return result;
  };

  // TESTS
  solve(["amount"], [100], []); // Formula: 100 = 100
  solve(["amount", "*", "coeff"], [100], [2]); // 200
  solve(["amount", "/", "amount", "*", "coeff"], [1000, 5], [3]); // 600
  solve(
    ["amount", "/", "coeff", "*", "amount", "*", "coeff", "*", "coeff"],
    [100, 5],
    [2, 3, 10]
  ); // 7500
  solve(
    [
      "amount",
      "/",
      "(",
      "coeff",
      "*",
      "amount",
      ")",
      "*",
      "coeff",
      "*",
      "coeff",
    ],
    [100, 5],
    [2, 3, 10]
  ); // 300
  solve(
    [
      "amount",
      "/",
      "(",
      "coeff",
      "*",
      "(",
      "amount",
      "/",
      "coeff",
      ")",
      "-",
      "coeff",
      ")",
      "*",
      "coeff",
    ],
    [100, 6],
    [10, 3, 10, 2]
  ); // 20
}
