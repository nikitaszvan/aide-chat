import { 
    useState,
    useRef,
    useEffect,
    forwardRef,
    useImperativeHandle,
    FormEvent,
    KeyboardEvent,
    CSSProperties
} from "react";

import {
    StyledInputContainer,
    StyledForm,
    ActiveCommand,
    Caret
} from "./CustomInput.styles";

type InputProps = {
    onCommandSubmit: (command: string, response: string) => void;
    className?: string;
  };

const CustomInput = forwardRef<HTMLTextAreaElement, InputProps>(({ onCommandSubmit, className }: InputProps, ref) => {
  const [textBeforeCursor, setTextBeforeCursor] = useState("");
  const [textAfterCursor, setTextAfterCursor] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [letterInCaret, setLetterInCaret] = useState('');


  useImperativeHandle(ref, () => ({
    ...inputRef.current!,
    focus: () => {
      inputRef.current?.focus();
      setIsFocused(true);
    },
  }));

    const handleKeyDown = (event: KeyboardEvent) => {

      if (event.key === "ArrowLeft") {
        if (textBeforeCursor.length > 0) {
          const lastChar = textBeforeCursor.slice(-1);
          setTextBeforeCursor((prev) => prev.slice(0, -1));
          setTextAfterCursor((prev) => lastChar + (prev || ""));
          setLetterInCaret(lastChar);
        }
      } else if (event.key === "ArrowRight") {
        if (textAfterCursor.length > 0) {
          const firstChar = textAfterCursor.charAt(0);
          setTextAfterCursor((prev) => prev.slice(1));
          setTextBeforeCursor((prev) => prev || "" + firstChar);
          setLetterInCaret(firstChar);
        }
      }
    };


  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (inputRef.current) {
      const { selectionStart } = inputRef.current;
      setTextBeforeCursor(value.slice(0, selectionStart || 0));
      setTextAfterCursor(value.slice(selectionStart || 0));
    }
  };

  useEffect(() => {
    const handleFocus = () => {
      setIsFocused(true);
    };
  
    const handleBlur = () => {
      setIsFocused(false);
    };
  
    const inputElement = inputRef.current;
  
    if (inputElement) {
      inputElement.addEventListener("focus", handleFocus);
      inputElement.addEventListener("blur", handleBlur);
      //inputElement.addEventListener("paste", advanceNextLine);
    }
  
    return () => {
      if (inputElement) {
        inputElement.removeEventListener("focus", handleFocus);
        inputElement.removeEventListener("blur", handleBlur);
        //inputElement.removeEventListener("paste", advanceNextLine);
      }
    };
  }, [inputRef]);

  return (
    <StyledInputContainer>
      <StyledForm>
        nikitavan@Nikitas-MacBook-Pro aide-chat %&#xA0;
        <ActiveCommand 
          $textBeforeCursor = {textBeforeCursor}
          $textAfterCursor = {textAfterCursor}
        >
          <Caret $isFocused = {isFocused}>
              {letterInCaret}
          </Caret>
        </ActiveCommand>
        <textarea
          ref={inputRef}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </StyledForm>
    </StyledInputContainer>
  );
});

export default CustomInput;
