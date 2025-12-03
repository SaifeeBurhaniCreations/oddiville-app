import { RootStackParamList } from '../types/navigation';
import { useRouter } from "expo-router";


export enum TabScreens {
    Home = "home",
    Purchase = "purchase",
    Production = "production",
    Packaging = "packaging",
    Sales = "sales",
}


function isAdminTab(route: string): route is TabScreens {
    return Object.values(TabScreens).includes(route as TabScreens);
}

function getQuery(params?: Record<string, any>) {
    if (!params) return "";
    const search = Object.entries(params)
        .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
        .join("&");
    return search ? `?${search}` : "";
}


export function useAppNavigation() {
    const router = useRouter();


    function goTo(route: keyof RootStackParamList, params?: Record<string, any>) {
        if (isAdminTab(route)) {
            router.push((`/(tabs)/${route}${getQuery(params)}`) as any);
            return;
        }
        router.push((`${route}${getQuery(params)}`) as any);
    }


    function replaceWith(route: keyof RootStackParamList, params?: Record<string, any>) {
        if (isAdminTab(route)) {
            router.replace((`/(tabs)/${route}${getQuery(params)}`) as any);
            return;
        }
        router.replace((`${route}${getQuery(params)}`) as any);
    }


    function resetTo(route: keyof RootStackParamList, params?: Record<string, any>) {
        replaceWith(route, params);
    }


    return { goTo, replaceWith, resetTo };
}