import type { PromptAnswers } from "@yeoman/types";
import type { PromptQuestion } from "yeoman-generator";

/** Manner in which the CLI collects input */
export enum CLIInputStrategy {
  // Named argument, i.e. yo generator:command --name value
  OPTION = "option",
  // Positional argument, i.e. yo generator:command value
  ARGUMENT = "argument",
}

/** Manner in which the interactive mode collects input */
export enum InteractiveInputStrategy {
  // Freeform text input
  INPUT = "input",
  // Yes/No confirmation
  CONFIRM = "confirm",
  // Multiple choice list
  LIST = "list",
}

/** Strategy for collecting input */
export type InputStrategy = CLIInputStrategy | InteractiveInputStrategy;

/** Input strategy configurations for each input mode */
export type InputStrategyOptions = {
  cli: CLIInputStrategy;
  interactive: InteractiveInputStrategy;
};

/** Options for required input strategies */
export type InputStrategyOptionsRequired = InputStrategyOptions & {
  cli: CLIInputStrategy.ARGUMENT;
  interactive: InteractiveInputStrategy.INPUT;
};

/** Options for optional input strategies */
export type InputStrategyOptionsOptional = InputStrategyOptions & {
  cli: CLIInputStrategy.OPTION;
};

/** Valid types for positional argument questions answered on the CLI */
export type CLIArgType = StringConstructor | NumberConstructor;
/** Valid types for named option questions answered on the CLI */
export type CLIOptType = CLIArgType | BooleanConstructor;
/** Valid types for questions answered via CLI */
export type CLIInputType = CLIArgType | CLIOptType;

/** Valid value types for interactive questions */
type BaseInteractiveValueType = string | number;
/** Valid value types for optional interactive questions */
export type InteractiveValueTypeOptional = BaseInteractiveValueType | boolean;
/** Valid value types for required interactive questions */
export type InteractiveValueTypeRequired = BaseInteractiveValueType;
/** Valid value types for interactive questions */
export type InteractiveValueType =
  | InteractiveValueTypeRequired
  | InteractiveValueTypeOptional;

/** Types of input options for questions */
export type InputTypeOptions = {
  cli: CLIInputType;
  interactive: InteractiveValueType;
};

/** Required input types for questions */
export type InputTypeOptionsRequired = InputTypeOptions & {
  cli: CLIArgType;
  interactive: InteractiveValueTypeRequired;
};

/** Optional input types for questions */
export type InputTypeOptionsOptional = InputTypeOptions & {
  cli: CLIOptType;
  interactive: InteractiveValueTypeOptional;
};

/** Descriptions for generator questions in various input modes */
export type InputDescriptionOptions = {
  cli: string;
  interactive: string;
};

/** Base options for generator questions that are compatible with both CLI and interactive modes */
type BaseAdaptedQuestionOptions<TAnswers extends PromptAnswers> = Omit<
  Omit<Omit<PromptQuestion<TAnswers>, "type">, "description">,
  "message"
> & {
  /** Whether the question must be answered */
  required?: boolean;
  /** The types of input allowed for the question */
  types: InputTypeOptions;
  /** Descriptions for the question in various input modes */
  descriptions: InputDescriptionOptions;
  /** The strategy for collecting input */
  inputStrategy: InputDescriptionOptions;
};

/** Options for required questions */
export type AdaptedQuestionOptionsOptional<TAnswers extends PromptAnswers> =
  BaseAdaptedQuestionOptions<TAnswers> & {
    required?: false;
    types: InputTypeOptionsOptional;
    inputStrategy: InputStrategyOptionsOptional;
  };

/** Options for optional questions */
export type AdapterQuestionOptionsRequired<TAnswers extends PromptAnswers> =
  BaseAdaptedQuestionOptions<TAnswers> & {
    required: true;
    types: InputTypeOptionsRequired;
    inputStrategy: InputStrategyOptionsRequired;
  };

export type AdaptedQuestionOptions<TAnswers extends PromptAnswers> =
  | AdaptedQuestionOptionsOptional<TAnswers>
  | AdapterQuestionOptionsRequired<TAnswers>;

export type AdaptedQuestionSet<T extends PromptAnswers> = Array<
  AdaptedQuestionOptions<T>
>;
