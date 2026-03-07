import joblib
import pandas as pd
import numpy as np
import os
import sys
import json

def load_model_and_features():
    model_path = os.path.join(os.path.dirname(__file__), 'waiting_time_model.pkl')
    features_path = os.path.join(os.path.dirname(__file__), 'feature_names.pkl')
    
    if not os.path.exists(model_path) or not os.path.exists(features_path):
        return None, None
        
    model = joblib.load(model_path)
    feature_names = joblib.load(features_path)
    return model, feature_names

def predict_one(model, feature_names, input_data):
    """
    input_data: dictionary containing features
    """
    # Create a DataFrame for prediction
    df_input = pd.DataFrame([input_data])
    
    # One-hot encode department_id if present (must match training)
    if 'department_id' in df_input.columns:
        df_input = pd.get_dummies(df_input, columns=['department_id'], prefix='dept')
    
    # Ensure all features from training are present
    for col in feature_names:
        if col not in df_input.columns:
            df_input[col] = 0
            
    # Reorder columns to match training
    df_input = df_input[feature_names]
    
    prediction = model.predict(df_input)
    return float(prediction[0])

def predict(input_data):
    model, feature_names = load_model_and_features()
    if model is None:
        return {"error": "Model or features file not found. Train the model first."}
    return predict_one(model, feature_names, input_data)

if __name__ == "__main__":
    # Example usage via command line arg (JSON string)
    if len(sys.argv) > 1:
        try:
            input_json = sys.argv[1]
            data = json.loads(input_json)
            result = predict(data)
            print(json.dumps({"predicted_waiting_time": result}))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
    else:
        # Sample test
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
        print(f"Sample Input: {sample_input}")
        print(f"Predicted Waiting Time: {result:.2f} minutes")
