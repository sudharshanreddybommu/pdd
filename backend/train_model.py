import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

def train():
    csv_path = os.path.join(os.path.dirname(__file__), "oral_cancer_prediction_dataset.csv")
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found.")
        return

    print("Loading dataset...")
    df = pd.read_csv(csv_path)
    print(f"Dataset loaded successfully with {len(df)} rows.")

    # Relevant feature columns matching patient symptoms/habits
    feature_cols = [
        'Tobacco Use',
        'Alcohol Consumption',
        'Betel Quid Use',
        'Poor Oral Hygiene',
        'Oral Lesions',
        'Unexplained Bleeding',
        'Difficulty Swallowing',
        'White or Red Patches in Mouth'
    ]

    target_col = 'Oral Cancer (Diagnosis)'

    # Convert Yes/No strings to 1/0
    X = pd.DataFrame()
    for col in feature_cols:
        X[col] = df[col].map({'Yes': 1, 'No': 0}).fillna(0)

    y = df[target_col].map({'Yes': 1, 'No': 0}).fillna(0)

    print("Splitting dataset into train and test sets...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training Random Forest Classifier on 84,922 patient clinical records...")
    rf_model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    rf_model.fit(X_train, y_train)

    y_pred = rf_model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n--- MODEL TRAINING RESULTS ---")
    print(f"Test Accuracy: {acc * 100:.2f}%")
    print("\nClassification Report:\n", classification_report(y_test, y_pred))

    model_path = os.path.join(os.path.dirname(__file__), "oral_cancer_model.pkl")
    with open(model_path, "wb") as f:
        pickle.dump(rf_model, f)
    print(f"Model saved successfully to {model_path}")

if __name__ == "__main__":
    train()
