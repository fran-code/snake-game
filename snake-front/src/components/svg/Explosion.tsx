import React from "react";

interface IProps {
    position: {
        x: number,
        y: number
    }
    radius: number,
    color: string
}

const Explosion: React.FC<IProps> = ({ position, radius }) => {
    return (
        <>
            <defs>
                <radialGradient id="radial-gradient">
                    <stop offset="0%" stopColor="#FFF76B" stopOpacity="30%" />
                    <stop offset="50%" stopColor="#FFF845" stopOpacity="41%" />
                    <stop offset="100%" stopColor="#FB8933" stopOpacity="85%" />
                </radialGradient>
            </defs>
            <circle
                cx={position.x}
                cy={position.y}
                r={radius}
                fill="url(#radial-gradient)"
            />
        </>
    )
}

export default Explosion;