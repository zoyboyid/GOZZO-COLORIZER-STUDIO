/**
 * GOZZO COLORIZER STUDIO - Color Engine Module
 * Handles RGB/HEX/HSL conversions, color interpolation, and gaming export code generation.
 */

const ColorEngine = {
    hexToRgb(hex) {
        let cleanHex = hex.replace('#', '');
        if (cleanHex.length === 3) {
            cleanHex = cleanHex.split('').map(c => c + c).join('');
        }
        let bigint = parseInt(cleanHex, 16);
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    },

    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            let hex = Math.min(255, Math.max(0, Math.round(x))).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    },

    hslToRgb(h, s, l) {
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    },

    interpolateColor(color1, color2, factor) {
        return [
            color1[0] + factor * (color2[0] - color1[0]),
            color1[1] + factor * (color2[1] - color1[1]),
            color1[2] + factor * (color2[2] - color1[2])
        ];
    },

    getColorForIndex(i, total, mode, solidColor, gradientStart, gradientEnd) {
        if (total <= 1) total = 2;
        if (mode === 'Solid') {
            return this.hexToRgb(solidColor);
        } else if (mode === 'Gradient') {
            const c1 = this.hexToRgb(gradientStart);
            const c2 = this.hexToRgb(gradientEnd);
            let factor = i / (total - 1);
            return this.interpolateColor(c1, c2, factor);
        } else if (mode === 'Pelangi') {
            let hue = (i / total) * 360;
            return this.hslToRgb((hue % 360) / 360, 1.0, 0.6);
        }
        return [255, 255, 255];
    },

    generateOutputCode(text, mode, format, solidColor, gradientStart, gradientEnd) {
        if (!text) return '';
        const lines = text.split('\n');
        const totalChars = text.length;
        let globalCharIndex = 0;
        let rawOutput = '';

        if (format === 'ONCE HUMAN') {
            if (mode === 'Solid') {
                let hexCode = solidColor.replace('#', '');
                let outputLines = [];
                for (let l = 0; l < lines.length; l++) {
                    outputLines.push(l === 0 ? '#c' + hexCode + lines[l] : lines[l]);
                }
                rawOutput = outputLines.join('\n');
            } else {
                let outputLines = [];
                for (let l = 0; l < lines.length; l++) {
                    let line = lines[l];
                    if (line.length === 0) {
                        outputLines.push('');
                        globalCharIndex += 1;
                        continue;
                    }
                    let lineOutput = '';
                    const chunkSize = 15;
                    for (let i = 0; i < line.length; i += chunkSize) {
                        let chunk = line.substr(i, chunkSize);
                        let rgb = this.getColorForIndex(globalCharIndex + i, totalChars, mode, solidColor, gradientStart, gradientEnd);
                        let hexFull = this.rgbToHex(rgb[0], rgb[1], rgb[2]);
                        lineOutput += '#c' + hexFull.replace('#', '') + chunk;
                    }
                    outputLines.push(lineOutput);
                    globalCharIndex += line.length + 1;
                }
                rawOutput = outputLines.join('\n');
            }
        } else if (format === 'Minecraft') {
            if (mode === 'Solid') {
                let hexCode = solidColor.replace('#', '');
                let outputLines = [];
                for (let l = 0; l < lines.length; l++) {
                    outputLines.push(l === 0 ? '§c' + hexCode + lines[l] : lines[l]);
                }
                rawOutput = outputLines.join('\n');
            } else {
                let outputLines = [];
                for (let l = 0; l < lines.length; l++) {
                    let line = lines[l];
                    let lineOutput = '';
                    for (let i = 0; i < line.length; i++) {
                        let rgb = this.getColorForIndex(globalCharIndex, totalChars, mode, solidColor, gradientStart, gradientEnd);
                        let hexCode = this.rgbToHex(rgb[0], rgb[1], rgb[2]).replace('#', '');
                        lineOutput += '§c' + hexCode + line[i];
                        globalCharIndex++;
                    }
                    outputLines.push(lineOutput);
                    globalCharIndex++;
                }
                rawOutput = outputLines.join('\n');
            }
        } else if (format === 'HTML') {
            if (mode === 'Solid') {
                let outputLines = [];
                for (let l = 0; l < lines.length; l++) {
                    outputLines.push(l === 0 && lines[l].length > 0 ? '<span style="color:' + solidColor + '">' + lines[l] + '</span>' : lines[l]);
                }
                rawOutput = outputLines.join('\n');
            } else {
                let outputLines = [];
                for (let l = 0; l < lines.length; l++) {
                    let line = lines[l];
                    let lineOutput = '';
                    for (let i = 0; i < line.length; i++) {
                        let rgb = this.getColorForIndex(globalCharIndex, totalChars, mode, solidColor, gradientStart, gradientEnd);
                        let hex = this.rgbToHex(rgb[0], rgb[1], rgb[2]);
                        lineOutput += '<span style="color:' + hex + '">' + line[i] + '</span>';
                        globalCharIndex++;
                    }
                    outputLines.push(lineOutput);
                    globalCharIndex++;
                }
                rawOutput = outputLines.join('\n');
            }
        }

        return rawOutput;
    }
};
