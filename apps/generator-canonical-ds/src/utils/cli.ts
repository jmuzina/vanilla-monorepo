import type Generator from "yeoman-generator";
import type { Answers, Question } from "yeoman-generator";

export enum CLIType {
  Argument = 0,
  Option = 1,
}

export type PromptType =
  | "number"
  | "input"
  | "password"
  | "list"
  | "expand"
  | "checkbox"
  | "confirm"
  | "editor"
  | "rawlist";

type BaseQuestionPrompt = Omit<Question, "type"> & {
  name: string;
  // type: never;
  cliType: CLIType;
  promptValueType: PromptType;
};

export type ArgQuestionPrompt = BaseQuestionPrompt & {
  cliType: CLIType.Argument;
  cliValueType:
    | StringConstructor
    | NumberConstructor
    | ArrayConstructor
    | ObjectConstructor;
};

export type OptionQuestionPrompt = BaseQuestionPrompt & {
  cliType: CLIType.Option;
  cliValueType: BooleanConstructor | StringConstructor | NumberConstructor;
};

export type QuestionPrompt = ArgQuestionPrompt | OptionQuestionPrompt;

function processCLIInput<T extends Answers>(
  generator: Generator,
  questions: QuestionPrompt[],
): T {
  console.log("Processing CLI input...", questions);
  for (const question of questions) {
    const promptArgs = {
      description: question.message?.toString(),
      default: question.default,
      type: question.cliValueType,
    };

    if (question.cliType === CLIType.Argument) {
      console.log("arg", question);
      generator.argument(question.name, {
        ...promptArgs,
        type: question.cliValueType,
        required: true,
      });
    } else {
      console.log("opt", question);
      generator.option(question.name, {
        ...promptArgs,
        type: question.cliValueType,
        hide: false,
      });
    }
  }

  console.log({
    ...generator.options,
    ...generator.args,
  });

  return {
    ...generator.options,
    ...generator.args,
  } as unknown as T;
}

export default function processInput<T extends Answers>(
  generator: Generator,
  questions: QuestionPrompt[],
  interactive?: boolean,
): T | Promise<T> {
  return interactive
    ? generator.prompt<T>(questions)
    : processCLIInput(generator, questions);
}
