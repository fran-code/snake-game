import React from "react";

interface IProps {
    position: {
        x: number,
        y: number
    }
    radius: number,
    color: string
}

const PaintCircle: React.FC<IProps> = ({ position, radius, color }) => {
    return (
        <circle
            cx={position.x}
            cy={position.y}
            r={radius}
            style={{
                fill: color,
                fillOpacity: 1,
            }}
        />
    )
}

export default PaintCircle;