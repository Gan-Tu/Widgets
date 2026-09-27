export type CodeLanguage = "widget" | "json";
export type CodeToken = {
  kind: "plain" | "tag" | "attribute" | "binding" | "string" | "number" | "keyword" | "property" | "function" | "comment" | "operator" | "punctuation";
  text: string;
};

type Context =
  | { mode: "expression"; end?: string; operand: boolean; ternaries: number }
  | { mode: "text" }
  | { mode: "tag"; closing: boolean; name: boolean; binding: boolean }
  | { mode: "template" };

const identifier = /[A-Za-z_$][\w$]*/y;
const tagName = /[A-Za-z_$][\w$.:-]*/y;
const attributeName = /\*?[A-Za-z_$][\w$:.-]*/y;
const number = /(?:0[xX][\da-fA-F]+|0[bB][01]+|0[oO][0-7]+|(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)/y;
const operator = /(?:===|!==|=>|==|!=|<=|>=|&&|\|\||\?\?|\?\.|\*\*|\.\.\.|[+\-*/%<>=!?:&|])/y;
const keywords = new Set(["true", "false", "null", "undefined", "return", "typeof", "void", "as", "const", "let"]);

/** A tolerant lexer: highlighting must survive unfinished edits and never evaluate code.
 * Contexts distinguish JSX text, props, JS expressions and DIL's quoted expressions.
 * Any component name is supported, including future registry entries and dotted names.
 */
export function highlightCode(source: string, language: CodeLanguage): CodeToken[] {
  const tokens: CodeToken[] = [];
  const stack: Context[] = [{ mode: "expression", operand: true, ternaries: 0 }];
  let position = 0;

  function emit(kind: CodeToken["kind"], end: number) {
    const text = source.slice(position, end);
    tokens.push({ kind, text });
    position = end;
  }

  function match(pattern: RegExp) {
    pattern.lastIndex = position;
    return pattern.exec(source)?.[0];
  }

  function quotedEnd(start: number) {
    const quote = source[start];
    let end = start + 1;
    while (end < source.length) {
      if (source[end] === "\\") end += 2;
      else if (source[end++] === quote) break;
    }
    return Math.min(end, source.length);
  }

  function beginTag(closing: boolean) {
    if (!closing) stack.push({ mode: "text" });
    stack.push({ mode: "tag", closing, name: true, binding: false });
    emit("punctuation", position + (closing ? 2 : 1));
  }

  while (position < source.length) {
    const context = stack[stack.length - 1];
    const char = source[position];

    if (context.mode === "template") {
      if (source.startsWith("${", position)) {
        emit("punctuation", position + 2);
        stack.push({ mode: "expression", end: "}", operand: true, ternaries: 0 });
      } else if (char === "`") {
        emit("string", position + 1);
        stack.pop();
      } else {
        let end = position;
        while (end < source.length && source[end] !== "`" && !source.startsWith("${", end)) {
          end += source[end] === "\\" ? 2 : 1;
        }
        emit("string", Math.min(end, source.length));
      }
      continue;
    }

    if (context.mode === "text") {
      if (source.startsWith("<!--", position)) {
        const end = source.indexOf("-->", position + 4);
        emit("comment", end < 0 ? source.length : end + 3);
      } else if (char === "<" && /[A-Za-z_$/>]/.test(source[position + 1] ?? "")) {
        beginTag(source[position + 1] === "/");
      } else if (char === "{") {
        emit("punctuation", position + 1);
        stack.push({ mode: "expression", end: "}", operand: true, ternaries: 0 });
      } else {
        let end = position + 1;
        while (end < source.length && source[end] !== "<" && source[end] !== "{") end++;
        emit("plain", end);
      }
      continue;
    }

    if (/\s/.test(char)) {
      let end = position + 1;
      while (end < source.length && /\s/.test(source[end])) end++;
      emit("plain", end);
      continue;
    }

    if (context.mode === "tag") {
      const selfClosing = source.startsWith("/>", position);
      if (char === ">" || selfClosing) {
        emit("punctuation", position + (selfClosing ? 2 : 1));
        stack.pop();
        if (context.closing || selfClosing) stack.pop();
      } else if (char === "{") {
        emit("punctuation", position + 1);
        context.binding = false;
        stack.push({ mode: "expression", end: "}", operand: true, ternaries: 0 });
      } else if (char === '"' || char === "'") {
        if (context.binding) {
          emit("punctuation", position + 1);
          stack.push({ mode: "expression", end: char, operand: true, ternaries: 0 });
        } else emit("string", quotedEnd(position));
        context.binding = false;
      } else {
        const name = match(context.name ? tagName : attributeName);
        if (name) {
          const binding = !context.name && (name.startsWith("$") || name.startsWith("*"));
          emit(context.name ? "tag" : binding ? "binding" : "attribute", position + name.length);
          context.name = false;
          context.binding = name.startsWith("$");
        } else emit(char === "=" ? "operator" : "plain", position + 1);
      }
      continue;
    }

    if (context.end === char) {
      emit("punctuation", position + 1);
      stack.pop();
      continue;
    }
    if (source.startsWith("//", position) || source.startsWith("/*", position)) {
      const block = source[position + 1] === "*";
      const end = source.indexOf(block ? "*/" : "\n", position + 2);
      emit("comment", end < 0 ? source.length : end + (block ? 2 : 0));
    } else if (char === '"' || char === "'") {
      const end = quotedEnd(position);
      let next = end;
      while (/\s/.test(source[next] ?? "")) next++;
      emit(source[next] === ":" && context.ternaries === 0 ? "property" : "string", end);
      context.operand = false;
    } else if (char === "`" && language === "widget") {
      emit("string", position + 1);
      context.operand = false;
      stack.push({ mode: "template" });
    } else if (char === "<" && language === "widget" && context.operand && /[A-Za-z_$>]/.test(source[position + 1] ?? "")) {
      context.operand = false;
      beginTag(false);
    } else if (char === "{") {
      emit("punctuation", position + 1);
      context.operand = false;
      stack.push({ mode: "expression", end: "}", operand: true, ternaries: 0 });
    } else {
      const numeric = match(number);
      const name = numeric ? undefined : match(identifier);
      const op = numeric || name ? undefined : match(operator);
      if (numeric) {
        emit("number", position + numeric.length);
        context.operand = false;
      } else if (name) {
        let next = position + name.length;
        while (/\s/.test(source[next] ?? "")) next++;
        const kind = keywords.has(name) ? "keyword" : source[next] === "(" ? "function" : source[next] === ":" && context.ternaries === 0 ? "property" : "plain";
        emit(kind, position + name.length);
        context.operand = name === "return" || name === "typeof" || name === "void";
      } else if (op) {
        emit("operator", position + op.length);
        context.operand = true;
        if (op === "?") context.ternaries++;
        if (op === ":" && context.ternaries > 0) context.ternaries--;
      } else {
        emit(/[()[\]},;.]/.test(char) ? "punctuation" : "plain", position + 1);
        context.operand = char === "(" || char === "[" || char === "," || char === ";";
      }
    }
  }
  return tokens;
}
