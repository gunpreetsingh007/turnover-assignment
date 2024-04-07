import React, { forwardRef } from 'react';
import type { ForwardedRef } from 'react';

interface CodeInputProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyUp: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  value: string;
  required?: boolean;
}

const CodeInput = forwardRef<HTMLInputElement, CodeInputProps>(
  ({ onChange, onFocus, onKeyUp, value, required }, ref: ForwardedRef<HTMLInputElement>) => (
    <input
      ref={ref}
      className="w-12 h-12 rounded-md border border-solid border-neutral-500 bg-white text-center"
      maxLength={1}
      type="text"
      value={value}
      onChange={onChange}
      onKeyUp={onKeyUp}
      onFocus={onFocus}
      required={required ?? false}
    />
  )
);

CodeInput.displayName = 'CodeInput';

export default CodeInput;