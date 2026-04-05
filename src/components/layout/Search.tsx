import React from 'react';
import SearchInput, { SearchInputProps } from '../common/SearchInput';

const Search = ({ value, onChange, handleSearch }: SearchInputProps) => {
  return (
    <SearchInput
      value={value}
      onChange={onChange}
      handleSearch={handleSearch}
    />
  );
};

export default Search;
