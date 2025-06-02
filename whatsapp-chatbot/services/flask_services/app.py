from flask import Flask, request, jsonify
from nlp_service import classify_text_urgency
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Issue classification service is up and running!"})

@app.route("/classify", methods=["POST"])
def classify():
    data = request.get_json()
    text = data.get("text", "")
    
    if not text:
        return jsonify({"error": "Text is required"}), 400

    urgency = classify_text_urgency(text)
    return jsonify({"urgency": urgency})

if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    app.run(debug=True, port=port)
