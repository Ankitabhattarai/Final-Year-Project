import pytest
from unittest.mock import patch, MagicMock
import json
from recommend import recommend_best_slot

@patch('recommend.load_model_and_features')
@patch('recommend.predict_one')
def test_recommendation_logic(mock_predict, mock_load):
    mock_load.return_value = (MagicMock(), ['f1'])
    # Return different wait times for different options
    mock_predict.side_effect = [100.0, 15.0]
    
    test_options = [
        {"doctor_name": "Dr. Smith"},
        {"doctor_name": "Dr. Doe"},
    ]
    
    result = recommend_best_slot(test_options)
    
    assert result["recommended"]["option"]["doctor_name"] == "Dr. Doe"
    assert result["recommended"]["predicted_wait_min"] == 15.0
    assert len(result["all_results"]) == 2
