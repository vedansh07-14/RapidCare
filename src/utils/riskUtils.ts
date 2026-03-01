import { RiskLevel, Priority } from '../types';
import { Colors } from '../constants/colors';

export function getRiskColor(level: RiskLevel, isDark = false): string {
    const theme = isDark ? Colors.dark : Colors.light;
    return theme[level] || theme.low;
}

export function getRiskBgColor(level: RiskLevel, isDark = false): string {
    const theme = isDark ? Colors.dark : Colors.light;
    // @ts-ignore
    return theme[`${level}Bg`] || theme.lowBg;
}

export function getRiskLabel(level: RiskLevel): string {
    switch (level) {
        case 'critical': return 'CRITICAL';
        case 'high': return 'HIGH';
        case 'medium': return 'MEDIUM';
        case 'low': return 'LOW';
        case 'safe': return 'SAFE';
        default: return 'UNKNOWN';
    }
}

export function getRiskIcon(level: RiskLevel): string {
    switch (level) {
        case 'critical': return 'alert-decagram';
        case 'high': return 'alert-circle';
        case 'medium': return 'alert';
        case 'low': return 'information';
        case 'safe': return 'check-circle';
        default: return 'help-circle';
    }
}

export function getPriorityColor(priority: Priority, isDark = false): string {
    const theme = isDark ? Colors.dark : Colors.light;
    switch (priority) {
        case 'immediate': return theme.critical;
        case 'urgent': return theme.high;
        case 'delayed': return theme.medium;
        case 'minimal': return theme.low;
        case 'expectant': return theme.textSecondary;
        default: return theme.textSecondary;
    }
}

export function scoreToRiskLevel(score: number): RiskLevel {
    if (score >= 90) return 'critical';
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    if (score >= 10) return 'low';
    return 'safe';
}
