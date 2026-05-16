from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import random

app = Flask(__name__)
CORS(app)

# LOAD TRAINED MODELS
model = pickle.load(open("category_model.pkl", "rb"))
modelPriority = pickle.load(open("priority_model.pkl", "rb"))
tfidf = pickle.load(open("tfidf.pkl", "rb"))

# CLEAN TEXT
def clean_text(text):
    return text.lower()

@app.route('/predict', methods=['POST'])
def predict():

    data = request.json

    description = data['description']

    # CLEAN
    sample_clean = [clean_text(description)]

    # VECTORIZE
    sample_vector = tfidf.transform(sample_clean)

    # CATEGORY PREDICTION
    category_prediction = model.predict(sample_vector)

    # PRIORITY PREDICTION
    priority_prediction = modelPriority.predict(sample_vector)

    priority = priority_prediction[0]

    # RISK SCORE
    if priority == "Critical":
        risk_score = random.randint(91, 100)

    elif priority == "High":
        risk_score = random.randint(71, 90)

    elif priority == "Medium":
        risk_score = random.randint(31, 70)

    else:
        risk_score = random.randint(1, 30)

    return jsonify({
        "category": category_prediction[0],
        "priority": priority,
        "risk_score": risk_score
    })

if __name__ == "__main__":
    app.run(port=5001, debug=True)