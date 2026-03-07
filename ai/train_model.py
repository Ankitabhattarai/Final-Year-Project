import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os

def train_model():
    # Load data
    data_path = os.path.join(os.path.dirname(__file__), 'waiting_time_data.csv')
    if not os.path.exists(data_path):
        print("Data file not found. Run data_generator.py first.")
        return
        
    df = pd.read_csv(data_path)
    
    # Simple feature selection for Ridge Regression
    # In a real scenario, we might one-hot encode doctor_id and department_id
    # But for a baseline, we can use them as categorical numbers or drop them if they are too many
    # Here we'll use them as is for simplicity, assuming they are ordinally mapped or fewer in number
    # Better: Use one-hot for dept_id if it's small
    
    df = pd.get_dummies(df, columns=['department_id'], prefix='dept')
    
    X = df.drop(['waiting_time', 'doctor_id'], axis=1) # Dropping doctor_id for now to keep it simple
    y = df['waiting_time']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Initialize and train Ridge Regression
    # alpha is the regularization strength
    model = Ridge(alpha=1.0)
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"Model trained.")
    print(f"Mean Squared Error: {mse:.4f}")
    print(f"R2 Score: {r2:.4f}")
    
    # Save model and feature names (important for prediction)
    model_path = os.path.join(os.path.dirname(__file__), 'waiting_time_model.pkl')
    features_path = os.path.join(os.path.dirname(__file__), 'feature_names.pkl')
    
    joblib.dump(model, model_path)
    joblib.dump(X.columns.tolist(), features_path)
    
    print(f"Model saved to {model_path}")
    print(f"Feature names saved to {features_path}")

if __name__ == "__main__":
    train_model()
