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
const generateCaptcha = () => {
    const captchaId = crypto.randomUUID();
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
    // Random speckles across the canvas
    const dots = [];
    const dotCount = Math.floor(Math.random() * 15) + 65;
    for (let i = 0; i < dotCount; i++) {
        const cx = Math.floor(Math.random() * 280);
        const cy = Math.floor(Math.random() * 60);
        const r = Math.random() > 0.65 ? 1.6 : 1.0;
        const opacity = (Math.random() * 0.45 + 0.25).toFixed(2);
        dots.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#34d399" opacity="${opacity}" />`);
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
    for (let i = 0; i < 7; i++) {
        const x1 = Math.floor(Math.random() * 50);
        const sy1 = Math.floor(Math.random() * 56) + 2;
        const x2 = Math.floor(Math.random() * 60) + 215;
        const sy2 = Math.floor(Math.random() * 56) + 2;
        const width = (Math.random() * 1.2 + 0.8).toFixed(1);
        const dash = i % 2 === 0 ? 'stroke-dasharray="5,3"' : '';
        slashLines.push(`<line x1="${x1}" y1="${sy1}" x2="${x2}" y2="${sy2}" stroke="#10b981" stroke-width="${width}" stroke-opacity="0.45" ${dash} />`);
    }
    const colors = ['#34d399', '#10b981', '#6ee7b7', '#a7f3d0', '#059669', '#5eead4', '#ecfdf5'];
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
        charElements.push(`
            <text
                x="${x}"
                y="${y}"
                fill="${isOutlined ? 'none' : color}"
                stroke="${isOutlined ? color : '#02140e'}"
                stroke-width="${isOutlined ? '2.5' : '1.2'}"
                font-size="${fontSize}"
                font-family="${font}"
                font-weight="900"
                transform="rotate(${angle}, ${x}, ${y}) skewX(${skew})"
                style="user-select:none;"
            >${char}</text>
        `);
    }
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="60" viewBox="0 0 280 60" preserveAspectRatio="none" style="border-radius: 12px; background: #030806; border: 1.5px solid #064e3b; user-select: none; display: block;">
            <defs>
                <linearGradient id="capBgDeep" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#030806" />
                    <stop offset="50%" stop-color="#021a12" />
                    <stop offset="100%" stop-color="#010f0a" />
                </linearGradient>
                <pattern id="matrixHatch" width="8" height="8" patternUnits="userSpaceOnUse">
                    <path d="M 8 0 L 0 8 M 0 0 L 8 8" fill="none" stroke="#059669" stroke-width="0.35" stroke-opacity="0.22" />
                </pattern>
            </defs>
            <rect width="280" height="60" fill="url(#capBgDeep)" rx="12" />
            <rect width="280" height="60" fill="url(#matrixHatch)" rx="12" />
            ${dots.join('')}
            <path d="${curve1}" fill="none" stroke="#047857" stroke-width="2.6" stroke-opacity="0.65" />
            <g>${charElements.join('')}</g>
            <path d="${curve2}" fill="none" stroke="#34d399" stroke-width="2.0" stroke-opacity="0.6" />
            <path d="${curve3}" fill="none" stroke="#10b981" stroke-width="1.8" stroke-opacity="0.5" />
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
