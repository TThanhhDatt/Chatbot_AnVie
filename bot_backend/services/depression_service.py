from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import logging
import os
from dotenv import load_dotenv
logger = logging.getLogger(__name__)

# Define label mapping
label_mapping = {
    0: "Minimal",
    1: "Mild",
    2: "Moderate",
    3: "Moderately Severe",
    4: "Severe"
}

# Define Hugging Face model name
MODEL_NAME = "TTDattt/PhoBERT-DepressionClassification-fine-tune"
token = os.getenv("HUGGINGFACE_TOKEN")
try:
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, use_auth_token=token)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME, use_auth_token=token)
    logger.info(f"Loaded model and tokenizer from Hugging Face: {MODEL_NAME}")
except Exception as e:
    logger.error(f"Error loading model/tokenizer from Hugging Face: {str(e)}")
    tokenizer, model = None, None

def analyze_depression(message: str) -> dict:
    try:
        if not tokenizer or not model:
            raise ValueError("Model or tokenizer not initialized")
        
        # Tokenize input message
        inputs = tokenizer(message, return_tensors="pt", truncation=True, padding=True, max_length=512)
        
        # Perform inference
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            probabilities = torch.softmax(logits, dim=1).squeeze().tolist()
        
        # Get predicted label
        predicted_label_id = torch.argmax(logits, dim=1).item()
        predicted_label = label_mapping.get(predicted_label_id, "Unknown")
        
        # Log results
        logger.info(f"Depression analysis for '{message}': Label: {predicted_label}, Probabilities: {probabilities}")
        
        return {
            "message": message,
            "depression_severity": predicted_label,
            "probabilities": {label_mapping[i]: prob for i, prob in enumerate(probabilities)},
        }
    except Exception as e:
        logger.error(f"Depression analysis error: {str(e)}")
        return {
            "message": message,
            "depression_severity": "error",
            "probabilities": {label: 0.0 for label in label_mapping.values()},
        }