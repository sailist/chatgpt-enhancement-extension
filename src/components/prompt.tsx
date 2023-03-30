import React, { useState, useEffect } from 'react';
import Dropdown from './dropdown';

export interface PatternPair {
    pattern: string;
    prompt: string;
}

export interface AppState {
    patternPair: PatternPair[];
    status: string;
    language: "Chinese" | "English"
    globalPrompt: string;
}

export const defaultState = {
    patternPair: [
        { pattern: ".*", prompt: "Summary the content" },
        {
            pattern: "method",
            prompt: "Prompting 3 question about the proposed method, then reply it one by one",
        },
        {
            pattern: "method",
            prompt: "The abbr of the proposed method and its components.",
        },
        {
            pattern: "table\\s?([0-9]+)",
            prompt: "What does Table $1 try to prove?",
        },
        {
            pattern: "dataset",
            prompt: "What datasets dose the paper use?",
        },
    ],
    status: '',
    language: "Chinese",
    globalPrompt: "Answer the questions one by one after reading the content above."
} as AppState

const App = () => {
    const [state, setState] = useState<AppState>(defaultState);

    useEffect(() => {
        chrome.storage.sync.get(
            {
                promptGroup: defaultState,
            },
            (items) => {
                setState(items.promptGroup);
            }
        );
    }, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, index: number, inputIndex: "prompt" | "pattern") => {
        const { value } = event.target;
        setState((prevState) => {
            const patternPair = [...prevState.patternPair];
            patternPair[index][inputIndex] = value;
            const newState = {
                ...prevState,
                patternPair: patternPair,
            };
            chrome.storage.sync.set({ "promptGroup": newState }).then(() => {
                console.log('Store results')
                console.log(newState)
            })
            return newState;
        });
    };

    const handleAddRow = () => {
        setState((prevState) => ({
            ...prevState,
            patternPair: [...prevState.patternPair, { pattern: '', prompt: '' }],
        }));
    };

    const handleReset = () => {
        setState((prevState) => {
            chrome.storage.sync.set({ "promptGroup": defaultState }).then(() => {
                console.log('Resets')
            })
            return defaultState;

        });
    }

    const handleLangChange = (language: "Chinese" | "English") => {
        // const { value } = event.target;
        setState((prevState) => {
            const newState = {
                ...prevState,
                language: language,
            };
            chrome.storage.sync.set({ "promptGroup": newState }).then(() => {
                console.log(newState)
            })
            return newState;
        });
    }

    const handleDeleteRow = (index: number) => {
        setState((prevState) => {
            const patternPair = [...prevState.patternPair];
            patternPair.splice(index, 1);
            return {
                ...prevState,
                patternPair: patternPair,
            };
        });
    };

    return (
        <>
            {/* <div className="p-2 bg-gray-100">{`Status: ${state.status}`}</div> */}
            <Dropdown defaultLang={state.language} onChange={handleLangChange}></Dropdown>
            {state.patternPair.map((inputRow, index) => (
                <div key={index} className="col-span-full py-1 border-b border-gray-200">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                        <input
                            type="text"
                            placeholder="regexp pattern"
                            value={inputRow.pattern}
                            onChange={(event) => handleInputChange(event, index, 'pattern')}
                            className="text-sm py-1 flex-none px-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <button
                            onClick={() => handleDeleteRow(index)}
                            className="text-sm py-1 px-2 bg-red-500 text-white rounded flex-1"
                        >
                            Del -
                        </button>
                    </div>
                    <textarea
                        placeholder="prompt"
                        value={inputRow.prompt}
                        onChange={(event) => handleInputChange(event, index, 'prompt')}
                        className="resize text-sm w-full py-1 px-2 pt-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />

                </div>
            ))}
            <div className="py-2 border-b border-gray-200">

                <button
                    onClick={handleAddRow}
                    className="w-3/4 px-2 py-2 bg-blue-500 text-white rounded"
                >
                    Add +
                </button>
                <button
                    onClick={handleReset}
                    className="w-1/4 px-2 py-2 bg-gray-500 text-white rounded"
                >
                    Reset +
                </button>
            </div>
        </>
    );
};

export default App;
