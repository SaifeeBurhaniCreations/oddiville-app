export function formatDate(date) {
    if (!date) return '-';
    
    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return '-';
        
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Intl.DateTimeFormat('en-US', options).format(dateObj);
    } catch (error) {
        return '-';
    }
}
