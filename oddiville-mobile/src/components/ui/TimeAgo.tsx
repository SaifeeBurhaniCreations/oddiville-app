import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { formatTimeAgo } from "@/src/utils/dateUtils";
import { B6 } from "@/src/components/typography/Typography";

const TimeAgo = ({ createdAt, color }: { createdAt: Date, color: string }) => {
    const [timeAgo, setTimeAgo] = useState(formatTimeAgo(new Date(createdAt)));

    useFocusEffect(
        React.useCallback(() => {
            setTimeAgo(formatTimeAgo(new Date(createdAt)));
        }, [createdAt])
    );

    return <B6 color={color}>{timeAgo}</B6>;
};

export default TimeAgo;
