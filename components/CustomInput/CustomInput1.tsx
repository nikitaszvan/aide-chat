import { useState, useEffect, useRef, FormEvent, KeyboardEvent, forwardRef, useImperativeHandle} from "react";
import LoadingAnimation from '../LoadingAnimation';

type InputProps = {
  onCommandSubmit: (command: string, response: string) => void;
  className?: string;
};

const CustomInput= forwardRef<HTMLTextAreaElement, InputProps>(({ onCommandSubmit, className }: InputProps, ref) => {

  const [caretPosition, setCaretPosition] = useState({left: 0, top: 0});
  const spanRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [inputCommand, setInputCommand] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [rightOfCaret, setRightOfCaret] = useState<string | null>(null);
  const [indentWidth, setIndentWidth] = useState<number>(0);
  const [rows, setRows] = useState(1);
  const followerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    ...inputRef.current!,
    focus: () => {
      inputRef.current?.focus();
      updateCaretPosition();
      setIsFocused(true);
    },
  }));
  
  const updateCaretPosition = () => {
    if (inputRef.current) {
      const input = inputRef.current;
      const { selectionStart } = input;
  
      const rect = input.getBoundingClientRect();
      const inputStyle = window.getComputedStyle(input);

      const characterWidth = 8.43;

      const dummySpan = document.createElement("span");
      dummySpan.style.position = "absolute";
      dummySpan.style.visibility = "hidden";
      dummySpan.style.whiteSpace = "pre-wrap";
      dummySpan.style.textIndent = indentWidth + 'px';
      dummySpan.style.font = inputStyle.font;
      dummySpan.textContent = input.value.slice(0, selectionStart || 0);
  
      document.body.appendChild(dummySpan);
  
      const spanRect = dummySpan.getBoundingClientRect();
  
      const firstLineWidth = rect.width - indentWidth;
      const charsInFirstLine = Math.floor(firstLineWidth / characterWidth);
      const charsPerLine = Math.floor(rect.width / characterWidth);
  
      const caretX = selectionStart;
  
      let leftPosition;
  
      if (rows === 1) {
        leftPosition = (caretX * characterWidth) + indentWidth;
      } else if (rows === 2) {
        leftPosition = ((caretX - charsInFirstLine) * characterWidth);
      } else {
        leftPosition = ((caretX - charsInFirstLine - (charsPerLine * (rows-2))) * characterWidth);
      }
      
      setCaretPosition({
        left: leftPosition,
        top: spanRect.height ? (spanRect.height * rows) - 20  : 0,
      });
  
      document.body.removeChild(dummySpan);
    }
  };

  const aliasMap: Record<string, (args: string) => string> = {
    'als': (args) => {
        const errorMatch = args.match(/er:\s*\[([^\]]+)\]\s*(?=\s*ce:|$)/);
        const codeMatch = args.match(/ce:\s*\[([^\]]+)\]/);
      
      if (errorMatch && codeMatch) {
        const error = errorMatch[1].trim();
        const code = codeMatch[1].trim();
        
        return `
          Why am I getting the following error?:
          ${error}
          
          This is my code:
          ${code}

          It is really important to please return the response in this exact format as a response and revised code:

            Response: <insert error with comments beside each line of error to explain, and a final summary of the error>
            Revised Code:
            \`\`\`javascript
            <insert revised code>
            \`\`\`

            Make sure the "Revised Code" section is encapsulated within triple backticks followed by "javascript", and there are no additional explanations outside the requested format.
            `;
      }
      
      return 'Invalid input format.';
    },
  };

  const calculateRows = () => {
    if (inputRef.current) {
      const inputElement = inputRef.current;
      const newlineCount = (inputElement.value.match(/\n/g) || []).length;

      const span = document.createElement("span");
      span.style.position = "absolute";
      span.style.visibility = "hidden";
      span.style.width = "100%";
      span.style.paddingInline = "1rem";
      span.style.textIndent = `calc(${indentWidth}px + 1ch)`;
      span.style.wordWrap = "break-word";
      span.style.font = window.getComputedStyle(inputElement).font;

      document.body.appendChild(span);

      span.textContent = inputCommand;

  
      const height = span.getBoundingClientRect().height;
      document.body.removeChild(span);

      const lineHeight = parseInt(window.getComputedStyle(inputElement).lineHeight, 10);
      if (height) {
        const calculatedRows = Math.max(1, Math.floor(height / lineHeight));

        if (calculatedRows >= newlineCount + 1) {
          setRows(calculatedRows);
        }
      }
      else {
        setRows(1);
      }
    }
      
    }

  const updateRightOfCaret = () => {
    if (inputRef.current) {
      const input = inputRef.current;
      const { selectionStart } = input;
      if (selectionStart !== null && selectionStart < input.value.length) {
        
        const letterToRight = input.value.charAt(selectionStart);
        setRightOfCaret(letterToRight);
      } else {
        setRightOfCaret(null);
      }
    }
  };

  useEffect(() => {
    const handleFocus = () => {
      setIsFocused(true);
    };
  
    const handleBlur = () => {
      setIsFocused(false);
    };
  
    const advanceNextLine = (e: ClipboardEvent) => {
      e.preventDefault();
      const pastedContent = e.clipboardData?.getData("text") || "";
      if (inputRef.current) {

        const inputElement = inputRef.current;
        const { selectionStart, selectionEnd, value } = inputElement;
  
        const updatedValue =
          value.slice(0, selectionStart!) +
          pastedContent +
          value.slice(selectionEnd!);
  
        setInputCommand('\n' + updatedValue);
        const rows = updatedValue.split("\n").length;
        setRows(rows + 1);
      }
    };
  
    const inputElement = inputRef.current;
  
    if (inputElement) {
      inputElement.addEventListener("focus", handleFocus);
      inputElement.addEventListener("blur", handleBlur);
      inputElement.addEventListener("paste", advanceNextLine);
    }
  
    return () => {
      if (inputElement) {
        inputElement.removeEventListener("focus", handleFocus);
        inputElement.removeEventListener("blur", handleBlur);
        inputElement.removeEventListener("paste", advanceNextLine);
      }
    };
  }, [inputRef]);
  

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInputCommand(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInputCommand(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputCommand('');
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      // Prevent form submission on regular 'Enter' key press
      e.preventDefault();
      handleInputSubmit(e as any);
      updateCaretPosition();
      setIsFocused(true);
    } else if (e.key === 'Enter' && e.shiftKey) {
      setRows((prev) => prev + 1);

      e.preventDefault();
      if (inputRef.current) {
        const cursorPosition = inputRef.current.selectionStart;
        const value = inputRef.current.value;
        console.log(value.slice(0, cursorPosition), value.slice(cursorPosition));
        const newValue = value.slice(0, cursorPosition) + "\n" + value.slice(cursorPosition);
  
        setInputCommand(newValue);
        inputRef.current.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
      }
    }
  };
  

  const handleInputSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (inputCommand.trim()) {
    
      setHistory((prev) => [...prev, `${inputCommand.trim()}`]);
      const [command, ...args] = inputCommand.trim().split(' ');
      try {
        
        const res = await fetch('/api/openai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: inputCommand }),
        });
        const data = await res.json();
        onCommandSubmit(inputCommand.trim(), data.message);
      } catch (error) {
        console.error('Error calling OpenAI API:', error);
      } finally {
        
      }
      setIsLoading(false);
    }
    setInputCommand('');
    setCaretPosition({
      left: indentWidth,
      top: 0,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputCommand(e.target.value);
    calculateRows();
    updateCaretPosition();          
    updateRightOfCaret();
  };

  useEffect(() => {
    if (spanRef.current) {
      const spanWidth = spanRef.current.getBoundingClientRect().width;
      setIndentWidth(spanWidth);
    }
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.textIndent = `${indentWidth}px`;
    }
  }, [indentWidth]);

  // useEffect(() => {
  //   const handleMouseMove = (event) => {
  //     setCursorPosition({
  //       x: event.clientX,
  //       y: event.clientY,
  //     });
  //     console.log(event.clientX, event.clientY);
  //   };

  //   // Add event listener for mousemove
  //   document.addEventListener("mousemove", handleMouseMove);

  //   return () => {
  //     // Clean up the event listener
  //     document.removeEventListener("mousemove", handleMouseMove);
  //   };
  // }, []);

  return (
    <form onSubmit={handleInputSubmit} className="flex relative" onClick={() => inputRef.current?.focus()}>
      <span ref={spanRef} className="whitespace-pre absolute top-0 left-0">nikitavan@Nikitas-MacBook-Pro aide-chat % </span>
      <textarea
        rows={rows}
        ref={inputRef}
        className={`caret-red-700 flex flex-grow bg-transparent resize-none outline-none relative break-word whitespace-prewrap overflow-hidden opacity-0`}
        onClick={() => {
          updateCaretPosition();          
          updateRightOfCaret();
        }}
        onChange={handleInputChange}
        spellCheck="false"
        value={inputCommand}
        aria-label="Terminal input"
        onKeyDown={handleKeyDown}
        onKeyUp={() => {
          updateCaretPosition();          
          updateRightOfCaret();
        }}
        autoFocus
      />
      <button type="submit" className="hidden">Submit</button>
      <div
        ref={followerRef}
        className={`absolute w-[1ch] h-[1.2rem] pointer-events-none opacity-0 ${caretPosition.left && `opacity-100`} ${isFocused ? 'bg-white text-[#181818]' : 'bg-transparent border-white border-[1px] text-transparent'}`}
        style={{
          left: caretPosition.left+`px`,
          top: caretPosition.top+`px`
        }}
      >{rightOfCaret}</div>
        {isLoading && <LoadingAnimation className="my-4"/>}
    </form>
  );
});

export default CustomInput;
