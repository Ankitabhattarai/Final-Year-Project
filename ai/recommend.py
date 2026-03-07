import sys
import json
import os
from predict import load_model_and_features, predict_one

def recommend_best_slot(options):
    """
    options: List of dictionaries, each being a potential slot/doctor input
    Returns the option with the minimum predicted wait time.
    """
    model, feature_names = load_model_and_features()
    if model is None:
        return {"error": "Model not trained."}
    
    results = []
    for opt in options:
        wait_time = predict_one(model, feature_names, opt)
        results.append({
            "option": opt,
            "predicted_wait_min": wait_time
        })
    
    # Sort by wait time
    results.sort(key=lambda x: x["predicted_wait_min"])
    
    return {
        "recommended": results[0],
        "all_results": results
    }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        try:
            input_data = json.loads(sys.argv[1])
            # Expecting a list of options
            if isinstance(input_data, list):
                print(json.dumps(recommend_best_slot(input_data)))
            else:
                print(json.dumps({"error": "Input must be a list of slot options."}))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
    else:
        # Demo/Internal Test
        test_options = [
            {"queue_length": 10, "avg_consult_time": 10, "day_of_week": 1, "hour_of_day": 10, "priority": 1, "no_show_rate": 0.1, "department_id": 1, "doctor_name": "Dr. Smith"},
            {"queue_length": 2, "avg_consult_time": 15, "day_of_week": 1, "hour_of_day": 10, "priority": 1, "no_show_rate": 0.05, "department_id": 1, "doctor_name": "Dr. Doe"},
            {"queue_length": 5, "avg_consult_time": 8, "day_of_week": 1, "hour_of_day": 11, "priority": 1, "no_show_rate": 0.1, "department_id": 1, "doctor_name": "Dr. Smith (Next Hour)"}
        ]
        print("Testing Recommendation Engine...")
        result = recommend_best_slot(test_options)
        print(f"Recommended: {result['recommended']['option']['doctor_name']} with {result['recommended']['predicted_wait_min']:.2f} mins wait.")
