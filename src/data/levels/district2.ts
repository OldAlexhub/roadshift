import { LevelDef, RoadType } from '../../types/game';
import { buildGridMap, N } from '../mapBuilder';

const cong12: [string, string, RoadType][] = [[N(2,1), N(2,2), 'congested'], [N(2,2), N(2,3), 'congested']];
const cong34: [string, string, RoadType][] = [[N(1,3), N(2,3), 'congested'], [N(3,3), N(3,4), 'congested']];

const map6x6a = buildGridMap(6, 6, [], [], cong12);
const map6x6b = buildGridMap(6, 6, [], [[N(3,2), N(3,3)]], cong34);
const map6x6c = buildGridMap(6, 6, [], [],
  [[N(0,2), N(0,3), 'fast' as const], [N(1,2), N(1,3), 'fast' as const],
   [N(4,1), N(4,2), 'congested' as const], [N(4,2), N(4,3), 'congested' as const]]);
const map6x6d = buildGridMap(6, 6, [], [[N(2,3), N(3,3)], [N(2,4), N(3,4)]],
  [[N(2,2), N(3,2), 'congested' as const], [N(1,4), N(2,4), 'fast' as const]]);
const map7x6  = buildGridMap(7, 6, [], [],
  [[N(3,2), N(3,3), 'congested' as const], [N(3,1), N(3,2), 'congested' as const],
   [N(0,3), N(0,4), 'fast' as const], [N(1,3), N(1,4), 'fast' as const]]);

export const district2Levels: LevelDef[] = [
  {
    id: 11, districtId: 2,
    name: 'Downtown Entry',
    description: 'Welcome to downtown. Congested streets slow you down. Route around them.',
    objective: 'Deliver three riders while avoiding the congested corridor.',
    cityMap: map6x6a,
    vehicles: [
      { id: 'v1', type: 'city_van',    startNodeId: N(0,0) },
      { id: 'v2', type: 'compact_cab', startNodeId: N(0,5) },
    ],
    riders: [
      { id: 'r1', type: 'standard', pickupNodeId: N(1,0), dropoffNodeId: N(4,5), capacityUsed: 1 },
      { id: 'r2', type: 'standard', pickupNodeId: N(0,3), dropoffNodeId: N(5,2), capacityUsed: 1 },
      { id: 'r3', type: 'standard', pickupNodeId: N(3,5), dropoffNodeId: N(5,0), capacityUsed: 1 },
    ],
    optimalCost: 14, twoStarCostCeiling: 20, threeStarCostCeiling: 17,
  },
  {
    id: 12, districtId: 2,
    name: 'Capacity Push',
    description: 'The shuttle can carry three. Load it wisely.',
    objective: 'Use the shuttle capacity to handle a surge.',
    cityMap: map6x6a,
    vehicles: [
      { id: 'v1', type: 'shuttle',     startNodeId: N(0,0) },
      { id: 'v2', type: 'compact_cab', startNodeId: N(5,5) },
    ],
    riders: [
      { id: 'r1', type: 'standard', pickupNodeId: N(1,1), dropoffNodeId: N(5,2), capacityUsed: 1 },
      { id: 'r2', type: 'standard', pickupNodeId: N(1,3), dropoffNodeId: N(5,4), capacityUsed: 1 },
      { id: 'r3', type: 'standard', pickupNodeId: N(2,0), dropoffNodeId: N(4,3), capacityUsed: 1 },
      { id: 'r4', type: 'priority', pickupNodeId: N(4,5), dropoffNodeId: N(0,3), deadline: 320, capacityUsed: 1 },
    ],
    optimalCost: 16, twoStarCostCeiling: 22, threeStarCostCeiling: 19,
  },
  {
    id: 13, districtId: 2,
    name: 'Deadline Rush',
    description: 'Two priority riders, tight deadlines. The clock is your real enemy.',
    objective: 'Get both priority riders delivered on time.',
    cityMap: map6x6b,
    vehicles: [
      { id: 'v1', type: 'compact_cab', startNodeId: N(0,0) },
      { id: 'v2', type: 'compact_cab', startNodeId: N(0,5) },
    ],
    riders: [
      { id: 'r1', type: 'priority', pickupNodeId: N(1,1), dropoffNodeId: N(5,4), deadline: 300, capacityUsed: 1 },
      { id: 'r2', type: 'priority', pickupNodeId: N(1,4), dropoffNodeId: N(5,1), deadline: 280, capacityUsed: 1 },
    ],
    optimalCost: 9, twoStarCostCeiling: 13, threeStarCostCeiling: 11,
  },
  {
    id: 14, districtId: 2,
    name: 'Fast Lanes',
    description: 'Use the fast connectors to beat the congestion across downtown.',
    objective: 'Route efficiently through fast streets.',
    cityMap: map6x6c,
    vehicles: [
      { id: 'v1', type: 'city_van',    startNodeId: N(0,0) },
      { id: 'v2', type: 'compact_cab', startNodeId: N(5,5) },
    ],
    riders: [
      { id: 'r1', type: 'standard', pickupNodeId: N(0,1), dropoffNodeId: N(5,3), capacityUsed: 1 },
      { id: 'r2', type: 'standard', pickupNodeId: N(2,5), dropoffNodeId: N(3,0), capacityUsed: 1 },
      { id: 'r3', type: 'priority', pickupNodeId: N(0,4), dropoffNodeId: N(5,1), deadline: 350, capacityUsed: 1 },
    ],
    optimalCost: 13, twoStarCostCeiling: 18, threeStarCostCeiling: 15,
  },
  {
    id: 15, districtId: 2,
    name: 'Blocked Path',
    description: 'A section of road is closed. Find the detour that keeps trips on schedule.',
    objective: 'Reroute around closures and serve all riders.',
    cityMap: map6x6d,
    vehicles: [
      { id: 'v1', type: 'compact_cab', startNodeId: N(0,0) },
      { id: 'v2', type: 'city_van',    startNodeId: N(6,5) },
    ],
    riders: [
      { id: 'r1', type: 'standard', pickupNodeId: N(1,0), dropoffNodeId: N(5,5), capacityUsed: 1 },
      { id: 'r2', type: 'standard', pickupNodeId: N(0,3), dropoffNodeId: N(5,1), capacityUsed: 1 },
      { id: 'r3', type: 'standard', pickupNodeId: N(4,5), dropoffNodeId: N(2,0), capacityUsed: 1 },
    ],
    optimalCost: 14, twoStarCostCeiling: 19, threeStarCostCeiling: 17,
  },
  {
    id: 16, districtId: 2,
    name: 'Group Fare',
    description: 'A group rider takes up two capacity slots. A shuttle is waiting.',
    objective: 'Pair group riders with vehicles that can carry them.',
    cityMap: map6x6a,
    vehicles: [
      { id: 'v1', type: 'shuttle',  startNodeId: N(0,0) },
      { id: 'v2', type: 'city_van', startNodeId: N(5,5) },
    ],
    riders: [
      { id: 'r1', type: 'group',    pickupNodeId: N(1,0), dropoffNodeId: N(4,4), capacityUsed: 2 },
      { id: 'r2', type: 'standard', pickupNodeId: N(0,3), dropoffNodeId: N(5,2), capacityUsed: 1 },
      { id: 'r3', type: 'standard', pickupNodeId: N(3,5), dropoffNodeId: N(2,1), capacityUsed: 1 },
    ],
    optimalCost: 13, twoStarCostCeiling: 18, threeStarCostCeiling: 15,
  },
  {
    id: 17, districtId: 2,
    name: 'Efficiency Score',
    description: 'Three stars require keeping your total route cost low. No wasted miles.',
    objective: 'Minimize total distance while serving everyone.',
    cityMap: map7x6,
    vehicles: [
      { id: 'v1', type: 'compact_cab', startNodeId: N(0,0) },
      { id: 'v2', type: 'compact_cab', startNodeId: N(0,5) },
      { id: 'v3', type: 'city_van',    startNodeId: N(6,3) },
    ],
    riders: [
      { id: 'r1', type: 'standard', pickupNodeId: N(1,1), dropoffNodeId: N(5,4), capacityUsed: 1 },
      { id: 'r2', type: 'standard', pickupNodeId: N(1,4), dropoffNodeId: N(5,1), capacityUsed: 1 },
      { id: 'r3', type: 'priority', pickupNodeId: N(3,0), dropoffNodeId: N(0,3), deadline: 300, capacityUsed: 1 },
      { id: 'r4', type: 'standard', pickupNodeId: N(6,1), dropoffNodeId: N(3,5), capacityUsed: 1 },
    ],
    optimalCost: 18, twoStarCostCeiling: 25, threeStarCostCeiling: 21,
  },
  {
    id: 18, districtId: 2,
    name: 'Five Riders',
    description: 'Five riders across downtown. Organize the fleet intelligently.',
    objective: 'All five riders served efficiently.',
    cityMap: map7x6,
    vehicles: [
      { id: 'v1', type: 'compact_cab', startNodeId: N(0,0) },
      { id: 'v2', type: 'city_van',    startNodeId: N(0,5) },
      { id: 'v3', type: 'shuttle',     startNodeId: N(6,2) },
    ],
    riders: [
      { id: 'r1', type: 'standard', pickupNodeId: N(1,0), dropoffNodeId: N(6,5), capacityUsed: 1 },
      { id: 'r2', type: 'standard', pickupNodeId: N(1,5), dropoffNodeId: N(6,0), capacityUsed: 1 },
      { id: 'r3', type: 'priority', pickupNodeId: N(0,2), dropoffNodeId: N(5,4), deadline: 350, capacityUsed: 1 },
      { id: 'r4', type: 'group',    pickupNodeId: N(4,0), dropoffNodeId: N(2,5), capacityUsed: 2 },
      { id: 'r5', type: 'standard', pickupNodeId: N(4,5), dropoffNodeId: N(2,0), capacityUsed: 1 },
    ],
    optimalCost: 22, twoStarCostCeiling: 30, threeStarCostCeiling: 26,
  },
  {
    id: 19, districtId: 2,
    name: 'Double Priority',
    description: 'Two priority riders need escort across the congested grid.',
    objective: 'Both priority riders on time, no late arrivals.',
    cityMap: buildGridMap(6, 6, [], [],
      [[N(2,2), N(2,3), 'congested' as const], [N(3,2), N(3,3), 'congested' as const],
       [N(0,4), N(1,4), 'fast' as const]]),
    vehicles: [
      { id: 'v1', type: 'compact_cab', startNodeId: N(0,0) },
      { id: 'v2', type: 'compact_cab', startNodeId: N(5,5) },
      { id: 'v3', type: 'city_van',    startNodeId: N(0,5) },
    ],
    riders: [
      { id: 'r1', type: 'priority', pickupNodeId: N(1,1), dropoffNodeId: N(4,4), deadline: 290, capacityUsed: 1 },
      { id: 'r2', type: 'priority', pickupNodeId: N(1,4), dropoffNodeId: N(4,1), deadline: 310, capacityUsed: 1 },
      { id: 'r3', type: 'standard', pickupNodeId: N(3,0), dropoffNodeId: N(0,3), capacityUsed: 1 },
      { id: 'r4', type: 'standard', pickupNodeId: N(5,2), dropoffNodeId: N(2,5), capacityUsed: 1 },
    ],
    optimalCost: 17, twoStarCostCeiling: 23, threeStarCostCeiling: 20,
  },
  {
    id: 20, districtId: 2,
    name: 'Downtown Mastery',
    description: 'All the downtown mechanics. Congestion, capacity, and deadlines combined.',
    objective: 'Perfect the district. All riders, all on time.',
    cityMap: buildGridMap(7, 6, [], [],
      [[N(3,2), N(3,3), 'congested' as const], [N(3,1), N(3,2), 'congested' as const],
       [N(0,3), N(0,4), 'fast' as const], [N(0,4), N(0,5), 'fast' as const]]),
    vehicles: [
      { id: 'v1', type: 'compact_cab', startNodeId: N(0,0) },
      { id: 'v2', type: 'city_van',    startNodeId: N(0,5) },
      { id: 'v3', type: 'shuttle',     startNodeId: N(6,0) },
      { id: 'v4', type: 'compact_cab', startNodeId: N(6,5) },
    ],
    riders: [
      { id: 'r1', type: 'standard', pickupNodeId: N(1,0), dropoffNodeId: N(5,5), capacityUsed: 1 },
      { id: 'r2', type: 'priority', pickupNodeId: N(0,3), dropoffNodeId: N(6,3), deadline: 300, capacityUsed: 1 },
      { id: 'r3', type: 'group',    pickupNodeId: N(2,5), dropoffNodeId: N(4,0), capacityUsed: 2 },
      { id: 'r4', type: 'standard', pickupNodeId: N(4,1), dropoffNodeId: N(1,4), capacityUsed: 1 },
      { id: 'r5', type: 'priority', pickupNodeId: N(5,0), dropoffNodeId: N(1,2), deadline: 350, capacityUsed: 1 },
    ],
    optimalCost: 22, twoStarCostCeiling: 30, threeStarCostCeiling: 25,
    specialObjectiveDescription: 'Deliver all riders with no delay.',
  },
];
