import { LevelDef } from '../../types/game';
import { buildGridMap, N } from '../mapBuilder';

const mapAcc = buildGridMap(6, 6, [], [], [[N(2,2), N(2,3), 'congested' as const]]);
const mapAcc2 = buildGridMap(6, 6, [], [[N(3,3), N(4,3)]]);
const mapAcc3 = buildGridMap(7, 6, [], [],
  [[N(3,2), N(3,3), 'congested' as const], [N(0,4), N(1,4), 'fast' as const]]);

export const district3Levels: LevelDef[] = [
  {
    id: 21, districtId: 3,
    name: 'Access Line',
    description: 'Some riders require an accessible vehicle. Match them correctly.',
    objective: 'Pair the accessible rider with the Access Van.',
    cityMap: mapAcc,
    vehicles: [
      { id: 'v1', type: 'access_van', startNodeId: N(0,0) },
      { id: 'v2', type: 'city_van',   startNodeId: N(5,5) },
    ],
    riders: [
      { id: 'r1', type: 'accessible', pickupNodeId: N(1,1), dropoffNodeId: N(4,4), capacityUsed: 1 },
      { id: 'r2', type: 'standard',   pickupNodeId: N(1,4), dropoffNodeId: N(4,1), capacityUsed: 1 },
    ],
    optimalCost: 8, twoStarCostCeiling: 12, threeStarCostCeiling: 10,
  },
  {
    id: 22, districtId: 3,
    name: 'One Van, Two Needs',
    description: 'One Access Van, two accessible riders. The van can carry both.',
    objective: 'Use the Access Van to serve both accessible riders.',
    cityMap: mapAcc,
    vehicles: [
      { id: 'v1', type: 'access_van',  startNodeId: N(0,2) },
      { id: 'v2', type: 'compact_cab', startNodeId: N(5,2) },
    ],
    riders: [
      { id: 'r1', type: 'accessible', pickupNodeId: N(1,0), dropoffNodeId: N(4,3), capacityUsed: 1 },
      { id: 'r2', type: 'accessible', pickupNodeId: N(1,4), dropoffNodeId: N(4,1), capacityUsed: 1 },
      { id: 'r3', type: 'standard',   pickupNodeId: N(3,5), dropoffNodeId: N(0,3), capacityUsed: 1 },
    ],
    optimalCost: 11, twoStarCostCeiling: 15, threeStarCostCeiling: 13,
  },
  {
    id: 23, districtId: 3,
    name: 'Priority Access',
    description: 'An accessible rider with a tight deadline. No standard vehicle will do.',
    objective: 'Get the accessible priority rider there on time.',
    cityMap: mapAcc,
    vehicles: [
      { id: 'v1', type: 'access_van',  startNodeId: N(0,0) },
      { id: 'v2', type: 'compact_cab', startNodeId: N(0,5) },
    ],
    riders: [
      { id: 'r1', type: 'accessible', pickupNodeId: N(1,2), dropoffNodeId: N(5,2), deadline: 290, capacityUsed: 1 },
      { id: 'r2', type: 'priority',   pickupNodeId: N(0,3), dropoffNodeId: N(5,4), deadline: 320, capacityUsed: 1 },
    ],
    optimalCost: 9, twoStarCostCeiling: 13, threeStarCostCeiling: 11,
  },
  {
    id: 24, districtId: 3,
    name: 'Dividing Routes',
    description: 'Divide accessible and standard riders efficiently between the available vehicles.',
    objective: 'No accessible rider on a standard vehicle. All served.',
    cityMap: mapAcc2,
    vehicles: [
      { id: 'v1', type: 'access_van',  startNodeId: N(0,0) },
      { id: 'v2', type: 'compact_cab', startNodeId: N(0,5) },
      { id: 'v3', type: 'compact_cab', startNodeId: N(5,3) },
    ],
    riders: [
      { id: 'r1', type: 'accessible', pickupNodeId: N(1,1), dropoffNodeId: N(4,4), capacityUsed: 1 },
      { id: 'r2', type: 'accessible', pickupNodeId: N(2,4), dropoffNodeId: N(5,1), capacityUsed: 1 },
      { id: 'r3', type: 'standard',   pickupNodeId: N(1,3), dropoffNodeId: N(4,0), capacityUsed: 1 },
      { id: 'r4', type: 'standard',   pickupNodeId: N(4,5), dropoffNodeId: N(1,2), capacityUsed: 1 },
    ],
    optimalCost: 14, twoStarCostCeiling: 20, threeStarCostCeiling: 17,
  },
  {
    id: 25, districtId: 3,
    name: 'Congested Access',
    description: 'The main corridor is congested. Find the clear path for the accessible rider.',
    objective: 'Reach the accessible rider and deliver on time.',
    cityMap: buildGridMap(6, 6, [], [],
      [[N(2,1), N(2,2), 'congested' as const], [N(2,2), N(2,3), 'congested' as const],
       [N(2,3), N(2,4), 'congested' as const]]),
    vehicles: [
      { id: 'v1', type: 'access_van',  startNodeId: N(0,0) },
      { id: 'v2', type: 'city_van',    startNodeId: N(5,5) },
    ],
    riders: [
      { id: 'r1', type: 'accessible', pickupNodeId: N(3,0), dropoffNodeId: N(0,5), deadline: 330, capacityUsed: 1 },
      { id: 'r2', type: 'group',      pickupNodeId: N(1,5), dropoffNodeId: N(5,2), capacityUsed: 2 },
    ],
    optimalCost: 11, twoStarCostCeiling: 16, threeStarCostCeiling: 13,
  },
  {
    id: 26, districtId: 3,
    name: 'Shuttle Access',
    description: 'The shuttle has accessible capability this shift. Use it well.',
    objective: 'Coordinate shuttle and Access Van for mixed ridership.',
    cityMap: buildGridMap(6, 6, [], [],
      [[N(3,3), N(3,4), 'fast' as const], [N(4,3), N(4,4), 'fast' as const]]),
    vehicles: [
      { id: 'v1', type: 'access_van', startNodeId: N(0,0) },
      { id: 'v2', type: 'shuttle',    startNodeId: N(5,5) },
    ],
    riders: [
      { id: 'r1', type: 'accessible', pickupNodeId: N(1,1), dropoffNodeId: N(4,4), capacityUsed: 1 },
      { id: 'r2', type: 'standard',   pickupNodeId: N(0,4), dropoffNodeId: N(5,1), capacityUsed: 1 },
      { id: 'r3', type: 'standard',   pickupNodeId: N(3,5), dropoffNodeId: N(1,3), capacityUsed: 1 },
      { id: 'r4', type: 'standard',   pickupNodeId: N(5,2), dropoffNodeId: N(2,0), capacityUsed: 1 },
    ],
    optimalCost: 16, twoStarCostCeiling: 22, threeStarCostCeiling: 19,
  },
  {
    id: 27, districtId: 3,
    name: 'Three Accessible',
    description: 'Three accessible riders. Two Access Vans available. Coordinate carefully.',
    objective: 'All three accessible riders served with compatible vehicles.',
    cityMap: mapAcc3,
    vehicles: [
      { id: 'v1', type: 'access_van',  startNodeId: N(0,0) },
      { id: 'v2', type: 'access_van',  startNodeId: N(0,5) },
      { id: 'v3', type: 'compact_cab', startNodeId: N(6,3) },
    ],
    riders: [
      { id: 'r1', type: 'accessible', pickupNodeId: N(1,1), dropoffNodeId: N(5,4), capacityUsed: 1 },
      { id: 'r2', type: 'accessible', pickupNodeId: N(1,4), dropoffNodeId: N(5,1), capacityUsed: 1 },
      { id: 'r3', type: 'accessible', pickupNodeId: N(3,0), dropoffNodeId: N(3,5), capacityUsed: 1 },
      { id: 'r4', type: 'standard',   pickupNodeId: N(6,0), dropoffNodeId: N(0,3), capacityUsed: 1 },
    ],
    optimalCost: 19, twoStarCostCeiling: 26, threeStarCostCeiling: 22,
  },
  {
    id: 28, districtId: 3,
    name: 'Mixed Fleet',
    description: 'Accessible and standard riders, mix of vehicles. Get the assignments right.',
    objective: 'Perfect vehicle-to-rider matching for maximum efficiency.',
    cityMap: mapAcc3,
    vehicles: [
      { id: 'v1', type: 'access_van',  startNodeId: N(0,0) },
      { id: 'v2', type: 'city_van',    startNodeId: N(0,5) },
      { id: 'v3', type: 'compact_cab', startNodeId: N(6,5) },
    ],
    riders: [
      { id: 'r1', type: 'accessible', pickupNodeId: N(1,1), dropoffNodeId: N(6,4), capacityUsed: 1 },
      { id: 'r2', type: 'accessible', pickupNodeId: N(2,4), dropoffNodeId: N(5,0), capacityUsed: 1 },
      { id: 'r3', type: 'priority',   pickupNodeId: N(0,3), dropoffNodeId: N(6,3), deadline: 300, capacityUsed: 1 },
      { id: 'r4', type: 'group',      pickupNodeId: N(4,5), dropoffNodeId: N(1,2), capacityUsed: 2 },
    ],
    optimalCost: 20, twoStarCostCeiling: 28, threeStarCostCeiling: 23,
  },
  {
    id: 29, districtId: 3,
    name: 'Route Integrity',
    description: 'A road closure forces a detour on the access route. Plan around it.',
    objective: 'Reach every rider despite the closure.',
    cityMap: buildGridMap(7, 6, [], [[N(3,2), N(4,2)], [N(3,3), N(4,3)]],
      [[N(2,1), N(2,2), 'fast' as const], [N(5,2), N(5,3), 'fast' as const]]),
    vehicles: [
      { id: 'v1', type: 'access_van',  startNodeId: N(0,0) },
      { id: 'v2', type: 'access_van',  startNodeId: N(6,5) },
      { id: 'v3', type: 'compact_cab', startNodeId: N(0,5) },
    ],
    riders: [
      { id: 'r1', type: 'accessible', pickupNodeId: N(2,0), dropoffNodeId: N(5,4), capacityUsed: 1 },
      { id: 'r2', type: 'accessible', pickupNodeId: N(2,5), dropoffNodeId: N(5,1), capacityUsed: 1 },
      { id: 'r3', type: 'standard',   pickupNodeId: N(0,3), dropoffNodeId: N(6,3), capacityUsed: 1 },
      { id: 'r4', type: 'priority',   pickupNodeId: N(6,0), dropoffNodeId: N(1,3), deadline: 350, capacityUsed: 1 },
    ],
    optimalCost: 22, twoStarCostCeiling: 30, threeStarCostCeiling: 25,
  },
  {
    id: 30, districtId: 3,
    name: 'Access Complete',
    description: 'All accessibility mechanics combined. Congestion, closures, priorities, and groups.',
    objective: 'Serve the district. Perfect accessibility compliance.',
    cityMap: buildGridMap(7, 7, [], [[N(3,3), N(4,3)], [N(3,4), N(4,4)]],
      [[N(2,2), N(2,3), 'congested' as const], [N(0,5), N(0,6), 'fast' as const]]),
    vehicles: [
      { id: 'v1', type: 'access_van',  startNodeId: N(0,0) },
      { id: 'v2', type: 'access_van',  startNodeId: N(0,6) },
      { id: 'v3', type: 'city_van',    startNodeId: N(6,0) },
      { id: 'v4', type: 'compact_cab', startNodeId: N(6,6) },
    ],
    riders: [
      { id: 'r1', type: 'accessible', pickupNodeId: N(1,1), dropoffNodeId: N(5,5), capacityUsed: 1 },
      { id: 'r2', type: 'accessible', pickupNodeId: N(1,5), dropoffNodeId: N(5,1), capacityUsed: 1 },
      { id: 'r3', type: 'priority',   pickupNodeId: N(0,3), dropoffNodeId: N(6,4), deadline: 320, capacityUsed: 1 },
      { id: 'r4', type: 'group',      pickupNodeId: N(4,0), dropoffNodeId: N(2,6), capacityUsed: 2 },
      { id: 'r5', type: 'standard',   pickupNodeId: N(6,2), dropoffNodeId: N(1,4), capacityUsed: 1 },
    ],
    optimalCost: 26, twoStarCostCeiling: 35, threeStarCostCeiling: 30,
    specialObjectiveDescription: 'All accessible riders served on time with compliant vehicles.',
  },
];
