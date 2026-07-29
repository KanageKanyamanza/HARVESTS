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
    <div>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Icon className="h-4.5 w-4.5 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${showPasswordToggle ? 'pr-12' : 'pr-4'} py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1A5514] outline-none transition-all text-sm ${
            error ? 'border-red-300' : 'border-gray-200'
          }`}
        />
        {showPasswordToggle && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
            onClick={onTogglePassword}
          >
            {showPassword ? (
              <EyeOff className="h-4.5 w-4.5" />
            ) : (
              <Eye className="h-4.5 w-4.5" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default FormField;

