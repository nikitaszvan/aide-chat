import styled from "styled-components";

export const StyledInputContainer = styled.div`

`

export const StyledForm = styled.form`
    display: flex;
    position: relative;
    width: 100%;

    > textarea {
        opacity: 0;
        height: 1px;
        width: 1px; 
    }
`

export const ActiveCommand = styled.span<{$textBeforeCursor: string; $textAfterCursor: string}>`
    display: flex;
    font-size: 14px;

    &:before {
        content: "${({$textBeforeCursor}) => $textBeforeCursor}";
        align-items: center;
    }

    &:after {
        content: "${({$textAfterCursor}) => $textAfterCursor}";
        align-items: center;
    }
`

export const Caret = styled.span<{$isFocused: boolean}>`
    width: calc(1ch + 1px);
    height: calc(1.2rem + 1px);
    pointer-events: none;
    font-size: 14px;
    

    ${({$isFocused}) => $isFocused ?
        `
            background-color: white;
            color: #181818
        ` :
        `
            height: 1.2rem;
            width: calc(1ch + 1px);
            background: transparent;
            border: 1px solid white;
            color: white
        `
    }

`