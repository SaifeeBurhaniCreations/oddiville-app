import { useRoute } from "@react-navigation/native";
import { RootStackParamList } from "@/src/types";

export function useParams<
  RouteName extends keyof RootStackParamList,
  ParamNames extends (keyof RootStackParamList[RouteName])[]
>(
  routeName: RouteName,
  ...paramNames: ParamNames
): { [K in ParamNames[number]]: RootStackParamList[RouteName][K] | undefined } {
  const route = useRoute();
  const params = (route.params || {}) as Partial<RootStackParamList[RouteName]>;

  const selectedParams = {} as {
    [K in ParamNames[number]]: RootStackParamList[RouteName][K] | undefined;
  };

  paramNames.forEach((name) => {
    selectedParams[name] = params[name];
  });

  return selectedParams;
}
