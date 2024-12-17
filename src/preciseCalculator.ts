import Decimal from "decimal.js";
import { z } from "zod";

const operatorSchema = z.union([
  z.literal("*"),
  z.literal("/"),
  z.literal("+"),
  z.literal("-"),
]);
const bracketSchema = z.union([z.literal("("), z.literal(")")]);

export type Operator = z.infer<typeof operatorSchema>;
export type Bracket = z.infer<typeof bracketSchema>;
export type NumberFormula = (Decimal | Operator | Bracket)[];
export type FlatNumberFormula = (Decimal | Operator)[];

export class Calculator {
  constructor() {
    Decimal.set({ precision: 40 });
  }
  private extractNumber(numbers: Decimal[]): Decimal {
    const num = numbers.shift();
    if (num instanceof Decimal) return num;
    throw new Error("Operand missing");
  }

  replaceOperands(
    formula: string[],
    amounts: Decimal[],
    coefficients: Decimal[]
  ): NumberFormula {
    const copiedAmounts = [...amounts];
    const copiedCoefficients = [...coefficients];
    const operatorAndBracketSchema = z.union([operatorSchema, bracketSchema]);

    return formula.map((element) => {
      if (element === "amount") {
        return this.extractNumber(copiedAmounts);
      }
      if (element === "coefficient") {
        return this.extractNumber(copiedCoefficients);
      }
      return operatorAndBracketSchema.parse(element);
    });
  }

  operate(num1: Decimal, operator: Operator, num2: Decimal): Decimal {
    if (operator === "*") return num1.times(num2);
    if (operator === "/") {
      if (num2.eq(0)) {
        throw new Error("Division by zero");
      }
      return num1.div(num2);
    }
    if (operator === "+") return num1.plus(num2);
    if (operator === "-") return num1.minus(num2);
    throw new Error("Invalid operator");
  }

  calculateHalf(
    formula: FlatNumberFormula,
    operators: [Operator, Operator]
  ): FlatNumberFormula {
    const newFormula = [...formula];
    let index = 0;

    while (index < newFormula.length) {
      const element = newFormula[index];
      if (element === undefined) {
        throw new Error("Invalid formula");
      }
      if (element === operators[0] || element === operators[1]) {
        const num1 = newFormula[index - 1];
        const num2 = newFormula[index + 1];
        if (!(num1 instanceof Decimal) || !(num2 instanceof Decimal)) {
          throw new Error("Invalid formula");
        }

        const result = this.operate(num1, element, num2);
        newFormula.splice(index - 1, 3, result);
      } else {
        if (
          !(element instanceof Decimal) &&
          !operatorSchema.safeParse(element).success
        ) {
          throw new Error("Invalid formula");
        }
        index++;
      }
    }
    return newFormula;
  }

  calculate(formula: FlatNumberFormula): FlatNumberFormula {
    const multipliedAndDivided = this.calculateHalf(formula, ["*", "/"]);
    return this.calculateHalf(multipliedAndDivided, ["+", "-"]);
  }

  clearBrackets(formula: NumberFormula): FlatNumberFormula {
    const stack: NumberFormula = [];
    let bracketCount = 0;

    for (let i = 0; i < formula.length; i++) {
      const token = formula[i];
      if (token === undefined) {
        throw new Error("Invalid token");
      }

      if (token === ")") {
        bracketCount--;

        const flatFormula: FlatNumberFormula = [];
        let element = stack.pop();

        while (element !== "(") {
          if (element === undefined || element === ")") {
            throw new Error("Invalid brackets");
          }
          flatFormula.unshift(element);
          element = stack.pop();
        }
        stack.push(...this.calculate(flatFormula));
      } else {
        if (token === "(") bracketCount++;
        stack.push(token);
      }
    }
    if (bracketCount !== 0) {
      throw new Error("Invalid bracket count");
    }

    return stack as FlatNumberFormula;
  }

  solve(
    formula: string[],
    amounts: Decimal[],
    coefficients: Decimal[]
  ): Decimal {
    const hydratedFormula = this.replaceOperands(
      formula,
      amounts,
      coefficients
    );
    const flatFormula = this.clearBrackets(hydratedFormula);
    const result = this.calculate(flatFormula)[0];

    if (!(result instanceof Decimal)) {
      throw new Error("Invalid result");
    }
    return result;
  }
}
