import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Digital Saathi" in data["app"]

@pytest.mark.asyncio
async def test_auth_workflow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Register
        reg_payload = {
            "email": "testuser@digitalsaathi.in",
            "full_name": "Ramesh Kumar",
            "password": "Password123!"
        }
        res_reg = await ac.post("/api/v1/auth/register", json=reg_payload)
        assert res_reg.status_code in [201, 400]  # 400 if already created in persistent test db
        
        # 2. Login
        login_payload = {
            "email": "testuser@digitalsaathi.in",
            "password": "Password123!"
        }
        res_login = await ac.post("/api/v1/auth/login", json=login_payload)
        assert res_login.status_code == 200
        token_data = res_login.json()
        assert "access_token" in token_data
        token = token_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 3. Profile /me
        res_me = await ac.get("/api/v1/auth/me", headers=headers)
        assert res_me.status_code == 200
        assert res_me.json()["email"] == "testuser@digitalsaathi.in"

        # 4. Preferences GET & PATCH
        res_pref = await ac.get("/api/v1/preferences", headers=headers)
        assert res_pref.status_code == 200
        assert res_pref.json()["preferred_language"] in ["hi", "en"]

        res_patch = await ac.patch("/api/v1/preferences", json={"text_scale": "large", "high_contrast": True}, headers=headers)
        assert res_patch.status_code == 200
        assert res_patch.json()["text_scale"] == "large"
        assert res_patch.json()["high_contrast"] is True

@pytest.mark.asyncio
async def test_assistant_chat():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Register or login
        res_login = await ac.post("/api/v1/auth/login", json={"email": "testuser@digitalsaathi.in", "password": "Password123!"})
        token = res_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        chat_payload = {
            "message": "मुझे यह फॉर्म भरने में मदद चाहिए।",
            "language": "hi"
        }
        res_chat = await ac.post("/api/v1/assistant/chat", json=chat_payload, headers=headers)
        assert res_chat.status_code == 200
        data = res_chat.json()
        assert "answer" in data
        assert data["language"] == "hi"
        assert data["intent"] in ["form_guidance", "general_query"]

@pytest.mark.asyncio
async def test_scam_analysis_high_risk():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res_login = await ac.post("/api/v1/auth/login", json={"email": "testuser@digitalsaathi.in", "password": "Password123!"})
        token = res_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Known scam message with OTP and urgency
        msg = "Your SBI bank account will be blocked today. Click http://bit.ly/sbi-verify and share your OTP immediately to avoid penalty."
        res_scam = await ac.post("/api/v1/scams/analyze", json={"message": msg, "language": "hi"}, headers=headers)
        assert res_scam.status_code == 200
        data = res_scam.json()
        assert data["risk_level"] == "High"
        assert len(data["detected_warning_signs"]) >= 2
        assert any("1930" in link for link in data["official_reporting_links"])

@pytest.mark.asyncio
async def test_scam_analysis_low_risk_false_positive_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res_login = await ac.post("/api/v1/auth/login", json={"email": "testuser@digitalsaathi.in", "password": "Password123!"})
        token = res_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Legitimate message
        legit_msg = "Hello Ramesh, dinner will be served at 8 PM. Please bring the fruits."
        res_scam = await ac.post("/api/v1/scams/analyze", json={"message": legit_msg, "language": "en"}, headers=headers)
        assert res_scam.status_code == 200
        data = res_scam.json()
        assert data["risk_level"] == "Low"

@pytest.mark.asyncio
async def test_form_explain():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res_login = await ac.post("/api/v1/auth/login", json={"email": "testuser@digitalsaathi.in", "password": "Password123!"})
        token = res_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        payload = {"field_label": "Annual household income", "language": "hi"}
        res_form = await ac.post("/api/v1/forms/explain", json=payload, headers=headers)
        assert res_form.status_code == 200
        data = res_form.json()
        assert "परिवार" in data["simple_explanation"] or "income" in data["simple_explanation"].lower()
        assert len(data["required_documents_hint"]) > 0

@pytest.mark.asyncio
async def test_document_lifecycle():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res_login = await ac.post("/api/v1/auth/login", json={"email": "testuser@digitalsaathi.in", "password": "Password123!"})
        token = res_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Upload a sample text document
        sample_file_content = (
            b"ELECTRICITY BILL\n"
            b"Consumer Name: Ramesh Kumar\n"
            b"Total Amount Due: Rs. 1450.00\n"
            b"Due Date: 25/10/2026\n"
            b"Please pay before the due date to avoid disconnection."
        )
        files = {"file": ("bill.txt", sample_file_content, "text/plain")}
        res_upload = await ac.post("/api/v1/documents/upload", files=files, headers=headers)
        assert res_upload.status_code == 201
        doc_data = res_upload.json()
        doc_id = doc_data["id"]
        assert doc_data["original_filename"] == "bill.txt"

        # Summarize
        res_sum = await ac.post(f"/api/v1/documents/{doc_id}/summarize", headers=headers)
        assert res_sum.status_code == 200
        sum_data = res_sum.json()
        assert "summary" in sum_data
        assert len(sum_data["important_dates"]) > 0 or len(sum_data["amounts_mentioned"]) > 0

        # Ask question
        res_ask = await ac.post(f"/api/v1/documents/{doc_id}/ask", json={"question": "What is the due date?", "language": "en"}, headers=headers)
        assert res_ask.status_code == 200
        ask_data = res_ask.json()
        assert "answer" in ask_data

        # Delete document
        res_del = await ac.delete(f"/api/v1/documents/{doc_id}", headers=headers)
        assert res_del.status_code == 200
