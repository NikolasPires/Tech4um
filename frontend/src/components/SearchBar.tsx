import React, { useEffect, useState } from 'react';
import { InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

type Props = {
  onSearch: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
};

export default function SearchBar({ onSearch, placeholder = 'Search', debounceMs = 300 }: Props) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const t = setTimeout(() => onSearch(value), debounceMs);
    return () => clearTimeout(t);
  }, [value, onSearch, debounceMs]);

  return (
    <TextField
      fullWidth
      placeholder={placeholder}
      variant="outlined"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: '#6B7280' }} />
          </InputAdornment>
        ),
      }}
      sx={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
      }}
    />
  );
}
