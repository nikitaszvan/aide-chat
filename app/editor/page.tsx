'use client'

import { useState, useEffect, useRef } from 'react';
import CustomInput from '../components/CustomInput';

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

export default function Component() {
  const [terminalContent, setTerminalContent] = useState(placeholderText);
  const scrollAreaRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [terminalContent, inputCommand, isLoading]);

  

  return (
    <div 
      className="w-full h-[600px] bg-[#181818] text-white font-medium font-mono text-sm rounded-lg overflow-hidden flex flex-col"
      onClick={handleTerminalClick}
    >
      <div className="bg-[#323233] px-4 py-2 text-[#cccccc] flex items-center justify-between">
        <span>Terminal</span>
        <div className="flex space-x-2">
          <button className="w-3 h-3 rounded-full bg-[#ff5f56]" aria-label="Close terminal"></button>
          <button className="w-3 h-3 rounded-full bg-[#ffbd2e]" aria-label="Minimize terminal"></button>
          <button className="w-3 h-3 rounded-full bg-[#27c93f]" aria-label="Maximize terminal"></button>
        </div>
      </div>
      <div className="flex-grow p-4 relative overflow-y-scroll" ref={scrollAreaRef}>
        <pre className="whitespace-pre font-mono break-all">{terminalContent}</pre>
        <form onSubmit={handleInputSubmit} className="inline">
        <span className="whitespace-pre">nikitavan@Nikitas-MacBook-Pro aide-chat % </span>
          <CustomInput
            className="bg-transparent outline-none caret-transparent relative z-10"
          />
        </form>
      </div>
    </div>
  )
}