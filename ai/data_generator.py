import pandas as pd
import numpy as np
import os

# Set seed for reproducibility
np.random.seed(42)

def generate_data(num_records=1000):
    # Features
    queue_length = np.random.randint(0, 20, num_records)
    avg_consult_time = np.random.uniform(5, 20, num_records)
    
    # IDs (Simplified for linear regression/ridge)
    doctor_ids = np.random.randint(1, 11, num_records)
    dept_ids = np.random.randint(1, 5, num_records)
    
    # Temporal features
    day_of_week = np.random.randint(0, 7, num_records)
    hour_of_day = np.random.randint(9, 18, num_records) # 9 AM to 6 PM
    
    # Priority: 0 (Low) to 3 (Emergency)
    priority = np.random.randint(0, 4, num_records)
    
    # No-show rate (0 to 0.3)
    no_show_rate = np.random.uniform(0, 0.3, num_records)
    
    # Formula for target: Waiting Time (min)
    # Base: 5 mins
    # + QueueLength * AvgConsultTime
    # + small random noise
    # + adjustment for priority (Higher priority = lower wait, but let's assume it affects order)
    # For a simple regression, we'll make it mostly linear:
    waiting_time = 5 + (queue_length * avg_consult_time) + (hour_of_day * 0.5) + (priority * -2) + np.random.normal(0, 2, num_records)
    
    # Ensure no negative waiting times
    waiting_time = np.maximum(0, waiting_time)
    
    data = pd.DataFrame({
        'queue_length': queue_length,
        'avg_consult_time': avg_consult_time,
        'doctor_id': doctor_ids,
        'department_id': dept_ids,
        'day_of_week': day_of_week,
        'hour_of_day': hour_of_day,
        'priority': priority,
        'no_show_rate': no_show_rate,
        'waiting_time': waiting_time
    })
    
    return data

if __name__ == "__main__":
    df = generate_data(2000)
    output_path = os.path.join(os.path.dirname(__file__), 'waiting_time_data.csv')
    df.to_csv(output_path, index=False)
    print(f"Synthetic data generated at {output_path}")
