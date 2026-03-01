import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withTiming,
    Easing
} from 'react-native-reanimated';
import { RiskLevel } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { getRiskColor, getRiskLabel } from '../../utils/riskUtils';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface RiskGaugeProps {
    score: number;
    level: RiskLevel;
    size?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
    score,
    level,
    size = 200,
}) => {
    const { isDark, colors } = useTheme();
    const progress = useSharedValue(0);

    const strokeWidth = size * 0.12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const halfCircumference = circumference / 2;

    // Sweep is 180 degrees (half circle)
    // We want the gauge to go from -90 to +90 degrees

    useEffect(() => {
        progress.value = withTiming(score / 100, {
            duration: 1500,
            easing: Easing.out(Easing.exp),
        });
    }, [score]);

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = halfCircumference * (1 - progress.value);
        return {
            strokeDashoffset,
        };
    });

    const riskColor = getRiskColor(level, isDark);

    return (
        <View style={[styles.container, { width: size, height: size * 0.6 }]}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <G rotation="-180" origin={`${size / 2}, ${size / 2}`}>
                    {/* Background Arc */}
                    <Path
                        d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
                        stroke={colors.border}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                    />
                    {/* Foreground (Progress) Arc */}
                    <AnimatedPath
                        d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
                        stroke={riskColor}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${halfCircumference} ${halfCircumference}`}
                        animatedProps={animatedProps}
                    />
                </G>
            </Svg>
            <View style={[styles.content, { top: strokeWidth * 1.5 }]}>
                <Text style={[styles.scoreText, { color: colors.text }]}>{score}</Text>
                <Text style={[styles.levelText, { color: riskColor }]}>{getRiskLabel(level)}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'hidden',
    },
    content: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreText: {
        fontSize: 48,
        fontWeight: '800',
    },
    levelText: {
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 2,
        marginTop: -4,
    },
});
