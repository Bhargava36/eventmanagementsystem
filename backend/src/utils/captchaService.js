const crypto = require('crypto');
// In-memory challenge store; tokens expire after 5 minutes
const captchaStore = new Map();
const CAPTCHA_TTL_MS = 5 * 60 * 1000;
// Periodic cleanup of expired tokens
setInterval(() => {
    const now = Date.now();
    for (const [id, data] of captchaStore.entries()) {
        if (data.expiresAt < now) {
            captchaStore.delete(id);
        }
    }
}, 60000).unref();
// Generates an SVG CAPTCHA with distortion lines, random rotation, and noise to prevent automated form submissions.
// Adapts palette and background according to theme (light vs dark).
const generateCaptcha = (theme = 'dark') => {
    const isLight = (theme === 'light');
    const captchaId = crypto.randomUUID();
    const shortId = captchaId.slice(0, 8);
    // Characters chosen to avoid common visual confusion (0 vs O, 1 vs I/l)
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    const codeLength = 6;
    let code = '';
    for (let i = 0; i < codeLength; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    captchaStore.set(captchaId, {
        answer: code.toLowerCase(),
        expiresAt: Date.now() + CAPTCHA_TTL_MS
    });

    // Theme-specific speckle dots
    const dotFill = isLight ? '#059669' : '#34d399';
    const dots = [];
    const dotCount = Math.floor(Math.random() * 15) + 65;
    for (let i = 0; i < dotCount; i++) {
        const cx = Math.floor(Math.random() * 280);
        const cy = Math.floor(Math.random() * 60);
        const r = Math.random() > 0.65 ? 1.6 : 1.0;
        const opacity = isLight 
            ? (Math.random() * 0.35 + 0.15).toFixed(2)
            : (Math.random() * 0.45 + 0.25).toFixed(2);
        dots.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${dotFill}" opacity="${opacity}" />`);
    }

    // Sinusoidal strike curves running across text
    const y1 = Math.floor(Math.random() * 14) + 24;
    const y2 = Math.floor(Math.random() * 16) + 22;
    const y3 = Math.floor(Math.random() * 14) + 26;
    const curve1 = `M 2,${y1} Q 70,${y1 - 18} 140,${y1 + 15} T 278,${y2}`;
    const curve2 = `M 4,${y3} Q 80,${y3 + 16} 160,${y3 - 16} T 278,${y1}`;
    const curve3 = `M 8,${y2} Q 90,${y2 - 14} 180,${y2 + 14} T 276,${y3}`;

    // Diagonal interference lines
    const slashLines = [];
    const slashColor = isLight ? '#047857' : '#10b981';
    for (let i = 0; i < 7; i++) {
        const x1 = Math.floor(Math.random() * 50);
        const sy1 = Math.floor(Math.random() * 56) + 2;
        const x2 = Math.floor(Math.random() * 60) + 215;
        const sy2 = Math.floor(Math.random() * 56) + 2;
        const width = (Math.random() * 1.2 + 0.8).toFixed(1);
        const dash = i % 2 === 0 ? 'stroke-dasharray="5,3"' : '';
        slashLines.push(`<line x1="${x1}" y1="${sy1}" x2="${x2}" y2="${sy2}" stroke="${slashColor}" stroke-width="${width}" stroke-opacity="${isLight ? '0.35' : '0.45'}" ${dash} />`);
    }

    const darkColors = ['#34d399', '#10b981', '#6ee7b7', '#a7f3d0', '#059669', '#5eead4', '#ecfdf5'];
    const lightColors = ['#064e3b', '#047857', '#0f172a', '#1e293b', '#065f46', '#115e59', '#15803d', '#0369a1'];
    const colors = isLight ? lightColors : darkColors;

    const fontFamilies = [
        'Impact, Arial Black, sans-serif',
        'Georgia, serif',
        'Trebuchet MS, sans-serif',
        'Courier New, monospace',
        'Verdana, sans-serif'
    ];

    // Build glyphs with varied rotation, skew, and stroke styles
    const charElements = [];
    const startX = 20;
    const spacing = 41;
    for (let i = 0; i < code.length; i++) {
        const char = code[i];
        const x = startX + i * spacing + Math.floor(Math.random() * 8 - 4);
        const y = 43 + Math.floor(Math.random() * 12 - 6);
        const angle = Math.floor(Math.random() * 52 - 26);
        const skew = Math.floor(Math.random() * 26 - 13);
        const fontSize = Math.floor(Math.random() * 6) + 29;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const font = fontFamilies[Math.floor(Math.random() * fontFamilies.length)];
        const isOutlined = (i % 3 === 2);
        const strokeColor = isOutlined ? color : (isLight ? '#ffffff' : '#02140e');
        const strokeWidth = isOutlined ? '2.5' : (isLight ? '1.5' : '1.2');

        charElements.push(`
            <text
                x="${x}"
                y="${y}"
                fill="${isOutlined ? 'none' : color}"
                stroke="${strokeColor}"
                stroke-width="${strokeWidth}"
                font-size="${fontSize}"
                font-family="${font}"
                font-weight="900"
                transform="rotate(${angle}, ${x}, ${y}) skewX(${skew})"
                style="user-select:none;"
            >${char}</text>
        `);
    }

    const svgBgStyle = isLight
        ? 'border-radius: 12px; background: #f8fafc; border: 1.5px solid #cbd5e1; user-select: none; display: block;'
        : 'border-radius: 12px; background: #030806; border: 1.5px solid #064e3b; user-select: none; display: block;';

    const bgGradient = isLight
        ? `<linearGradient id="capBg_${shortId}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="50%" stop-color="#f0fdf4" />
            <stop offset="100%" stop-color="#f1f5f9" />
           </linearGradient>`
        : `<linearGradient id="capBg_${shortId}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#030806" />
            <stop offset="50%" stop-color="#021a12" />
            <stop offset="100%" stop-color="#010f0a" />
           </linearGradient>`;

    const matrixStroke = '#059669';
    const matrixOpacity = isLight ? '0.12' : '0.22';

    const curveColor1 = '#047857';
    const curveColor2 = isLight ? '#059669' : '#34d399';
    const curveColor3 = isLight ? '#0f172a' : '#10b981';

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="60" viewBox="0 0 280 60" preserveAspectRatio="none" style="${svgBgStyle}">
            <defs>
                ${bgGradient}
                <pattern id="matrixHatch_${shortId}" width="8" height="8" patternUnits="userSpaceOnUse">
                    <path d="M 8 0 L 0 8 M 0 0 L 8 8" fill="none" stroke="${matrixStroke}" stroke-width="0.35" stroke-opacity="${matrixOpacity}" />
                </pattern>
            </defs>
            <rect width="280" height="60" fill="url(#capBg_${shortId})" rx="12" />
            <rect width="280" height="60" fill="url(#matrixHatch_${shortId})" rx="12" />
            ${dots.join('')}
            <path d="${curve1}" fill="none" stroke="${curveColor1}" stroke-width="2.6" stroke-opacity="${isLight ? '0.50' : '0.65'}" />
            <g>${charElements.join('')}</g>
            <path d="${curve2}" fill="none" stroke="${curveColor2}" stroke-width="2.0" stroke-opacity="${isLight ? '0.45' : '0.60'}" />
            <path d="${curve3}" fill="none" stroke="${curveColor3}" stroke-width="1.8" stroke-opacity="${isLight ? '0.35' : '0.50'}" />
            ${slashLines.join('')}
        </svg>
    `.trim().replace(/\s+/g, ' ');
    return {
        captchaId,
        svg
    };
};
// Validates a submitted answer. Each challenge token is consumed once to prevent reuse.
const verifyCaptcha = (captchaId, submittedAnswer) => {
    if (!captchaId || !submittedAnswer) {
        return { valid: false, reason: 'Please enter the CAPTCHA code.' };
    }
    const record = captchaStore.get(captchaId);
    if (!record) {
        return { valid: false, reason: 'CAPTCHA code expired. Please click Refresh and try again.' };
    }
    // Prevent token reuse
    captchaStore.delete(captchaId);
    if (Date.now() > record.expiresAt) {
        return { valid: false, reason: 'CAPTCHA code has expired. Please refresh and try again.' };
    }
    const cleanInput = String(submittedAnswer).trim().toLowerCase().replace(/\s+/g, '');
    const cleanAnswer = record.answer.toLowerCase().replace(/\s+/g, '');
    if (cleanInput !== cleanAnswer) {
        return { valid: false, reason: 'Incorrect CAPTCHA code. Please check the characters and try again.' };
    }
    return { valid: true };
};
module.exports = {
    generateCaptcha,
    verifyCaptcha
};
