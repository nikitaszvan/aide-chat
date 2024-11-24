'use client'

import { useState, useEffect, useRef } from 'react';
import CustomInput from '../../components/CustomInput/CustomInput.component';
import { 
  StyledTerminalContainer,
  TitleBar,
  WindowControlsContainer,
  TerminalWindow
 } from './pages.styles';

const placeholderText = `nikitavan@Nikitas-MacBook-Pro aide-chat % npm run dev

> aide-chat@0.1.0 dev
> next dev --turbopack

   ▲ Next.js 15.0.3 (Turbopack)
   - Local:        http://localhost:3000
   - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 631ms
 ○ Compiling / ...
 ✓ Compiled / in 1086ms
 GET / 200 in 1206ms
 ✓ Compiled /editor in 144ms
 GET /editor 200 in 176ms
 ✓ Compiled /api/openai in 28ms
 ⨯ Error: Page /api/openai does not export a default function.
    at new PagesAPIRouteModule (webpack://next/dist/src/server/route-modules/pages-api/module.ts:122:12)
    at <unknown> (node_modules/next/dist/src/build/templates/pages-api.ts:16:27)
  120 |
  121 |     if (typeof options.userland.default !== 'function') {
> 122 |       throw new Error(
      |            ^
  123 |         \`Page \${options.definition.page} does not export a default function.\`
  124 |       )
  125 |     }
 ✓ Compiled /_error in 397ms
 POST /api/openai 500 in 550ms
^C
nikitavan@Nikitas-MacBook-Pro aide-chat % npm run dev

> aide-chat@0.1.0 dev
> next dev --turbopack

   ▲ Next.js 15.0.3 (Turbopack)
   - Local:        http://localhost:3000
   - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 579ms
 ○ Compiling /editor ...
 ✓ Compiled /editor in 1010ms
 GET /editor 200 in 1132ms
 ✓ Compiled /favicon.ico in 80ms
 GET /favicon.ico?favicon.45db1c09.ico 200 in 149ms
 ✓ Compiled /api/openai in 30ms
 POST /api/openai 200 in 992ms
`
type CustomInputRef = HTMLTextAreaElement & {
  focus: () => void;
};

const Editor = () => {
  const [terminalContent, setTerminalContent] = useState([placeholderText]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<CustomInputRef>(null);


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [terminalContent]);

  const handleCommandSubmit = (command: string, response: string) => {
    setTerminalContent((prev) => [...prev, 'nikitavan@Nikitas-MacBook-Pro aide-chat % ' + command]);
    setTerminalContent((prev) => [...prev, response]);
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <StyledTerminalContainer>
      <TitleBar>
        <span>Terminal</span>
        <WindowControlsContainer>
          <button aria-label="Close terminal"></button>
          <button aria-label="Minimize terminal"></button>
          <button aria-label="Maximize terminal"></button>
        </WindowControlsContainer>
      </TitleBar>
      <TerminalWindow ref={scrollAreaRef} onClick={handleClick}>
        {terminalContent.map((content, index) => 
          <pre key={index}>{content}</pre>
        )}
          <CustomInput
            onCommandSubmit={handleCommandSubmit}
            ref={inputRef}
          />
      </TerminalWindow>
    </StyledTerminalContainer>
  )
}

export default Editor;