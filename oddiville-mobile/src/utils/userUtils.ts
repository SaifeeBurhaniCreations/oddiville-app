export const validTagRole = (role: string) => {
    switch(role) {
        case "superadmin": 
        return true;
        case "admin": 
        return true;
        case "supervisor": 
        return true;
        case "user": 
        return false;
    }
}

export const isFabRoute = (route: string) => !["UserDetails", "RawMaterial", "SupervisorProductDetails", "SupervisorRmDetails", "SupervisorProductDetails", "SupervisorProductiionDetails", "SupervisorWorkerDetails", "Packaging", "PackagingDetails"].includes(route);
