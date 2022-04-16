import React from "react";

interface IProps {
    snakeBody: string,
    color: string
}

const SnakePoly: React.FC<IProps> = ({ snakeBody, color }) => {
    return (
        <path d={snakeBody} fill="none" stroke={color} strokeWidth={3} />
    )
}

export default SnakePoly;