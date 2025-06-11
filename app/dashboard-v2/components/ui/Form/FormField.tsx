import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  step?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  as?: 'input' | 'textarea';
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  step,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  as = 'input',
}) => {
  const commonProps = {
    id: name,
    name: name,
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    required: required,
    step: step,
    className: `mt-1 block w-full px-3 py-2 bg-white border ${error ? 'border-red-500' : 'border-gray-300'
      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`,
  };

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {as === 'textarea' ? (
        <textarea {...commonProps} rows={4} />
      ) : (
        <input {...commonProps} type={type} />
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};