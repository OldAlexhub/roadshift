import { LevelDef } from '../../types/game';
import { buildGridMap, N } from '../mapBuilder';

const map5x5 = buildGridMap(5, 5);
const map5x5b = buildGridMap(5, 5, [], [], [[N(2,0), N(2,1), 'fast'], [N(2,1), N(2,2), 'fast']]);
const map5x5c = buildGridMap(5, 5, [], [[N(1,2), N(2,2)]], [[N(0,2), N(0,3), 'fast']]);
const map5x5d = buildGridMap(5, 5, [], [], [[N(2,2), N(3,2), 'congested']]);
const map6x5  = buildGridMap(6, 5);
const map6x5b = buildGridMap(6, 5, [], [], [[N(3,1), N(3,2), 'congested'], [N(3,2), N(3,3), 'congested']]);

export const district1Levels: LevelDef[] = [
  {
    id: 1, districtId: 1,
    name: 'First Call',
    description: 'Your first shift. One cab, one rider. Get them where they need to go.',
    objective: 'Pick up the rider and deliver them to their destination.',
    cityMap: map5x5,
    vehicles: [{ id: 'v1', type: 'compact_cab', startNodeId: N(0,0) }],
    riders:   [{ id: 'r1', type: 'standard', pickupNodeId: N(1,1), dropoffNodeId: N(3,3), capacityUsed: 1 }],
    optimalCost: 4, twoStarCostCeiling: 6, threeStarCostCeiling: 5,
  },
  {
    id: 2, districtId: 1,
    name: 'Across Town',
    description: 'A rider needs to cross from one side of downtown to the other.',
    objective: 'Complete the cross-town trip efficiently.',
    cityMap: map5x5b,
    vehicles: [{ id: 'v1', type: 'compact_cab', startNodeId: N(4,0) }],
    riders:   [{ id: 'r1', type: 'standard', pickupNodeId: N(2,0), dropoffNodeId: N(2,4), capacityUsed: 1 }],
    optimalCost: 3, twoStarCostCeiling: 5, threeStarCostCeiling: 4,
    specialObjectiveDescription: 'Use the fast corridor.',
  },
  {
    id: 3, districtId: 1,
    name: 'Two Stops',
    description: 'A van can take two riders. Plan the pickup order carefully.',
    objective: 'Serve both riders with one van.',
    cityMap: map5x5,
    vehicles: [{ id: 'v1', type: 'city_van', startNodeId: N(0,0) }],
    riders:   [
      { id: 'r1', type: 'standard', pickupNodeId: N(1,1), dropoffNodeId: N(3,2), capacityUsed: 1 },
      { id: 'r2', type: 'standard', pickupNodeId: N(0,3), dropoffNodeId: N(4,4), capacityUsed: 1 },
    ],
    optimalCost: 8, twoStarCostCeiling: 11, threeStarCostCeiling: 10,
  },
  {
    id: 4, districtId: 1,
    name: 'Split Duty',
    description: 'Two cabs, two riders. Assign wisely to cover the district.',
    objective: 'Match each cab to a rider for the shortest total distance.',
    cityMap: map5x5,
    vehicles: [
      { id: 'v1', type: 'compact_cab', startNodeId: N(0,0) },
      { id: 'v2', type: 'compact_cab', startNodeId: N(4,4) },
    ],
    riders:   [
      { id: 'r1', type: 'standard', pickupNodeId: N(1,0), dropoffNodeId: N(2,2), capacityUsed: 1 },
      { id: 'r2', type: 'standard', pickupNodeId: N(3,4), dropoffNodeId: N(1,3), capacityUsed: 1 },
    ],
    optimalCost: 5, twoStarCostCeiling: 8, threeStarCostCeiling: 7,
  },
  {
    id: 5, districtId: 1,
    name: 'Route Order',
    description: 'Order matters. Figure out the most efficient pickup sequence.',
    objective: 'Serve both riders with minimal backtracking.',
    cityMap: map5x5c,
    vehicles: [{ id: 'v1', type: 'city_van', startNodeId: N(2,2) }],
    riders:   [
      { id: 'r1', type: 'standard', pickupNodeId: N(0,0), dropoffNodeId: N(4,1), capacityUsed: 1 },
      { id: 'r2', type: 'standard', pickupNodeId: N(0,4), dropoffNodeId: N(4,3), capacityUsed: 1 },
    ],
    optimalCost: 10, twoStarCostCeiling: 14, threeStarCostCeiling: 12,
  },
  {
    id: 6, districtId: 1,
    name: 'Three Riders',
    description: 'A cab and a van, three riders to cover. Make the assignment work.',
    objective: 'All three riders served. Plan the right assignments.',
    cityMap: map5x5,
    vehicles: [
      { id: 'v1', type: 'compact_cab', startNodeId: N(0,0) },
      { id: 'v2', type: 'city_van',    startNodeId: N(4,0) },
    ],
    riders:   [
      { id: 'r1', type: 'standard', pickupNodeId: N(0,2), dropoffNodeId: N(2,4), capacityUsed: 1 },
      { id: 'r2', type: 'standard', pickupNodeId: N(3,1), dropoffNodeId: N(1,3), capacityUsed: 1 },
      { id: 'r3', type: 'standard', pickupNodeId: N(4,2), dropoffNodeId: N(2,3), capacityUsed: 1 },
    ],
    optimalCost: 9, twoStarCostCeiling: 13, threeStarCostCeiling: 11,
  },
  {
    id: 7, districtId: 1,
    name: 'Beat the Clock',
    description: 'A priority rider needs to be dropped off quickly.',
    objective: 'Get the priority rider to their destination on time.',
    cityMap: map5x5,
    vehicles: [
      { id: 'v1', type: 'compact_cab', startNodeId: N(0,0) },
      { id: 'v2', type: 'compact_cab', startNodeId: N(0,4) },
    ],
    riders:   [
      { id: 'r1', type: 'priority', pickupNodeId: N(1,2), dropoffNodeId: N(4,2), deadline: 280, capacityUsed: 1 },
      { id: 'r2', type: 'standard', pickupNodeId: N(3,0), dropoffNodeId: N(1,4), capacityUsed: 1 },
    ],
    optimalCost: 6, twoStarCostCeiling: 9, threeStarCostCeiling: 7,
  },
  {
    id: 8, districtId: 1,
    name: 'Full Van',
    description: 'A van can take two riders at once. Load it up and plan the route.',
    objective: 'Carry two riders simultaneously for maximum efficiency.',
    cityMap: map5x5d,
    vehicles: [{ id: 'v1', type: 'city_van', startNodeId: N(0,2) }],
    riders:   [
      { id: 'r1', type: 'standard', pickupNodeId: N(1,0), dropoffNodeId: N(4,1), capacityUsed: 1 },
      { id: 'r2', type: 'standard', pickupNodeId: N(1,4), dropoffNodeId: N(4,3), capacityUsed: 1 },
    ],
    optimalCost: 8, twoStarCostCeiling: 12, threeStarCostCeiling: 10,
  },
  {
    id: 9, districtId: 1,
    name: 'Three Vehicles',
    description: 'Your first three-vehicle coordination. Match each vehicle to the right job.',
    objective: 'All four riders served efficiently.',
    cityMap: map6x5,
    vehicles: [
      { id: 'v1', type: 'compact_cab', startNodeId: N(0,0) },
      { id: 'v2', type: 'compact_cab', startNodeId: N(0,4) },
      { id: 'v3', type: 'city_van',    startNodeId: N(5,2) },
    ],
    riders:   [
      { id: 'r1', type: 'standard',  pickupNodeId: N(1,1), dropoffNodeId: N(4,3), capacityUsed: 1 },
      { id: 'r2', type: 'standard',  pickupNodeId: N(1,3), dropoffNodeId: N(4,1), capacityUsed: 1 },
      { id: 'r3', type: 'priority',  pickupNodeId: N(3,0), dropoffNodeId: N(0,2), deadline: 300, capacityUsed: 1 },
      { id: 'r4', type: 'standard',  pickupNodeId: N(3,4), dropoffNodeId: N(5,0), capacityUsed: 1 },
    ],
    optimalCost: 12, twoStarCostCeiling: 17, threeStarCostCeiling: 15,
  },
  {
    id: 10, districtId: 1,
    name: 'Shift Complete',
    description: 'End of your first shift. Coordinate three vehicles and five riders to finish strong.',
    objective: 'Perfect the district finale. All five riders, all on time.',
    cityMap: map6x5b,
    vehicles: [
      { id: 'v1', type: 'compact_cab', startNodeId: N(0,0) },
      { id: 'v2', type: 'city_van',    startNodeId: N(0,4) },
      { id: 'v3', type: 'compact_cab', startNodeId: N(5,2) },
    ],
    riders:   [
      { id: 'r1', type: 'standard',  pickupNodeId: N(1,0), dropoffNodeId: N(4,4), capacityUsed: 1 },
      { id: 'r2', type: 'priority',  pickupNodeId: N(0,2), dropoffNodeId: N(5,4), deadline: 350, capacityUsed: 1 },
      { id: 'r3', type: 'standard',  pickupNodeId: N(2,4), dropoffNodeId: N(3,1), capacityUsed: 1 },
      { id: 'r4', type: 'standard',  pickupNodeId: N(4,0), dropoffNodeId: N(1,3), capacityUsed: 1 },
      { id: 'r5', type: 'standard',  pickupNodeId: N(5,3), dropoffNodeId: N(2,1), capacityUsed: 1 },
    ],
    optimalCost: 18, twoStarCostCeiling: 25, threeStarCostCeiling: 22,
    specialObjectiveDescription: 'Deliver all riders with no delay.',
  },
];
