# Verify reports

Studio Output Hub — materialized artifacts for IDE and agent navigation.

- **False-green scan** — [`.codactrl/verify/agent/false-green.json`](.codactrl/verify/agent/false-green.json)
  - source: `.codectx/verify/false-green.json`
- **Verify agent entrypoints** — [`.codactrl/verify/agent/entrypoints.json`](.codactrl/verify/agent/entrypoints.json)
- **Verify summary** — [`.codactrl/verify/summary.md`](.codactrl/verify/summary.md)
- **Verify MCP audit log** — [`.codactrl/verify/mcp-history/audit.jsonl`](.codactrl/verify/mcp-history/audit.jsonl)
- **Verify MCP history summary** — [`.codactrl/verify/mcp-history/summary.json`](.codactrl/verify/mcp-history/summary.json)
- **Verify MCP history index** — [`.codactrl/verify/mcp-history/index.json`](.codactrl/verify/mcp-history/index.json)

## Git policy

- `.codectx/verify/` is machine truth (sessions, faults, chains, register). Keep local or gitignored in subject repos.
- `.codactrl/verify/` mirrors agent navigation. Commit `issue-report/` per pass when sharing evidence with reviewers or agents.
- Prefer agents read `issue-report/report-rollup.md` then `issues-register.summary.json`; avoid full `report.json` and `mcp-audit.jsonl` unless debugging.
- Pass snapshots archive to `.codectx/verify/passes/<date>/` on each `verify.issues.report.export`.
