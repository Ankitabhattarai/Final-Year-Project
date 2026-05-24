import os

from flask import Flask, jsonify, request

from predict import load_model_and_features, predict_one
from train_model import train_model


app = Flask(__name__)


def ensure_model_ready():
    model, feature_names = load_model_and_features()
    if model is not None and feature_names is not None:
        return model, feature_names

    train_model()
    model, feature_names = load_model_and_features()
    if model is None or feature_names is None:
        raise RuntimeError('Model files are not available after training.')

    return model, feature_names


MODEL, FEATURE_NAMES = ensure_model_ready()


@app.get('/api/health')
def health():
    return jsonify({
        'success': True,
        'message': 'AI service is running',
        'status': 'OK'
    })


@app.get('/api/ai/predict')
def predict_wait_time():
    try:
        payload = request.get_json(silent=True) or request.args.to_dict(flat=True)
        if not payload:
            return jsonify({'success': False, 'message': 'Input data is required'}), 400

        predicted_wait = predict_one(MODEL, FEATURE_NAMES, payload)
        return jsonify({
            'success': True,
            'data': {
                'predicted_waiting_time': predicted_wait
            }
        })
    except Exception as error:
        return jsonify({'success': False, 'message': str(error)}), 500


@app.post('/api/ai/predict')
def predict_wait_time_post():
    return predict_wait_time()


@app.get('/api/ai/recommend')
def recommend_best_slot():
    try:
        payload = request.get_json(silent=True)
        if payload is None:
            payload = request.args.get('options')
            if payload:
                import json
                payload = json.loads(payload)

        if not isinstance(payload, list) or len(payload) == 0:
            return jsonify({'success': False, 'message': 'Input must be a non-empty list of slot options'}), 400

        results = []
        for option in payload:
            wait_time = predict_one(MODEL, FEATURE_NAMES, option)
            results.append({
                'option': option,
                'predicted_wait_min': wait_time
            })

        results.sort(key=lambda item: item['predicted_wait_min'])
        return jsonify({
            'success': True,
            'data': {
                'recommended': results[0],
                'all_results': results
            }
        })
    except Exception as error:
        return jsonify({'success': False, 'message': str(error)}), 500


@app.post('/api/ai/recommend')
def recommend_best_slot_post():
    return recommend_best_slot()


@app.get('/api/ai/quick-suggestion')
def quick_suggestion():
    try:
        payload = request.get_json(silent=True)
        if payload is None:
            payload = request.args.get('options')
            if payload:
                import json
                payload = json.loads(payload)

        if not isinstance(payload, list) or len(payload) == 0:
            return jsonify({'success': False, 'message': 'Input must be a non-empty list of slot options'}), 400

        results = []
        for option in payload:
            wait_time = predict_one(MODEL, FEATURE_NAMES, option)
            results.append({
                'option': option,
                'predicted_wait_min': wait_time
            })

        results.sort(key=lambda item: item['predicted_wait_min'])
        return jsonify({
            'success': True,
            'data': results[:4]
        })
    except Exception as error:
        return jsonify({'success': False, 'message': str(error)}), 500


@app.post('/api/ai/quick-suggestion')
def quick_suggestion_post():
    return quick_suggestion()


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port)