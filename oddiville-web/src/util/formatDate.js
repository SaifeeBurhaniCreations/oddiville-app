export function formatDate(date) {
    if (!date) return '-';
    
    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return '-';
        
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Intl.DateTimeFormat('en-IN', options).format(dateObj);
    } catch (error) {
        return '-';
    }
}