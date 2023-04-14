import React from "react";

export default function SearchBar({
  onChange,
}: {
  onChange: (e: React.ChangeEvent) => void;
}) {
  return (
    <div className="bg-white sticky top-0 hidden lg:flex items-center text-sm leading-6 text-slate-400 rounded-md ring-1 ring-slate-900/10 shadow-sm py-1.5 pl-2 pr-3">
      <input
        placeholder="search"
        onChange={onChange}
        className="placehold min-h-0 w-full h-auto resize-y font-medium block rounded-md border-0 py-1.5 pl-4 pr-4
              text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      />
    </div>
  );
}
