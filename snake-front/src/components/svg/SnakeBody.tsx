import React from "react";

interface IProps {
    snake: {
        x: number,
        y: number
    }
    radius: number,
    color: string
}

const SnakeBody: React.FC<IProps> = ({ snake, radius, color }) => {
    return (
        <circle
            cx={snake.x}
            cy={snake.y}
            r={radius}
            style={{
                fill: color,
                fillOpacity: 1
            }}
        />
    )
}

export default SnakeBody;