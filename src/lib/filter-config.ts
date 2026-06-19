import type { CourseTag, Topic } from "@/lib/questions";
import { COURSE_TAGS } from "@/lib/questions";

const CALC_TOPICS: Topic[] = ["differentiation", "integration"];

function topicsForCourse(tag: CourseTag): Topic[] {
  if (tag === "calc1" || tag === "calc2") {
    return ["integration"];
  }
  return CALC_TOPICS;
}

export const TOPICS_BY_COURSE: Record<CourseTag, Topic[]> = Object.fromEntries(
  COURSE_TAGS.map((tag) => [tag, topicsForCourse(tag)]),
) as Record<CourseTag, Topic[]>;

export const METHODS_BY_TOPIC: Record<Topic, import("@/lib/questions").MethodTag[]> = {
  differentiation: ["powerRule", "chainRule", "productRule", "quotientRule"],
  integration: [
    "uSubstitution",
    "integrationByParts",
    "partialFractions",
    "trigIdentity",
  ],
};
