from __future__ import annotations

from fastapi.testclient import TestClient


def test_health_endpoint_reports_api_and_core_status() -> None:
    from elvquant_front.api import create_app

    client = TestClient(create_app())

    response = client.get("/api/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["service"] == "elvquant_front"
    assert payload["frontend"] == "react"
    assert "core_available" in payload


def test_workflows_endpoint_returns_operator_safe_shape() -> None:
    from elvquant_front.api import create_app

    client = TestClient(create_app())

    response = client.get("/api/workflows")

    assert response.status_code == 200
    payload = response.json()
    assert isinstance(payload["core_available"], bool)
    assert isinstance(payload["workflows"], list)
    if payload["workflows"]:
        workflow = payload["workflows"][0]
        assert {"id", "name", "description", "category"}.issubset(workflow)


def test_stooq_status_endpoint_is_safe_when_core_is_missing() -> None:
    from elvquant_front.api import create_app
    client = TestClient(create_app())

    response = client.get("/api/stooq/status")

    assert response.status_code == 200
    payload = response.json()
    assert "available" in payload
    assert "message" in payload
    assert "traceback" not in str(payload).lower()


def test_artifacts_endpoint_returns_list_shape() -> None:
    from elvquant_front.api import create_app
    client = TestClient(create_app())

    response = client.get("/api/artifacts")

    assert response.status_code == 200
    payload = response.json()
    assert isinstance(payload["artifacts"], list)

