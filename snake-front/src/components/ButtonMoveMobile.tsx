import React from "react";
import { Button } from 'antd';

interface IProps {
    type: "L" | "R" | "F"
    handleClick: Function
}

const ButtonMoveMobile: React.FC<IProps> = ({ type, handleClick }) => {

    return (
        <Button
            style={{
                border: "solid",
                width: 100,
                height: 100,
                borderWidth: 7,
                backgroundColor: "#80808029",
                borderColor: "#80808038",
                position: "absolute",
                bottom: 5,
                left: type === "L" ? 5 : (type === "F" ? "50%" : "initial"),
                right: type === "R" ? 5 : "initial",
                visibility: "visible",
                transform: type === "F" ? "translateX(-50%)" : "initial"
            }}
            type="ghost"
            shape="circle"
            onTouchStart={(e) => handleClick(e, type)}
            onTouchEnd={(e) => handleClick(e, type)}
        />
    )
}

export default ButtonMoveMobile;