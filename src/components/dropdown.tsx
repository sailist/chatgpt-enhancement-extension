import React, { useState, useEffect } from 'react';

type Language = "Chinese" | "English";

type Props = {
    onChange?: (language: Language) => void;
    defaultLang: Language;

};

const Dropdown: React.FC<Props> = ({ defaultLang, onChange }) => {
    const [language, setLanguage] = useState<Language>(defaultLang);
    useEffect(() => {
        setLanguage(defaultLang);
    }, [defaultLang]);

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLanguage = event.target.value as Language;
        setLanguage(selectedLanguage);
        onChange?.(selectedLanguage);
    };

    return (
        <div className="relative">
            <select
                className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                value={language}
                onChange={handleLanguageChange}
            >
                <option value="Chinese">中文</option>
                <option value="English">English</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M12.707 7.293a1 1 0 0 0-1.414 0L10 8.586 8.707 7.293a1 1 0 1 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l2-2a1 1 0 0 0 0-1.414zM7.293 12.707a1 1 0 0 0 1.414 0L10 11.414l1.293 1.293a1 1 0 0 0 1.414-1.414l-2-2a1 1 0 0 0-1.414 0l-2 2a1 1 0 0 0 0 1.414z"
                    />
                </svg>
            </div>
        </div>
    );
};

export default Dropdown;
