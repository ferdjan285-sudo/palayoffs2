import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('palayoffs_theme') || 'light';
    });

    const applyTheme = (nextTheme) => {
        // Temporarily disable CSS transitions during theme switch to prevent whitening outlines and color flash
        const css = document.createElement('style');
        css.type = 'text/css';
        css.appendChild(
            document.createTextNode(
                `* {
                   -webkit-transition: none !important;
                   -moz-transition: none !important;
                   -o-transition: none !important;
                   -ms-transition: none !important;
                   transition: none !important;
                }`
            )
        );
        document.head.appendChild(css);

        const root = document.documentElement;
        if (nextTheme === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            root.classList.remove('dark');
            root.classList.add('light');
        }
        localStorage.setItem('palayoffs_theme', nextTheme);

        // Force reflow and remove temporary stylesheet
        const _ = window.getComputedStyle(css).opacity;
        requestAnimationFrame(() => {
            setTimeout(() => {
                if (document.head.contains(css)) {
                    document.head.removeChild(css);
                }
            }, 30);
        });
    };

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
