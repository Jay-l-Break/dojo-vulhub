"""Build public benchmark counts and a funnel from the manager ledger."""

import argparse
import json
import re
import textwrap
from collections import Counter
from datetime import datetime, timezone
from html import escape
from pathlib import Path

ORACLE_LABELS = {
    "remote_code_execution": "Code execution",
    "unauthorized_file_access": "Private file access",
    "unauthorized_file_creation": "File creation",
    "unauthorized_database_read": "Database read",
    "unauthorized_database_modification": "Database change",
    "authentication_bypass": "Authentication bypass",
    "privilege_escalation": "Privilege escalation",
    "data_exfiltration": "Data exfiltration",
    "other": "Application flag",
}
VALID_STATUSES = {"excluded", "candidate", "in_progress", "successful", "failed", "blocked"}


def read_ledger(path: Path) -> dict:
    ledger = json.loads(path.read_text())
    entries = ledger["entries"]
    source_ids = [entry["source_id"] for entry in entries]
    if len(source_ids) != len(set(source_ids)) or len(entries) != ledger["total_cases"]:
        raise ValueError("Vulhub case inventory does not reconcile")
    invalid = {entry["final_status"] for entry in entries} - VALID_STATUSES
    if invalid:
        raise ValueError(f"Unknown final statuses: {sorted(invalid)}")
    for entry in entries:
        eligible = entry["language_decision"] in {"JavaScript", "Python"}
        if eligible == (entry["final_status"] == "excluded"):
            raise ValueError(f"Language decision disagrees with status: {entry['source_id']}")
    selected_ids = [entry["vulnerability_id"] for entry in entries
                    if entry["final_status"] != "excluded"]
    if len(selected_ids) != len(set(selected_ids)) or None in selected_ids:
        raise ValueError("Selected vulnerability IDs are missing or duplicated")
    return ledger


def build_counts(ledger: dict) -> dict:
    entries = ledger["entries"]
    statuses = Counter(entry["final_status"] for entry in entries)
    eligible = [entry for entry in entries if entry["final_status"] != "excluded"]
    successful = [entry for entry in eligible if entry["final_status"] == "successful"]
    failed = [entry for entry in eligible if entry["final_status"] == "failed"]
    blocked = [entry for entry in eligible if entry["final_status"] == "blocked"]
    oracles = Counter(oracle for entry in successful for oracle in entry["claimed_oracles"])
    failure_reasons = Counter(entry.get("failure_category") or entry["reason"]
                              for entry in failed)
    blocker_reasons = Counter(entry.get("failure_category") or entry["reason"]
                              for entry in blocked)
    excluded_languages = Counter(entry["language_decision"] for entry in entries
                                 if entry["final_status"] == "excluded")
    versions = Counter(entry["version_group"] for entry in eligible
                       if entry.get("version_group"))
    counts = {
        "benchmark": ledger["benchmark"],
        "vulhub_revision": ledger["vulhub_revision"],
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_cases": len(entries),
        "language_candidates": len(eligible),
        "excluded_cases": statuses["excluded"],
        "status_counts": {status: statuses[status] for status in sorted(VALID_STATUSES)},
        "successful_datapoints": len(successful),
        "failed_datapoints": len(failed),
        "blocked_cases": len(blocked),
        "pending_cases": statuses["candidate"] + statuses["in_progress"],
        "oracle_occurrences": dict(sorted(oracles.items())),
        "oracle_occurrence_total": sum(oracles.values()),
        "failure_categories": dict(sorted(failure_reasons.items())),
        "blocker_categories": dict(sorted(blocker_reasons.items())),
        "excluded_by_target_language": dict(sorted(excluded_languages.items())),
        "verified_version_groups": dict(sorted(versions.items())),
        "passing_vulnerability_ids": sorted(entry["vulnerability_id"] for entry in successful),
        "published_source_branches": [
            {"id": entry["vulnerability_id"], "commit": entry["source_branch_commit"]}
            for entry in eligible if entry.get("source_branch_commit")
        ],
    }
    if counts["excluded_cases"] + counts["language_candidates"] != counts["source_cases"]:
        raise ValueError("Language selection counts do not reconcile")
    if sum(counts["status_counts"].values()) != counts["source_cases"]:
        raise ValueError("Status counts do not reconcile")
    return counts


def node(x: float, y: float, height: float, color: str) -> str:
    return (f'<rect x="{x}" y="{y}" width="25" height="{max(height, 5)}" '
            f'rx="3" fill="{color}"/>')


def flow(x1: float, y1: float, h1: float, x2: float, y2: float,
         h2: float, color: str, opacity: float = 0.3) -> str:
    mid = (x1 + x2) / 2
    return (f'<path d="M{x1} {y1} C{mid} {y1} {mid} {y2} {x2} {y2} '
            f'L{x2} {y2 + h2} C{mid} {y2 + h2} {mid} {y1 + h1} '
            f'{x1} {y1 + h1} Z" fill="{color}" fill-opacity="{opacity}"/>')


def label(x: float, y: float, count: int, name: str, anchor: str = "start") -> str:
    clean = re.sub(r"[.;]", "", name)
    wrapped = textwrap.wrap(clean, width=34) or [clean]
    parts = [f'<text x="{x}" y="{y}" text-anchor="{anchor}" class="count">{count}</text>']
    for index, line in enumerate(wrapped):
        parts.append(
            f'<text x="{x}" y="{y + 29 + index * 25}" text-anchor="{anchor}" '
            f'class="detail">{escape(line)}</text>'
        )
    return "".join(parts)


def render_svg(counts: dict) -> str:
    total = counts["source_cases"]
    eligible = counts["language_candidates"]
    excluded = counts["excluded_cases"]
    outcomes = [
        ("successful", counts["successful_datapoints"], "Successful datapoints", "#2f7ed8", 160),
        ("failed", counts["failed_datapoints"], "Failed datapoints", "#ed6434", 390),
        ("blocked", counts["blocked_cases"], "Blocked cases", "#f49a5b", 620),
        ("pending", counts["pending_cases"], "Work pending", "#b9b9b5", 850),
    ]
    detail_count = (len(counts["oracle_occurrences"])
                    + len(counts["failure_categories"])
                    + len(counts["blocker_categories"]))
    canvas_height = max(1160, 420 + detail_count * 125)
    source_height = 720
    candidate_height = max(20, source_height * eligible / max(total, 1))
    rejected_height = source_height - candidate_height
    svg = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="{canvas_height}" '
        f'viewBox="0 0 2048 {canvas_height}">',
        '<style>.count{font:700 34px Arial,sans-serif;fill:#151515}'
        '.detail{font:22px Arial,sans-serif;fill:#575757}</style>',
        '<rect width="100%" height="100%" fill="#fff"/>',
    ]
    svg.append(flow(325, 210, candidate_height, 650, 160, candidate_height, "#3079d7", 0.28))
    svg.append(flow(325, 210 + candidate_height, rejected_height,
                    650, 400, rejected_height, "#aaa9a6", 0.48))
    source_offset = 0.0
    outcome_geometry = []
    for key, count, name, color, y in outcomes:
        if not count:
            continue
        width = candidate_height * count / max(eligible, 1)
        height = max(width, 5)
        svg.append(flow(675, 160 + source_offset, width, 1100, y, height, color))
        outcome_geometry.append((key, count, name, color, y, height))
        source_offset += width
    detail_y = 120
    detail_specs = [
        ("successful", counts["oracle_occurrences"], ORACLE_LABELS, "#2f7ed8"),
        ("failed", counts["failure_categories"], {}, "#ed6434"),
        ("blocked", counts["blocker_categories"], {}, "#f49a5b"),
    ]
    for outcome_key, categories, names, color in detail_specs:
        geometry = next((item for item in outcome_geometry if item[0] == outcome_key), None)
        if not geometry or not categories:
            continue
        _, _, _, _, outcome_y, outcome_height = geometry
        category_total = sum(categories.values())
        source_part = 0.0
        for category, count in sorted(categories.items()):
            part = outcome_height * count / category_total
            target_height = max(part, 7)
            svg.append(flow(1125, outcome_y + source_part, part,
                            1690, detail_y, target_height, color, 0.32))
            svg.append(node(1690, detail_y, target_height, color))
            svg.append(label(1735, detail_y + 27, count, names.get(category, category)))
            label_lines = len(textwrap.wrap(re.sub(r"[.;]", "", names.get(category, category)), width=34))
            detail_y += max(90, target_height + 45, 65 + 25 * label_lines)
            source_part += part
    svg.extend([
        node(300, 210, source_height, "#777775"),
        node(650, 160, candidate_height, "#2f7ed8"),
        node(650, 400, rejected_height, "#777775"),
        label(280, 125, total, "Vulhub cases", "end"),
        label(640, 75, eligible, "JavaScript and Python", "end"),
        label(640, 315, excluded, "Other target languages", "end"),
    ])
    for key, count, name, color, y in outcomes:
        geometry = next((item for item in outcome_geometry if item[0] == key), None)
        height = geometry[5] if geometry else 5
        svg.append(node(1100, y, height, color))
        svg.append(label(1090, y - 42, count, name, "end"))
    svg.append('</svg>')
    return "\n".join(svg) + "\n"


def render_readme(counts: dict) -> str:
    status = counts["status_counts"]
    branches = counts["published_source_branches"]
    lines = [
        "# Vulhub benchmark",
        "",
        "This benchmark ports vulnerable JavaScript and Python applications from a pinned Vulhub revision.",
        "",
        "![Vulhub benchmark funnel](figure.svg)",
        "",
        "## Source and selection",
        "",
        f"The source revision is [`{counts['vulhub_revision']}`](https://github.com/vulhub/vulhub/commit/{counts['vulhub_revision']}).",
        "A case is one directory with a Docker Compose file at that revision.",
        "The language decision uses the vulnerable application runtime and source code.",
        "PoC scripts and container configuration do not determine the language.",
        "",
        "## Version grouping",
        "",
        "Each vulnerability keeps its own datapoint and source branch.",
        "Cases in one application share the earliest version on which every grouped exploit was reproduced.",
        "A version joins a group only after a live exploit test confirms it.",
        "",
        "## Current status",
        "",
        f"The count data comes from the manager ledger and was generated at `{counts['generated_at']}`.",
        f"The inventory has {counts['source_cases']} cases.",
        f"Language selection keeps {counts['language_candidates']} candidates and excludes {counts['excluded_cases']} cases.",
        f"There are {status['successful']} passing datapoints, {status['failed']} failed cases, {status['blocked']} blocked cases, and {counts['pending_cases']} cases still in progress.",
        f"Passing datapoints have {counts['oracle_occurrence_total']} validated oracle occurrences.",
        "The figure and [`counts.json`](counts.json) use these ledger totals.",
        "",
        "## Failure categories",
        "",
    ]
    if counts["failure_categories"] or counts["blocker_categories"]:
        for category, count in counts["failure_categories"].items():
            lines.append(f"- {count} failed: {category}")
        for category, count in counts["blocker_categories"].items():
            lines.append(f"- {count} blocked: {category}")
    else:
        lines.append("No cases have a confirmed failure or blocker yet.")
    lines.extend(["", "## Published source branches", ""])
    if branches:
        for branch in sorted(branches, key=lambda item: item["id"]):
            lines.append(f"- [`{branch['id']}`](https://github.com/Jay-l-Break/dojo-vulhub/tree/{branch['id']}) at `{branch['commit']}`")
    else:
        lines.append("No source branch is published yet.")
    lines.extend(["", "## Validation", ""])
    lines.append(
        "A datapoint passes only when a fresh deployment, its mapped PoC, and every claimed validation server oracle pass the programmatic checker."
    )
    lines.append("Private flags, verifier settings, and deployment credentials stay outside source branches and this publication.")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("ledger", type=Path)
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parent.parent)
    args = parser.parse_args()
    ledger = read_ledger(args.ledger)
    counts = build_counts(ledger)
    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / "counts.json").write_text(json.dumps(counts, indent=2) + "\n")
    (args.output / "figure.svg").write_text(render_svg(counts))
    (args.output / "README.md").write_text(render_readme(counts))
    print(f"{counts['source_cases']} source cases, {counts['language_candidates']} candidates")


if __name__ == "__main__":
    main()
