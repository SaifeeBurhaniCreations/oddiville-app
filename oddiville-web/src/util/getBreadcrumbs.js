import { routeLabels } from "../components/routeLabels";

export function getBreadcrumbs(pathname) {
  const found = routeLabels.find(r => r.match.test(pathname));
  return found ? found.crumbs : ["Home"];
}