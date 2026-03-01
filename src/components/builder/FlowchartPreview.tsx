import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, G } from 'react-native-svg';
import { Flowchart, FlowNode } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { computeLayout } from '../../utils/layoutUtils';
import { getRiskColor } from '../../utils/riskUtils';

interface FlowchartPreviewProps {
    flowchart: Flowchart;
    width?: number;
    height?: number;
}

export const FlowchartPreview: React.FC<FlowchartPreviewProps> = ({
    flowchart,
    width = 100,
    height = 100,
}) => {
    const { isDark, colors } = useTheme();

    const layout = useMemo(() => {
        return computeLayout(flowchart.nodes, flowchart.startNodeId, 20, 20, 20, 30);
    }, [flowchart]);

    const nodes = Object.values(flowchart.nodes);

    // Calculate bounding box and scale
    const maxX = Math.max(...Object.values(layout).map(l => l.x), 50);
    const minX = Math.min(...Object.values(layout).map(l => l.x), -50);
    const maxY = Math.max(...Object.values(layout).map(l => l.y), 50);
    const minY = Math.min(...Object.values(layout).map(l => l.y), 0);

    const viewWidth = maxX - minX + 40;
    const viewHeight = maxY - minY + 40;
    const centerX = (maxX + minX) / 2;
    const centerY = (maxY + minY) / 2;

    const viewBox = `${centerX - viewWidth / 2} ${centerY - viewHeight / 2} ${viewWidth} ${viewHeight}`;

    return (
        <View style={[styles.container, { width, height }]}>
            <Svg width="100%" height="100%" viewBox={viewBox}>
                <G>
                    {/* Draw Edges first */}
                    {nodes.map(node => (
                        node.options && node.options.map(option => {
                            const start = layout[node.id];
                            const end = layout[option.targetNodeId];
                            if (!start || !end) return null;
                            return (
                                <Line
                                    key={`edge-${node.id}-${option.id}`}
                                    x1={start.x}
                                    y1={start.y}
                                    x2={end.x}
                                    y2={end.y}
                                    stroke={colors.border}
                                    strokeWidth="1.5"
                                />
                            );
                        })
                    ))}

                    {/* Draw Nodes */}
                    {nodes.map(node => {
                        const pos = layout[node.id];
                        if (!pos) return null;

                        let color = colors.primary;
                        if (node.type === 'start') color = colors.start;
                        else if (node.type === 'end') color = getRiskColor(node.riskLevel || 'low', isDark);

                        return (
                            <Circle
                                key={`node-${node.id}`}
                                cx={pos.x}
                                cy={pos.y}
                                r="8"
                                fill={color}
                            />
                        );
                    })}
                </G>
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
