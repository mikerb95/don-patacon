import React, { type ChangeEvent, useId } from 'react';
import classnames from 'classnames';

interface FormTextProps {
    value: string;
    label?: string;
    placeholder?: string;
    onChange: (value: string) => void;
    type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'time' | 'textarea';

    className?: string;

    error?: boolean;
    errorMessage?: string;
    min?: string;
    max?: string;
    required?: boolean;
}

const FormText: React.FC<FormTextProps> = ({
    value,
    label,
    placeholder,
    onChange,
    type = 'text',
    error = false,
    errorMessage,
    min,
    max,
    required,
    className,
}) => {
    const id = useId();
    const errorId = `${id}-error`;
    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        onChange(e.target.value);
    };
    const showError = error && errorMessage;
    return (
        <div className={classnames('relative flex flex-col', className)}>
            {label && (
                <label
                    htmlFor={id}
                    className="absolute -top-3 left-3 px-2 bg-pulpa text-base font-extrabold leading-none"
                >
                    {label}
                    {required && <span aria-hidden="true"> *</span>}
                </label>
            )}
            {type === 'textarea' ? (
                <textarea
                    id={id}
                    value={value}
                    placeholder={placeholder}
                    aria-invalid={error || undefined}
                    aria-describedby={showError ? errorId : undefined}
                    aria-required={required || undefined}
                    className={classnames(
                        'border-3 bg-papel rounded-[14px] px-[14px] py-[17px] text-lg leading-snug placeholder:text-appGray-400 resize-none h-[140px] transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-appAccent lg:px-7 lg:py-6 lg:text-base lg:leading-none lg:h-[224px]',
                        { 'border-red-500': error, 'border-monte': !error },
                    )}
                    onChange={handleChange}
                />
            ) : (
                <input
                    id={id}
                    value={value}
                    type={type}
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    aria-invalid={error || undefined}
                    aria-describedby={showError ? errorId : undefined}
                    aria-required={required || undefined}
                    className={classnames(
                        'border-3 bg-papel rounded-[14px] px-[14px] py-[15px] text-lg leading-none transition-colors duration-300 placeholder:text-appGray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-appAccent lg:px-7 lg:py-6 lg:text-base lg:leading-none',
                        { 'border-red-500': error, 'border-monte': !error },
                    )}
                    onChange={handleChange}
                />
            )}
            {showError && (
                <div
                    id={errorId}
                    role="alert"
                    className="text-xs text-red-600 mt-1 px-4 lg:text-sm"
                >
                    {errorMessage}
                </div>
            )}
        </div>
    );
};

export default FormText;
