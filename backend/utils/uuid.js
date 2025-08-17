import { v4 as uuidv4 } from "uuid";

// Generate an 8-character invite code (alphanumeric)
export function generateInviteCode() {
  return uuidv4().replace(/-/g, "").substring(0, 8);
}

// Generate a short task code with "task-" prefix
export function generateTaskCode() {
  return `task-${uuidv4().replace(/-/g, "").substring(0, 3)}`;
}
