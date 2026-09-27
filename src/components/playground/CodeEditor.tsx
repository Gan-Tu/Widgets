import { memo, useLayoutEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { highlightCode, type CodeLanguage } from "./highlight";
import "./code-editor.css";

type CodeEditorProps = {
  id: string;
  value: string;
  language: CodeLanguage;
  onChange: (value: string) => void;
  className?: string;
};

export const CodeEditor = memo(function CodeEditor({ id, value, language, onChange, className }: CodeEditorProps) {
  const input = useRef<HTMLTextAreaElement>(null);
  const highlight = useRef<HTMLPreElement>(null);
  const tokens = useMemo(() => highlightCode(value, language), [value, language]);

  function syncViewport() {
    if (!input.current || !highlight.current) return;
    // Match the content viewport even when the OS uses non-overlay scrollbars.
    highlight.current.style.width = `${input.current.clientWidth}px`;
    highlight.current.style.height = `${input.current.clientHeight}px`;
    highlight.current.scrollTop = input.current.scrollTop;
    highlight.current.scrollLeft = input.current.scrollLeft;
  }

  useLayoutEffect(() => {
    syncViewport();
    const observer = new ResizeObserver(syncViewport);
    if (input.current) observer.observe(input.current);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(syncViewport, [value]);

  return (
    <div className={cn("playground-code-editor", className)}>
      <pre ref={highlight} className="playground-code-highlight" aria-hidden="true">
        {tokens.map((token, index) => (
          <span key={index} className={`syntax-${token.kind}`}>{token.text}</span>
        ))}
        {/* A final empty line needs a glyph to have the same height as the textarea. */}
        {"\n"}
      </pre>
      <textarea
        ref={input}
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onScroll={syncViewport}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        wrap="soft"
        className="playground-code-input"
      />
    </div>
  );
});
