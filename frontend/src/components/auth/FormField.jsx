import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

const FormField = ({ 
  icon: Icon, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder, 
  error,
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword,
  helperText
}) => {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-black" />
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${showPasswordToggle ? 'pr-12' : 'pr-4'} py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
          error ? 'border-red-300' : 'border-gray-300'
        }`}
      />
      {showPasswordToggle && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={onTogglePassword}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5 text-black" />
          ) : (
            <Eye className="h-5 w-5 text-black" />
          )}
        </button>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default FormField;

