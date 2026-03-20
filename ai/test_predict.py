import pytest
from unittest.mock import patch, MagicMock
import json
import os
from predict import predict

@patch('predict.load_model_and_features')
def test_predict_basic(mock_load):
    # Mocking the model and features
    mock_model = MagicMock()
    mock_model.predict.return_value = [15.5]
    mock_load.return_value = (mock_model, ['queue_length', 'avg_consult_time'])
    
    sample_input = {
        "queue_length": 5,
        "avg_consult_time": 10.5,
        "day_of_week": 1,
        "hour_of_day": 10,
        "priority": 1,
        "no_show_rate": 0.1,
        "department_id": 2
    }
    result = predict(sample_input)
    assert isinstance(result, float)
    assert result == 15.5

@patch('predict.load_model_and_features')
def test_predict_error_handling(mock_load):
    mock_load.return_value = (None, None)
    
    sample_input = {"test": 1}
    result = predict(sample_input)
    assert isinstance(result, dict)
    assert "error" in result
