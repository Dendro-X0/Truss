/**
 * Helpers for working with organization roles.
 */
import type { OrgRole } from "./org-role-types";

export default class OrgRoleHelpers {
  public static normalize(role: string | undefined): OrgRole {
    const value: string = (role ?? "member").toLowerCase();
    if (value === "owner" || value === "admin" || value === "member") {
      return value;
    }
    return "member";
  }

  public static isOwner(role: string | undefined): boolean {
    const normalized: OrgRole = OrgRoleHelpers.normalize(role);
    return normalized === "owner";
  }

  public static isManager(role: string | undefined): boolean {
    const normalized: OrgRole = OrgRoleHelpers.normalize(role);
    return normalized === "owner" || normalized === "admin";
  }
}
