import os
import joblib
from app.config import Config
from app.ml.train_models import train_and_save_models

class SentimentService:
    _sent_model = None

    @classmethod
    def get_sentiment_model(cls):
        model_path = os.path.join(Config.MODEL_FOLDER, "sentiment_model.joblib")
        if cls._sent_model is None:
            if not os.path.exists(model_path):
                train_and_save_models()
            try:
                cls._sent_model = joblib.load(model_path)
            except Exception:
                train_and_save_models()
                cls._sent_model = joblib.load(model_path)
        return cls._sent_model

    @classmethod
    def analyze_sentiment(cls, comment):
        """
        Analyzes text sentiment returning label ('Positive', 'Neutral', 'Negative'),
        confidence (0.0 to 1.0), and numerical sentiment score (-1.0 to +1.0).
        """
        if not comment or len(comment.strip()) < 3:
            return {
                "sentiment": "Neutral",
                "confidence": 0.50,
                "sentiment_score": 0.0
            }

        text = comment.lower().strip()
        
        # Rule-assisted sentiment dictionary for fast local evaluation
        neg_words = ['terrible', 'worst', 'horrible', 'waste', 'broken', 'defective', 'unusable', 'annoyed', 'disappointed', 'cheap', 'flimsy', 'scratched', 'poor', 'hate', 'bad', 'drains']
        pos_words = ['loved', 'great', 'high quality', 'excellent', 'satisfied', 'beautiful', 'awesome', 'good', 'nice', 'perfect', 'like']

        neg_count = sum(1 for w in neg_words if w in text)
        pos_count = sum(1 for w in pos_words if w in text)

        model = cls.get_sentiment_model()

        try:
            probs = model.predict_proba([text])[0]
            classes = list(model.classes_)
            
            top_idx = probs.argmax()
            predicted_sent = classes[top_idx]
            confidence = float(probs[top_idx])

            # Calculate continuous sentiment score between -1.0 and 1.0
            pos_idx = classes.index("Positive") if "Positive" in classes else -1
            neg_idx = classes.index("Negative") if "Negative" in classes else -1

            p_pos = probs[pos_idx] if pos_idx != -1 else 0.1
            p_neg = probs[neg_idx] if neg_idx != -1 else 0.1
            
            raw_score = float(p_pos - p_neg)
        except Exception:
            predicted_sent = "Negative" if neg_count > pos_count else ("Positive" if pos_count > neg_count else "Neutral")
            confidence = 0.85
            raw_score = -0.75 if predicted_sent == "Negative" else (0.75 if predicted_sent == "Positive" else 0.0)

        # Apply rule adjustment if strong sentiment keywords exist
        if neg_count >= 2 and pos_count == 0:
            predicted_sent = "Negative"
            confidence = max(confidence, 0.90)
            raw_score = max(-0.95, min(-0.65, raw_score - 0.3))
        elif pos_count >= 2 and neg_count == 0:
            predicted_sent = "Positive"
            confidence = max(confidence, 0.88)
            raw_score = min(0.95, max(0.65, raw_score + 0.3))

        return {
            "sentiment": predicted_sent,
            "confidence": round(confidence, 2),
            "sentiment_score": round(raw_score, 2)
        }
