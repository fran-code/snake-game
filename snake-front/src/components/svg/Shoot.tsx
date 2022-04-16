import React from "react";

interface IProps {
    firstPoint: {
        x: number,
        y: number
    }
    secondPoint: {
        x: number,
        y: number
    }
    thirdPoint: {
        x: number,
        y: number
    }
    weaponClass: number
}

const Shoot: React.FC<IProps> = ({ weaponClass, firstPoint, secondPoint, thirdPoint }) => {
    return (
        <>
            <defs>
                {[5, 6, 7].includes(weaponClass) ?
                    <linearGradient id="linear-gradient">
                        <stop offset="0%" stopColor="#dcdcdc" stopOpacity="30%" />
                        <stop offset="50%" stopColor="#888888" stopOpacity="41%" />
                        <stop offset="100%" stopColor="#464646" stopOpacity="85%" />
                    </linearGradient>
                    :
                    <linearGradient id="linear-gradient">
                        <stop offset="0%" stopColor="#d3e5fb" stopOpacity="30%" />
                        <stop offset="50%" stopColor="#63a0ea" stopOpacity="41%" />
                        <stop offset="100%" stopColor="#0971f1" stopOpacity="85%" />
                    </linearGradient>
                }
            </defs>
            <polygon
                points={`${firstPoint.x},${firstPoint.y} ${secondPoint.x},${secondPoint.y} ${thirdPoint.x},${thirdPoint.y}`}
                fill="url(#linear-gradient)"
            />
        </>
    )
}

export default Shoot;