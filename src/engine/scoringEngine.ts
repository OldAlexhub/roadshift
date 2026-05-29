import {
  LevelDef,
  PlayerPlan,
  SimulationResult,
  RiderResult,
  VehicleRoute,
  RouteSegment,
  Stop,
  VEHICLE_SPECS,
} from '../types/game';
import { dijkstra } from './routeEngine';

const SPEED_BASE = 60;

export function validateAndSimulate(level: LevelDef, plan: PlayerPlan): SimulationResult {
  const vehicleRoutes: VehicleRoute[] = [];
  const riderResults: RiderResult[] = [];
  let totalCost = 0;

  const riderById = new Map(level.riders.map(r => [r.id, r]));
  const vehicleById = new Map(level.vehicles.map(v => [v.id, v]));

  const servedRiders = new Set<string>();

  for (const assignment of plan.assignments) {
    const vehicle = vehicleById.get(assignment.vehicleId);
    if (!vehicle) {
      return fail(`Unknown vehicle ${assignment.vehicleId}`);
    }

    const spec = VEHICLE_SPECS[vehicle.type];
    const stops: Stop[] = assignment.stops;

    let currentNodeId = vehicle.startNodeId;
    let currentTime   = 0;
    let capacityUsed  = 0;
    const segments: RouteSegment[] = [];
    const onboardRiders: string[] = [];

    for (const stop of stops) {
      const rider = riderById.get(stop.riderId);
      if (!rider) {
        return fail(`Unknown rider ${stop.riderId}`);
      }

      if (stop.type === 'pickup' && rider.type === 'accessible' && !spec.accessible) {
        return fail(`Vehicle ${vehicle.id} is not accessible but is assigned accessible rider ${rider.id}`);
      }

      const targetNodeId = stop.type === 'pickup' ? rider.pickupNodeId : rider.dropoffNodeId;

      const pathResult = dijkstra(level.cityMap, currentNodeId, targetNodeId);
      if (!pathResult.found) {
        return fail(`No valid route from ${currentNodeId} to ${targetNodeId}`);
      }

      const travelTime = (pathResult.cost / spec.speed) * SPEED_BASE;
      currentTime += travelTime;

      segments.push({
        fromNodeId: currentNodeId,
        toNodeId:   targetNodeId,
        path:       pathResult.path,
        cost:       pathResult.cost,
        travelTime,
      });

      if (stop.type === 'pickup') {
        capacityUsed += rider.capacityUsed;
        if (capacityUsed > spec.capacity) {
          return fail(`Vehicle ${vehicle.id} exceeds capacity`);
        }
        onboardRiders.push(rider.id);

        riderResults.push({
          riderId:           rider.id,
          served:            false,
          onTime:            false,
          actualPickupTime:  currentTime,
          actualDropoffTime: 0,
        });
      } else {
        const idx = onboardRiders.indexOf(rider.id);
        if (idx === -1) {
          return fail(`Rider ${rider.id} not on board for dropoff`);
        }
        onboardRiders.splice(idx, 1);
        capacityUsed -= rider.capacityUsed;

        const rr = riderResults.find(r => r.riderId === rider.id);
        if (rr) {
          rr.served            = true;
          rr.actualDropoffTime = currentTime;
          rr.onTime            = rider.deadline == null || currentTime <= rider.deadline;
        }

        servedRiders.add(rider.id);
      }

      currentNodeId = targetNodeId;
    }

    if (onboardRiders.length > 0) {
      return fail(`Vehicle ${vehicle.id} never dropped off riders: ${onboardRiders.join(', ')}`);
    }

    const routeCost = segments.reduce((s, seg) => s + seg.cost, 0);
    totalCost += routeCost;

    vehicleRoutes.push({
      vehicleId:  vehicle.id,
      segments,
      totalCost:  routeCost,
      totalTime:  currentTime,
    });
  }

  for (const rider of level.riders) {
    if (!servedRiders.has(rider.id)) {
      const partial = riderResults.find(r => r.riderId === rider.id);
      if (!partial) {
        riderResults.push({
          riderId:           rider.id,
          served:            false,
          onTime:            false,
          actualPickupTime:  0,
          actualDropoffTime: 0,
        });
      }
    }
  }

  const ridersServed = riderResults.filter(r => r.served).length;
  const ridersOnTime = riderResults.filter(r => r.served && r.onTime).length;
  const totalRiders  = level.riders.length;

  if (ridersServed < totalRiders) {
    return fail(`Not all riders served (${ridersServed}/${totalRiders})`);
  }

  const efficiency = Math.max(0, 1 - (totalCost - level.optimalCost) / Math.max(level.optimalCost, 1));
  const onTimeRatio = ridersOnTime / Math.max(totalRiders, 1);

  const pointsRiders     = Math.round((ridersServed / totalRiders) * 400);
  const pointsOnTime     = Math.round(onTimeRatio * 300);
  const pointsEfficiency = Math.round(Math.min(1, efficiency) * 200);
  const specialObjectiveMet = totalCost <= level.threeStarCostCeiling && onTimeRatio === 1;
  const pointsSpecial    = specialObjectiveMet ? 100 : 0;

  const score = Math.min(1000, pointsRiders + pointsOnTime + pointsEfficiency + pointsSpecial);

  let stars: 0 | 1 | 2 | 3 = 1;
  if (totalCost <= level.threeStarCostCeiling && onTimeRatio === 1 && ridersServed === totalRiders) {
    stars = 3;
  } else if (totalCost <= level.twoStarCostCeiling && ridersServed === totalRiders) {
    stars = 2;
  }

  return {
    valid:             true,
    vehicleRoutes,
    riderResults,
    totalCost,
    totalTime:         Math.max(...vehicleRoutes.map(v => v.totalTime), 0),
    ridersServed,
    ridersOnTime,
    specialObjectiveMet,
    score,
    stars,
  };
}

function fail(errorMessage: string): SimulationResult {
  return {
    valid:             false,
    errorMessage,
    vehicleRoutes:     [],
    riderResults:      [],
    totalCost:         0,
    totalTime:         0,
    ridersServed:      0,
    ridersOnTime:      0,
    specialObjectiveMet: false,
    score:             0,
    stars:             0,
  };
}
