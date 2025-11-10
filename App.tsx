
import React from 'react';
import GeneralChat from './components/GeneralChat';
import { SettingsProvider } from './context/SettingsContext';
import ThemeProvider from './context/ThemeContext';

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <SettingsProvider>
                <GeneralChat />
            </SettingsProvider>
        </ThemeProvider>
    );
};

export default App;