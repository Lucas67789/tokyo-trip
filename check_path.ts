import { findMultipleRoutes } from './src/lib/pathfinder';
import { METRO_STATIONS } from './src/lib/metro_data';

const routes = findMultipleRoutes('nrt', 'shinjuku');
console.log(JSON.stringify(routes, null, 2));
