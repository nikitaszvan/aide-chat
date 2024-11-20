import { useState, useEffect, useRef, FC, FormEvent, KeyboardEvent, ChangeEvent } from "react";
import LoadingAnimation from '../components/LoadingAnimation';

type InputProps = {
  onCommandSubmit: (command: string, response: string) => void;
  className?: string;
};

const CustomInput: FC<InputProps> = ({ onCommandSubmit, className }: InputProps) => {
  const [caretPosition, setCaretPosition] = useState({left: 0, top: 0});
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [inputCommand, setInputCommand] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);



  const updateCaretPosition = () => {
    if (inputRef.current) {
      const input = inputRef.current;
      const { selectionStart } = input;

      const rect = input.getBoundingClientRect();
      const inputStyle = window.getComputedStyle(input);

      const dummySpan = document.createElement("span");
      dummySpan.style.position = "absolute";
      dummySpan.style.visibility = "hidden";
      dummySpan.style.whiteSpace = "pre";

      dummySpan.style.font = inputStyle.font;
      dummySpan.textContent = input.value.slice(0, selectionStart || 0);

      document.body.appendChild(dummySpan);
      const spanRect = dummySpan.getBoundingClientRect();
      setCaretPosition({
        left: rect.left + spanRect.width - 16,
        top: spanRect.height ? spanRect.height - 20 : 0,
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

            onCommandSubmit(inputCommand.trim(), formattedResponse);
            //setTerminalContent(prevContent => prevContent + `nikitavan@Nikitas-MacBook-Pro aide-chat % ` + formattedResponse + '\n');
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

  useEffect(() => {
    updateCaretPosition();

    const handleInput = updateCaretPosition;
    if (inputRef.current) {
      const inputElement = inputRef.current;
      inputElement.addEventListener("focus", handleInput);
    }

    document.addEventListener("input", handleInput);
    document.addEventListener("click", handleInput);

    return () => {
      if (inputRef.current) {
        const inputElement = inputRef.current;
        inputElement.removeEventListener("focus", handleInput);
      }

      document.removeEventListener("input", handleInput);
      document.removeEventListener("click", handleInput);
    };
  }, []);

  return (
    <form onSubmit={handleInputSubmit} className="flex relative" onClick={() => inputRef.current?.focus()}>
      <span className="whitespace-pre">nikitavan@Nikitas-MacBook-Pro aide-chat % </span>
      <input
        ref={inputRef}
        className={`caret-transparent w-fit flex flex-grow bg-transparent outline-none relative`}
        onClick={updateCaretPosition}
        onKeyUp={updateCaretPosition}
        onFocus={updateCaretPosition}
        type="text"
        spellCheck="false"
        value={inputCommand}
        onChange={handleInputChange}
        aria-label="Terminal input"
        onKeyDown={handleKeyDown}
        autoFocus
      />
      <div
        className={`absolute w-[1ch] h-[2ch] bg-white pointer-events-none opacity-0 ${caretPosition.left && `opacity-100`}`}
        style={{
          left: caretPosition.left+`px`,
          top: caretPosition.top+`px`
        }}
      />
        {isLoading && <LoadingAnimation className="my-4"/>}
    </form>
  );
};

export default CustomInput;
