import path from "node:path";
import Generator from "yeoman-generator";
import globalContext from "../app/global-context.js";
import casing from "../utils/casing.js";
import processInput, { CLIType, type QuestionPrompt } from "../utils/cli.js";

interface ComponentGeneratorArgs {
  /** The path to the component's root directory */
  componentAbsolutePath: string;
  /** Whether to include styles in the component */
  includeStyles: boolean;
  /** Whether to include a storybook story in the component */
  includeStorybook: boolean;
}

export default class ComponentGenerator extends Generator {
  questions: QuestionPrompt[] = [
    {
      name: "componentAbsolutePath",
      cliType: CLIType.Argument,
      cliValueType: String,
      promptValueType: "input",
      message:
        "Enter the component's name, including its path (ex: `form/input/Checkbox`):",
      default: ".",
      filter: (input: string) => {
        const resolvedInput = path.resolve(this.env.cwd, input);
        // Force the directory name (the component name) to be PascalCased
        const dirName = path.basename(resolvedInput);
        return path.resolve(resolvedInput, "..", casing.toPascalCase(dirName));
      },
    },
    {
      name: "includeStyles",
      cliType: CLIType.Option,
      cliValueType: Boolean,
      promptValueType: "confirm",
      message: "Do you want to include styles?",
      default: true,
    },
    {
      name: "includeStorybook",
      cliType: CLIType.Option,
      cliValueType: Boolean,
      promptValueType: "confirm",
      message: "Would you like to include a story file?",
      default: true,
    },
  ];
  answers?: ComponentGeneratorArgs;

  initializing() {
    this.log("Welcome to the component generator!");
    this.log(
      "This generator should be run from the root directory of all your application's components (ex: src/components).",
    );
  }

  async input() {
    this.answers = await processInput<ComponentGeneratorArgs>(
      this,
      this.questions,
    );
  }

  /**
   * Gets the path to the component's directory relative to the current working directory.
   * Pascal-cases the final directory name to match React component naming conventions.
   * @param inPath - The path to resolve, relative to the current working directory
   * @return Path to the component's directory relative to the current working directory
   * @example
   * destinationPath("path/to/button/index.ts") // => "/path/to/Button/index.ts"
   */
  destinationPath(...inPath: string[]): string {
    const rawPath = super.destinationPath(...inPath);
    const dirName = path.dirname(rawPath);

    // Replace the last segment of the path with the Pascal-cased version
    const componentFolder = path.resolve(
      dirName,
      "..",
      casing.toPascalCase(path.basename(dirName)),
    );

    // Append the original file name to the new path
    const fileName = path.basename(rawPath);

    return path.join(componentFolder, fileName);
  }

  writing(): void {
    if (!this.answers) return;

    const componentName = path.basename(this.answers.componentAbsolutePath);

    const templateData = {
      ...globalContext,
      ...this.answers,
      componentName,
      /** The path to the component's directory relative to the current working directory */
      componentRelativePath: path.relative(
        this.env.cwd,
        this.answers.componentAbsolutePath,
      ),
      componentCssClassName:
        this.answers.includeStyles && casing.toKebabCase(componentName),
    };

    this.fs.copyTpl(
      this.templatePath("Component.tsx.ejs"),
      this.destinationPath(
        `${this.answers.componentAbsolutePath}/${templateData.componentName}.tsx`,
      ),
      templateData,
    );

    this.fs.copyTpl(
      this.templatePath("index.ts.ejs"),
      this.destinationPath(`${this.answers.componentAbsolutePath}/index.ts`),
      templateData,
    );

    this.fs.copyTpl(
      this.templatePath("types.ts.ejs"),
      this.destinationPath(`${this.answers.componentAbsolutePath}/types.ts`),
      templateData,
    );

    this.fs.copyTpl(
      this.templatePath("Component.test.tsx.ejs"),
      this.destinationPath(
        `${this.answers.componentAbsolutePath}/${templateData.componentName}.test.tsx`,
      ),
      templateData,
    );

    if (this.answers.includeStyles) {
      this.fs.copyTpl(
        this.templatePath("Component.css.ejs"),
        this.destinationPath(
          `${this.answers.componentAbsolutePath}/${templateData.componentName}.css`,
        ),
        templateData,
      );
    }

    if (this.answers.includeStorybook) {
      this.fs.copyTpl(
        this.templatePath("Component.stories.tsx.ejs"),
        this.destinationPath(
          `${this.answers.componentAbsolutePath}/${templateData.componentName}.stories.tsx`,
        ),
        templateData,
      );
    }
  }
}
