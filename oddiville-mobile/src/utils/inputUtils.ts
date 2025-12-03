export function getPlaceholder(placeholder: string | undefined, chamber: string | undefined) {
    if(!placeholder && !chamber) return "Select";
    if(!chamber) return placeholder;
    return chamber;
    
}