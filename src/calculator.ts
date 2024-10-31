namespace Calculator {
  type Operator = "*" | "/" | "+" | "-";
  type Bracket = "(" | ")";
  type Operand = "amount" | "coeff";
  type Formula = (Operand | Operator | Bracket)[];
  type HydratedFormula = (number | Operator | Bracket)[];
  type FlatFormula = (number | Operator)[];

  const isOperator = (element: HydratedFormula[number]) =>
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
  ) =>
    formula.map((element) => {
      if (element === "amount") return extractNumber(amounts);
      if (element === "coeff") return extractNumber(coeffs);
      return element;
    });

  const combine2Numbers = (num1: number, operator: Operator, num2: number) => {
    if (operator === "*") return num1 * num2;
    if (operator === "/") return num1 / num2;
    if (operator === "+") return num1 + num2;
    if (operator === "-") return num1 - num2;
    throw new Error("Invalid operator");
  };

  const operate = (formula: FlatFormula, operators: [Operator, Operator]) => {
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

        const result = combine2Numbers(num1, operator, num2);
        newFormula.splice(index - 1, 3, result);
      } else {
        index++;
      }
    }
    return newFormula;
  };

  const calculate = (formula: FlatFormula) =>
    operate(operate(formula, ["*", "/"]), ["+", "-"]);

  const clearBrackets = (formula: HydratedFormula) => {
    const stack: HydratedFormula = [];
    let index = 0;

    while (index < formula.length) {
      if (formula[index] === ")") {
        let flatFormula: FlatFormula = [];
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
        stack.push(formula[index]);
      }
      index++;
    }

    return stack as FlatFormula;
  };

  const solve = (formula: Formula, amounts: number[], coeffs: number[]) => {
    console.log("Original", formula.join(" "));

    const hydratedFormula = replaceOperands(formula, amounts, coeffs);
    console.log("Hydrated", hydratedFormula.join(" "));

    const flatFormula = clearBrackets(hydratedFormula);
    console.log("Flat", flatFormula.join(" "));

    const result = calculate(flatFormula)[0];
    console.log("Result", result);

    return result;
  };

  // TESTS
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
