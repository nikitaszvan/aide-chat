import { useState, useEffect, useRef, FC, FormEvent, KeyboardEvent, ChangeEvent } from "react";
import LoadingAnimation from '../components/LoadingAnimation';

const CustomInput: FC<{className?: string}> = ({className}) => {
  const [caretPosition, setCaretPosition] = useState({ left: 0, top: 0 });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [inputCommand, setInputCommand] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTerminalClick = () => {
      inputRef.current?.focus()
  }

  const updateCaretPosition = () => {
    if (inputRef.current) {
      const input = inputRef.current;
      const { selectionStart } = input;

      // Create a range to find the caret position
      const rect = input.getBoundingClientRect();
      const inputStyle = window.getComputedStyle(input);

      // Create a dummy span to measure the caret's position
      const dummySpan = document.createElement("span");
      dummySpan.style.position = "absolute";
      dummySpan.style.visibility = "hidden";
      dummySpan.style.whiteSpace = "pre";

      // Apply input's styles to dummy span for accurate measurement
      dummySpan.style.font = inputStyle.font;
      dummySpan.textContent = input.value.slice(0, selectionStart || 0);

      document.body.appendChild(dummySpan);
      const spanRect = dummySpan.getBoundingClientRect();
      setCaretPosition({
        left: rect.left + spanRect.width + parseInt(inputStyle.paddingLeft),
        top: rect.top + parseInt(inputStyle.paddingTop),
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

          Please return the response in this exact format:

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
    }
  };

  const handleInputSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (inputCommand.trim()) {
    
      setHistory((prev) => [...prev, `${inputCommand.trim()}`]);

      const [command, ...args] = inputCommand.trim().split(' ');

      if (command !== 'als') {
        setTerminalContent(prevContent => prevContent + `command not found` + '\n');
        setInputCommand('');
        return;
      }
      const aliasHandler = aliasMap[command];

      let query = inputCommand;
      if (aliasHandler) {
        query = aliasHandler(args.join(' '));
      }

      try {
        
        const res = await fetch('/api/openai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: query }),
        });
        const data = await res.json();

        const responseRegex = /Response:\s*([\s\S]*?)\s*Revised Code:/;
        const revisedCodeRegex = /Revised Code:\s*```(?:javascript)?\s*([\s\S]*?)\s*```/i;


        const responseMatch = data.message.match(responseRegex);
        const revisedCodeMatch = data.message.match(revisedCodeRegex);

        let response = '';
        let revisedCode = '';

        if (responseMatch) {
        response = responseMatch[1].trim();
        }

        if (revisedCodeMatch) {
        revisedCode = revisedCodeMatch[1];
        }


        if (response && revisedCode) {

            const formattedResponse = `
            Response: 
            ${response}

            Revised Code: 
                ${revisedCode}
            `;

            setTerminalContent(prevContent => prevContent + `nikitavan@Nikitas-MacBook-Pro aide-chat % ` + inputCommand.trim() + '\n');
            setTerminalContent(prevContent => prevContent + `nikitavan@Nikitas-MacBook-Pro aide-chat % ` + formattedResponse + '\n');
        }
        
      } catch (error) {
        console.error('Error calling OpenAI API:', error);
      } finally {
        
      }
      setIsLoading(false);
      setInputCommand('');
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputCommand(e.target.value)
  }

  const handleTerminalClick = () => {
    inputRef.current?.focus()
  }

  useEffect(() => {
    const handleInput = updateCaretPosition;

    document.addEventListener("input", handleInput);
    document.addEventListener("click", handleInput);

    return () => {
      document.removeEventListener("input", handleInput);
      document.removeEventListener("click", handleInput);
    };
  }, []);

  return (
    <>
      <input
        ref={inputRef}
        className={`text-lg p-2 border border-gray-300 w-full caret-transparent ${className}`}
        onClick={updateCaretPosition}
        onKeyUp={updateCaretPosition}
        onFocus={updateCaretPosition}
        type="text"
            spellCheck="false"
        value={inputCommand}
        onChange={handleInputChange}
        style={{ width: `${inputCommand.length}ch` }}
        aria-label="Terminal input"
        onKeyDown={handleKeyDown}
      />
      <div
        className="absolute w-[2px] h-[1.2em] bg-red-500 pointer-events-none animate-blink"
        style={{
          left: `${caretPosition.left}px`,
          top: `${caretPosition.top}px`,
        }}
      />
        {!isLoading && <span className="absolute">▊</span>}
        {isLoading && <LoadingAnimation className="my-4"/>}
    </>
  );
};

export default CustomInput;
