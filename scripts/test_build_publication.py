"""Checks for published local source audit evidence."""

import copy
import unittest

from build_publication import build_counts


class LocalSourceAuditTest(unittest.TestCase):
    def setUp(self) -> None:
        self.ledger = {
            "benchmark": "dojo-vulhub",
            "vulhub_revision": "v" * 40,
            "entries": [{
                "vulnerability_id": "sample-001",
                "final_status": "successful",
                "language_decision": "Python",
                "claimed_oracles": ["other"],
                "source_branch_commit": "a" * 40,
                "version_group": "sample-1",
                "local_runtime_audit": {
                    "status": "passed",
                    "root_dockerfile": True,
                    "docker_build": True,
                    "docker_run": True,
                    "container_port": 80,
                    "http_status": 404,
                    "direct_http_ready": True,
                    "tested_source_commit": "a" * 40,
                },
            }],
        }

    def test_accepts_current_source_and_http_response(self) -> None:
        counts = build_counts(self.ledger)
        self.assertEqual(counts["local_source_audit"]["status_counts"]["passed"], 1)

    def test_rejects_stale_commit_or_server_error(self) -> None:
        stale = copy.deepcopy(self.ledger)
        stale["entries"][0]["local_runtime_audit"]["tested_source_commit"] = "b" * 40
        with self.assertRaisesRegex(ValueError, "Incomplete local runtime evidence"):
            build_counts(stale)

        server_error = copy.deepcopy(self.ledger)
        server_error["entries"][0]["local_runtime_audit"]["http_status"] = 503
        with self.assertRaisesRegex(ValueError, "Incomplete local runtime evidence"):
            build_counts(server_error)

    def test_requires_ready_public_compose_when_present(self) -> None:
        compose = copy.deepcopy(self.ledger)
        audit = compose["entries"][0]["local_runtime_audit"]
        audit.update({
            "root_compose_present": True,
            "root_compose_config_valid": True,
            "root_compose_zero_env_config_valid": True,
            "root_compose_uses_root_dockerfile": True,
            "root_compose_ready": False,
            "root_compose_host_port_80": True,
            "root_compose_public_bind": True,
        })
        with self.assertRaisesRegex(ValueError, "Incomplete local runtime evidence"):
            build_counts(compose)

        audit["root_compose_ready"] = True
        audit["direct_http_ready"] = False
        counts = build_counts(compose)
        self.assertEqual(counts["local_source_audit"]["status_counts"]["passed"], 1)

        audit["root_compose_zero_env_config_valid"] = False
        with self.assertRaisesRegex(ValueError, "Incomplete local runtime evidence"):
            build_counts(compose)

        audit["root_compose_zero_env_config_valid"] = True
        audit["root_compose_uses_root_dockerfile"] = False
        with self.assertRaisesRegex(ValueError, "Incomplete local runtime evidence"):
            build_counts(compose)

    def test_compose_does_not_replace_root_dockerfile(self) -> None:
        compose = copy.deepcopy(self.ledger)
        audit = compose["entries"][0]["local_runtime_audit"]
        audit.update({
            "root_dockerfile": False,
            "root_compose_present": True,
            "root_compose_config_valid": True,
            "root_compose_zero_env_config_valid": True,
            "root_compose_uses_root_dockerfile": True,
            "root_compose_ready": True,
            "root_compose_host_port_80": True,
            "root_compose_public_bind": True,
        })
        with self.assertRaisesRegex(ValueError, "Incomplete local runtime evidence"):
            build_counts(compose)


if __name__ == "__main__":
    unittest.main()
