import type { CourseTag, MethodTag, Topic } from "@/lib/questions";

export const TOPICS_BY_COURSE: Record<CourseTag, Topic[]> = {
  calc1: ["integration"],
  calc2: ["integration"],
  IB: ["differentiation", "integration"],
  VCE: ["differentiation", "integration"],
  HSC: ["differentiation", "integration"],
  AP: ["differentiation", "integration"],
};

export const METHODS_BY_TOPIC: Record<Topic, MethodTag[]> = {
  differentiation: ["powerRule", "chainRule", "productRule", "quotientRule"],
  integration: [
    "uSubstitution",
    "integrationByParts",
    "partialFractions",
    "trigIdentity",
  ],
};
