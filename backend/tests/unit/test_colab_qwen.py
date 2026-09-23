import pytest
from unittest.mock import patch, MagicMock
import os
import httpx

from app.specialists.colab_qwen import ColabQwenSpecialist
from app.schemas.request import AnalysisRequest, InputConfiguration, InputItem
from app.schemas.common import InputConfigType

@pytest.fixture
def specialist():
    return ColabQwenSpecialist()

@pytest.fixture
def mock_request():
    return AnalysisRequest(
        query="Is there a building?",
        input_configuration=InputConfiguration(type=InputConfigType.SINGLE_IMAGE),
        inputs=[InputItem(url="test.tif", type="image/tiff", metadata={"bytes": "base64_encoded_image_data"})]
    )

def test_can_handle_no_env_var(specialist, mock_request):
    if "COLAB_API_URL" in os.environ:
        del os.environ["COLAB_API_URL"]
    assert specialist.can_handle(mock_request) == False
    
    # Also test health
    health = specialist.health()
    assert health.status == "UNCONFIGURED"

def test_can_handle_with_env_var(specialist, mock_request):
    os.environ["COLAB_API_URL"] = "http://mock-colab-url"
    assert specialist.can_handle(mock_request) == True
    
    # Also test health
    health = specialist.health()
    assert health.status == "OK"

@patch("httpx.Client")
def test_analyze_success(mock_client_class, specialist, mock_request):
    os.environ["COLAB_API_URL"] = "http://mock-colab-url"
    
    # Setup mock client context manager
    mock_client = MagicMock()
    mock_client_class.return_value.__enter__.return_value = mock_client
    
    mock_response = MagicMock()
    mock_response.json.return_value = {"answer": "Yes, there is a building.", "model": "Qwen2-VL-7B-Instruct"}
    mock_client.post.return_value = mock_response

    result = specialist.analyze(mock_request)

    assert result.status == "SUCCESS"
    assert result.answer == "Yes, there is a building."
    assert result.model.checkpoint == "Qwen2-VL-7B-Instruct"

    # Verify request construction and task type propagation
    mock_client.post.assert_called_once()
    args, kwargs = mock_client.post.call_args
    assert args[0] == "http://mock-colab-url/analyze"
    
    payload = kwargs.get("json")
    assert payload is not None
    assert payload["query"] == "Is there a building?"
    assert payload["images"] == ["base64_encoded_image_data"]
    assert payload["task_type"] == "SINGLE_IMAGE"
    
    # Verify timeout configuration was passed to the Client constructor
    client_kwargs = mock_client_class.call_args.kwargs
    assert client_kwargs.get("timeout") == 120.0

@patch("httpx.Client")
def test_analyze_timeout(mock_client_class, specialist, mock_request):
    os.environ["COLAB_API_URL"] = "http://mock-colab-url"
    
    mock_client = MagicMock()
    mock_client_class.return_value.__enter__.return_value = mock_client
    mock_client.post.side_effect = httpx.TimeoutException("Timeout from Colab")

    result = specialist.analyze(mock_request)

    assert result.status == "FAILED"
    assert "time" in result.answer.lower()
    assert "TimeoutException" in result.warnings

@patch("httpx.Client")
def test_analyze_http_error(mock_client_class, specialist, mock_request):
    os.environ["COLAB_API_URL"] = "http://mock-colab-url"
    
    mock_client = MagicMock()
    mock_client_class.return_value.__enter__.return_value = mock_client
    
    # Example of a network error
    mock_client.post.side_effect = httpx.RequestError("Network Unreachable", request=MagicMock())

    result = specialist.analyze(mock_request)

    assert result.status == "FAILED"
    assert "network" in result.answer.lower()
    assert "RequestError" in result.warnings

@patch("httpx.Client")
def test_analyze_empty_answer(mock_client_class, specialist, mock_request):
    os.environ["COLAB_API_URL"] = "http://mock-colab-url"
    
    mock_client = MagicMock()
    mock_client_class.return_value.__enter__.return_value = mock_client
    
    mock_response = MagicMock()
    mock_response.json.return_value = {"answer": ""}
    mock_client.post.return_value = mock_response

    result = specialist.analyze(mock_request)

    assert result.status == "FAILED"
    assert "empty answer" in result.answer.lower()
