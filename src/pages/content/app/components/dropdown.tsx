import React, { useState, useEffect } from "react";

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

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
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
    </div>
  );
};

export default Dropdown;
