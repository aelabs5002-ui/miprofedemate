import React, { useState, useEffect } from 'react';

type MathKeyboardProps = {
    inputRef: React.RefObject<HTMLInputElement>;
    visible: boolean;
    onEnter: () => void;
    enabledLayers?: number[];
    onClose?: () => void;
};

const LAYERS = {
    0: { icon: '🔢', label: 'NÚMEROS', sub: '+ − × ÷ ( )', keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', '-', '+', '×', '÷', '=', '(', ')', 'BACKSPACE', 'ENTER'] },
    1: { icon: '⚖️', label: 'COMPARAR', sub: '< > ≤ ≥ ≠', keys: ['<', '>', '≤', '≥', '≠', '≈', '∞', 'BACKSPACE', 'ENTER'] },
    2: { icon: '✖️', label: 'ÁLGEBRA', sub: 'x y z  ^  √', keys: ['x', 'y', 'z', 'a', 'b', 'c', '^', '√', 'π', 'BACKSPACE', 'ENTER'] },
    3: { icon: '🍕', label: 'FRACCIONES', sub: '1/2 1/3 %', keys: ['/', '%', 'BACKSPACE', 'ENTER'] },
    4: { icon: '📐', label: 'TRIG', sub: 'sin cos tan π', keys: ['sin(', 'cos(', 'tan(', 'BACKSPACE', 'ENTER'] },
    5: { icon: 'ƒ', label: 'FUNC', sub: 'f(x) log ln', keys: ['f(x)', 'g(x)', 'MCM(', 'MCD(', 'BACKSPACE', 'ENTER'] },
};

const MathKeyboard: React.FC<MathKeyboardProps> = ({ inputRef, visible, onEnter, enabledLayers, onClose }) => {
    const [activeLayer, setActiveLayer] = useState(0);
    const [isVisibleState, setIsVisibleState] = useState(visible);

    // Sync internal state with prop
    useEffect(() => {
        setIsVisibleState(visible);
    }, [visible]);

    if (!isVisibleState) return null;

    const handleKeyPress = (key: string) => {
        if (!inputRef.current) return;

        const input = inputRef.current;

        // Focus input (essential for maintaining selection range)
        input.focus();

        if (key === 'ENTER') {
            onEnter();
            return;
        }

        if (key === 'BACKSPACE') {
            const start = input.selectionStart || 0;
            const end = input.selectionEnd || 0;
            const value = input.value;

            if (start !== end) {
                // Remove selection
                const newValue = value.slice(0, start) + value.slice(end);
                setValueAndCursor(input, newValue, start);
            } else if (start > 0) {
                // Remove char before cursor
                const newValue = value.slice(0, start - 1) + value.slice(start);
                setValueAndCursor(input, newValue, start - 1);
            }
            return;
        }

        // Insert text
        let textToInsert = key;
        if (key === '√') textToInsert = '√(';
        if (key === 'f(x)') textToInsert = 'f(';
        if (key === 'g(x)') textToInsert = 'g(';

        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const value = input.value;

        // Replace selection or insert at cursor
        const newValue = value.slice(0, start) + textToInsert + value.slice(end);
        setValueAndCursor(input, newValue, start + textToInsert.length);
    };

    // Helper to update value and cursor position safely (React 18 / DOM sync)
    const setValueAndCursor = (input: HTMLInputElement, newValue: string, newCursorPos: number) => {
        // Standard DOM update
        input.value = newValue;

        // Trigger React onChange manually so state updates
        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);

        // Restore cursor position after the update cycle
        requestAnimationFrame(() => {
            input.setSelectionRange(newCursorPos, newCursorPos);
            input.focus();
        });
    };

    const layersToShow = enabledLayers || [0, 1, 2, 3, 4, 5];
    const currentLayerInfo = LAYERS[activeLayer as keyof typeof LAYERS];

    return (
        <div style={styles.keyboardContainer}>
            {/* Header Tabs Area */}
            <div style={styles.headerArea}>
                {onClose && (
                    <button style={styles.closeButtonAbsolute} onMouseDown={(e) => { e.preventDefault(); onClose(); }}>
                        ✕
                    </button>
                )}

                <div style={styles.tabsGrid}>
                    {layersToShow.map((layerId) => {
                        const info = LAYERS[layerId as keyof typeof LAYERS];
                        const isActive = activeLayer === layerId;
                        return (
                            <button
                                key={layerId}
                                style={{
                                    ...styles.tabPill,
                                    backgroundColor: isActive ? 'rgba(0, 254, 156, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                    borderColor: isActive ? '#00FE9C' : 'transparent',
                                    boxShadow: isActive ? '0 0 10px rgba(0, 254, 156, 0.2)' : 'none',
                                }}
                                onMouseDown={(e) => { e.preventDefault(); setActiveLayer(layerId); }}
                            >
                                <span style={{ fontSize: '18px', marginBottom: '2px' }}>{info.icon}</span>
                                <div style={styles.tabTexts}>
                                    <span style={{
                                        fontWeight: 'bold',
                                        fontSize: '13px',
                                        color: isActive ? '#00FE9C' : '#F0F2F3'
                                    }}>
                                        {info.label}
                                    </span>
                                    <span style={styles.tabSubtext}>{info.sub}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Context Line */}
            <div style={styles.contextLine}>
                <span style={{ marginRight: '8px' }}>{currentLayerInfo.icon}</span>
                <span style={{ color: '#00FE9C', fontWeight: 'bold' }}>{currentLayerInfo.label}</span>
                <span style={{ margin: '0 8px', opacity: 0.4 }}>—</span>
                <span style={{ opacity: 0.7, fontSize: '12px', color: '#9C9FA7' }}>{currentLayerInfo.sub}</span>
            </div>

            {/* Keys Grid */}
            <div style={styles.keysGrid}>
                {currentLayerInfo.keys.map((key) => (
                    <button
                        key={key}
                        style={{
                            ...styles.keyButton,
                            ...(key === 'ENTER' ? styles.enterButton : {}),
                            ...(key === 'BACKSPACE' ? styles.backspaceButton : {}),
                        }}
                        onMouseDown={(e) => {
                            e.preventDefault(); // CRITICAL: Stop input blur
                            handleKeyPress(key);
                        }}
                    >
                        {key === 'BACKSPACE' ? '⌫' : key === 'ENTER' ? '↵' : key}
                    </button>
                ))}
            </div>
        </div>
    );
};

const styles = {
    keyboardContainer: {
        position: 'fixed' as const,
        bottom: 0,
        left: 0,
        right: 0,
        height: '45vh', // Increased slightly for tabs
        backgroundColor: '#0A1525', // Mission Dark Navy
        borderTop: '1px solid #00FE9C',
        display: 'flex',
        flexDirection: 'column' as const,
        zIndex: 9999,
        paddingBottom: '20px',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.8)',
        fontFamily: 'sans-serif',
    },
    headerArea: {
        padding: '12px',
        backgroundColor: '#08101D',
        borderBottom: '1px solid rgba(0, 254, 156, 0.1)',
        position: 'relative' as const,
    },
    closeButtonAbsolute: {
        position: 'absolute' as const,
        top: '8px',
        right: '8px',
        width: '24px',
        height: '24px',
        background: 'rgba(255, 255, 255, 0.1)',
        border: 'none',
        borderRadius: '50%',
        color: '#F0F2F3',
        fontSize: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    tabsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr', // Mobile first: 2 cols
        gap: '8px',
        maxWidth: '600px',
        margin: '0 auto',
    },
    tabPill: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 12px',
        borderRadius: '12px',
        border: '1px solid transparent',
        cursor: 'pointer',
        textAlign: 'left' as const,
        transition: 'all 0.2s',
        minHeight: '52px',
    },
    tabTexts: {
        display: 'flex',
        flexDirection: 'column' as const,
    },
    tabSubtext: {
        fontSize: '10px',
        color: '#9C9FA7',
        marginTop: '2px',
    },
    contextLine: {
        padding: '8px 16px',
        fontSize: '12px',
        color: '#F0F2F3',
        backgroundColor: 'rgba(0, 254, 156, 0.03)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    keysGrid: {
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '8px',
        padding: '12px',
        overflowY: 'auto' as const,
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
    },
    keyButton: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '12px',
        color: '#F0F2F3',
        fontSize: '20px',
        fontWeight: '500' as const,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '48px',
        boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
        transition: 'transform 0.1s',
    },
    enterButton: {
        backgroundColor: '#00FE9C',
        color: '#08101D',
        gridColumn: 'span 1',
        fontWeight: 'bold' as const,
        boxShadow: '0 4px 10px rgba(0, 254, 156, 0.3)',
    },
    backspaceButton: {
        backgroundColor: 'rgba(255, 99, 99, 0.2)',
        color: '#FF6B6B',
        border: '1px solid rgba(255, 99, 99, 0.3)',
    }
};

export default MathKeyboard;
