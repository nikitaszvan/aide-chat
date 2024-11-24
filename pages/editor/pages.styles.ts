import styled from "styled-components";

export const StyledTerminalContainer = styled.div`
    width: 100%;
    height: 600px;
    background-color: #181818;
    color: white;
    font-weight: 500;
    font-family: monospace;
    font-size: 14px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border-radius: 0.5rem;
`

export const TitleBar = styled.div`
    background-color: #323233;
    padding-inline: 1rem;
    padding-block: 0.5rem;
    color: #cccccc;
    display: flex;
    align-items: center;
    justify-content: space-between;
`

export const WindowControlsContainer = styled.div`
    display: flex;
    gap: 0.5rem;

    > button {
        width: 0.75rem;
        height: 0.75rem;
        border-radius: 50%;
        border: none;

         &:nth-of-type(1) {
        background-color: #ff5f56;
        }

        &:nth-of-type(2) {
            background-color: #ffbd2e;
        }

        &:nth-of-type(2) {
            background-color: #27c93f;
        }
    }
`

export const TerminalWindow = styled.div`
    flex-grow: 1;
    padding: 1rem;
    position: relative;
    overflow-y: scroll;
    word-wrap: break-word;

    > pre {
        white-space: pre;
        font-family: monospace;
        word-break: break-all;
    }
`