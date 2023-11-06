import { GaugeType } from "../generated/schema";
import { ZERO_BI } from "./constants";

export function getOrCreateGaugeType(typeId: string, name: string): GaugeType {
  let entity = GaugeType.load(typeId);
  if (entity === null) {
    entity = new GaugeType(typeId);
    entity.name = name;
    entity.gaugeCount = ZERO_BI;
    entity.save();
  }

  return entity as GaugeType;
}
