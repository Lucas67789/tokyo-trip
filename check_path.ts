import { findMultipleRoutes } from './src/lib/pathfinder';
import { METRO_STATIONS } from './src/lib/metro_data';

const routes = findMultipleRoutes('kix', 'namba');
console.log(JSON.stringify(routes, null, 2));
