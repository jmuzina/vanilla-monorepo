/**
 * @module adapter
 * This module provides functionality that allows Yeoman generators to
 * interact with the user through th CLI and interactive prompting modes,
 * using a common adapter interface.
 */

import type { PromptAnswers } from "@yeoman/types";
import type Generator from "yeoman-generator";
import type { BaseOptions, PromptQuestion } from "yeoman-generator";
import {
  type AdaptedQuestionOptions,
  type AdaptedQuestionSet,
  type CLIArgType,
  CLIInputStrategy,
  type CLIOptType,
} from "./types.js";

/**
 * Sets up CLI arguments and returns their answers
 * @param generator The generator instance
 * @param questions The questions to ask the user
 * @returns The answers to the questions
 */
export function getCliAnswers<TAnswers extends PromptAnswers>(
  generator: Generator,
  questions: AdaptedQuestionSet<TAnswers>,
): TAnswers {
  const questionsToAnswers: Record<
    string,
    { question: AdaptedQuestionOptions<TAnswers>; value: unknown }
  > = {};

  const answers = Object.fromEntries(
    questions.map((question) => {
      // Call the appropriate method based on the input strategy
      switch (question.inputStrategy.cli) {
        case CLIInputStrategy.OPTION:
          generator.option(question.name, {
            ...question,
            type: question.types.cli as CLIOptType,
            description: question.descriptions.cli,
            // If the question has a boolean type, default to false.
            // Otherwise, we would have to create separate "skip" questions for each boolean question.
            default: question.types.cli === Boolean ? false : question.default,
          });
          break;
        case CLIInputStrategy.ARGUMENT:
          generator.argument(question.name, {
            ...question,
            type: question.types.cli as CLIArgType,
            description: question.descriptions.cli,
          });
          break;
      }
      // Store the question and its answered value
      questionsToAnswers[question.name] = {
        question,
        value: generator.options[question.name as keyof BaseOptions],
      };
      return [question.name, questionsToAnswers[question.name].value];
    }),
  ) as Partial<TAnswers>;

  // Apply any filter transformations to the answer
  for (const arg in answers) {
    const { question, value } = questionsToAnswers[arg];
    answers[arg] = question.filter
      ? question.filter(value, answers as TAnswers)
      : value;
  }

  return answers as TAnswers;
}

/**
 * Sets up interactive options and returns whether the generator is in interactive mode
 * @param generator The generator instance
 * @returns Whether the generator is in interactive mode
 */
export function isInInteractiveMode(
  generator: Generator<BaseOptions & { interactive?: boolean }>,
): boolean {
  generator.option("interactive", {
    description: "Run the generator in interactive mode",
    default: false,
    type: Boolean,
    required: false,
  });
  return !!generator.options.interactive;
}

/**
 * Gets the answers to the questions presented in interactive mode
 * @param generator The generator instance
 * @param questions The questions to ask the user
 * @returns The answers to the questions
 */
export async function getInteractiveAnswers<TAnswers extends PromptAnswers>(
  generator: Generator,
  questions: AdaptedQuestionSet<TAnswers>,
): Promise<TAnswers> {
  return generator.prompt<TAnswers>(
    questions.map(
      (question) =>
        ({
          message: question.descriptions.interactive,
          type: question.types.interactive,
          ...question,
        }) as PromptQuestion<TAnswers>,
    ),
  );
}
