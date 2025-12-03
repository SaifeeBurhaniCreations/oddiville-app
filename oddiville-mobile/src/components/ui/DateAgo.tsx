import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { formatDateAgo } from "@/src/utils/dateUtils";
import { B6 } from "@/src/components/typography/Typography";

const DateAgo = ({ createdAt, color }: { createdAt: Date, color: string }) => {
    const [timeAgo, setTimeAgo] = useState(formatDateAgo(new Date(createdAt)));

    useFocusEffect(
        React.useCallback(() => {
            setTimeAgo(formatDateAgo(new Date(createdAt)));
        }, [createdAt])
    );

    return <B6 color={color}>{timeAgo}</B6>;
};

export default DateAgo;
