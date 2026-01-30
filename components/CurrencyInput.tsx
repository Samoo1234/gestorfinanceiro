import React, { useState, useEffect, useRef } from 'react';

interface CurrencyInputProps {
    value: number | string;
    onChange: (value: number) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
    id?: string;
}

// Formata número para moeda brasileira
const formatToCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

// Extrai número de string formatada
const parseCurrency = (value: string): number => {
    // Remove tudo exceto números
    const numericValue = value.replace(/\D/g, '');
    // Converte para número (centavos) e divide por 100
    return parseInt(numericValue || '0', 10) / 100;
};

const CurrencyInput: React.FC<CurrencyInputProps> = ({
    value,
    onChange,
    placeholder = '0,00',
    required = false,
    className = '',
    id
}) => {
    const [displayValue, setDisplayValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Sincroniza valor externo com display
    useEffect(() => {
        const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
        if (numValue > 0) {
            setDisplayValue(formatToCurrency(numValue));
        } else {
            setDisplayValue('');
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const numericValue = parseCurrency(rawValue);

        // Atualiza display
        if (numericValue > 0) {
            setDisplayValue(formatToCurrency(numericValue));
        } else {
            setDisplayValue('');
        }

        // Propaga mudança
        onChange(numericValue);
    };

    const handleFocus = () => {
        // Seleciona todo o texto ao focar
        setTimeout(() => {
            inputRef.current?.select();
        }, 0);
    };

    return (
        <input
            ref={inputRef}
            id={id}
            type="text"
            inputMode="numeric"
            required={required}
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder={placeholder}
            className={className}
        />
    );
};

export default CurrencyInput;
