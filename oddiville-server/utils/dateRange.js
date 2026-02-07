
const dayjs = require("dayjs");

function getDateRange(range, from, to) {
    const now = dayjs();

    if (range === "custom" && from && to) {
        return [new Date(from), new Date(to)];
    }

    switch (range) {
        case "today":
            return [now.startOf("day").toDate(), now.endOf("day").toDate()];

        case "this_week":
            return [now.startOf("week").toDate(), now.endOf("week").toDate()];

        case "last_week":
            return [
                now.subtract(1, "week").startOf("week").toDate(),
                now.subtract(1, "week").endOf("week").toDate(),
            ];

        case "this_month":
            return [now.startOf("month").toDate(), now.endOf("month").toDate()];

        case "last_month":
            return [
                now.subtract(1, "month").startOf("month").toDate(),
                now.subtract(1, "month").endOf("month").toDate(),
            ];

        default:
            return null;
    }
}

module.exports = getDateRange;