export type VehicleType = 'compact_cab' | 'city_van' | 'access_van' | 'shuttle';
export type RiderType = 'standard' | 'priority' | 'accessible' | 'group';
export type RoadType = 'normal' | 'fast' | 'congested' | 'rain_slow' | 'closed' | 'one_way';

export interface MapNode {
  id: string;
  row: number;
  col: number;
  label?: string;
}

export interface MapEdge {
  id: string;
  from: string;
  to: string;
  type: RoadType;
  oneWayDirection?: 'forward' | 'reverse';
}

export interface CityMap {
  rows: number;
  cols: number;
  nodes: MapNode[];
  edges: MapEdge[];
}

export interface VehicleDef {
  id: string;
  type: VehicleType;
  startNodeId: string;
}

export interface RiderDef {
  id: string;
  type: RiderType;
  pickupNodeId: string;
  dropoffNodeId: string;
  deadline?: number;
  capacityUsed: number;
}

export const VEHICLE_SPECS: Record<VehicleType, { capacity: number; speed: number; accessible: boolean; label: string }> = {
  compact_cab: { capacity: 1, speed: 1.4, accessible: false, label: 'Compact Cab' },
  city_van:    { capacity: 2, speed: 1.0, accessible: false, label: 'City Van' },
  access_van:  { capacity: 2, speed: 1.0, accessible: true,  label: 'Access Van' },
  shuttle:     { capacity: 3, speed: 0.7, accessible: false, label: 'Shuttle' },
};

export const ROAD_COST: Record<RoadType, number> = {
  normal:    1.0,
  fast:      0.65,
  congested: 2.2,
  rain_slow: 1.6,
  closed:    Infinity,
  one_way:   1.0,
};

export interface Stop {
  type: 'pickup' | 'dropoff';
  riderId: string;
  nodeId: string;
}

export interface VehicleAssignment {
  vehicleId: string;
  stops: Stop[];
}

export interface PlayerPlan {
  assignments: VehicleAssignment[];
}

export interface RouteSegment {
  fromNodeId: string;
  toNodeId: string;
  path: string[];
  cost: number;
  travelTime: number;
}

export interface VehicleRoute {
  vehicleId: string;
  segments: RouteSegment[];
  totalCost: number;
  totalTime: number;
}

export interface RiderResult {
  riderId: string;
  served: boolean;
  onTime: boolean;
  actualPickupTime: number;
  actualDropoffTime: number;
}

export interface SimulationResult {
  valid: boolean;
  errorMessage?: string;
  vehicleRoutes: VehicleRoute[];
  riderResults: RiderResult[];
  totalCost: number;
  totalTime: number;
  ridersServed: number;
  ridersOnTime: number;
  specialObjectiveMet: boolean;
  score: number;
  stars: 0 | 1 | 2 | 3;
}

export interface StarThreshold {
  minScore: number;
  allRidersServed: boolean;
  maxCostMultiplier: number;
  allOnTime: boolean;
  specialObjective: boolean;
}

export interface LevelDef {
  id: number;
  districtId: number;
  name: string;
  description: string;
  objective: string;
  specialRule?: string;
  cityMap: CityMap;
  vehicles: VehicleDef[];
  riders: RiderDef[];
  timeLimit?: number;
  optimalCost: number;
  twoStarCostCeiling: number;
  threeStarCostCeiling: number;
  specialObjectiveDescription?: string;
}

export interface DistrictDef {
  id: number;
  name: string;
  description: string;
  mood: string;
  unlockRequirement: number;
}

export interface LevelProgress {
  levelId: number;
  bestScore: number;
  stars: 0 | 1 | 2 | 3;
  completed: boolean;
}

export interface GameProgress {
  levels: Record<number, LevelProgress>;
  unlockedDistricts: number[];
  totalStars: number;
  successfulCompletions: number;
  tutorialComplete: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

export interface AdState {
  successfulCompletions: number;
  lastInterstitialTimestamp: number;
  lastAppOpenTimestamp: number;
  firstLaunch: boolean;
}
