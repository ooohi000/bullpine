import React from 'react';
import { Search } from 'lucide-react';

export interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearch: () => void;
}

const SearchInput = ({ value, onChange, handleSearch }: SearchInputProps) => {
  return (
    <div className="relative w-full">
      <input
        type="text"
        data-input-surface="dark"
        placeholder="종목·회사명 검색"
        value={value}
        onChange={onChange}
        className="h-11 w-full rounded-xl border border-input bg-background/70 py-2.5 pl-4 pr-12 text-sm text-foreground shadow-sm backdrop-blur-sm placeholder:text-muted-foreground/75 transition-[border-color,box-shadow] focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 md:h-12 md:pl-5 md:text-base"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch();
          }
        }}
      />
      <button
        type="button"
        onClick={handleSearch}
        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-primary/15 text-primary transition-colors hover:bg-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:right-2.5"
        aria-label="검색"
      >
        <Search className="h-[1.125rem] w-[1.125rem] md:h-5 md:w-5" />
      </button>
    </div>
  );
};

export default SearchInput;
