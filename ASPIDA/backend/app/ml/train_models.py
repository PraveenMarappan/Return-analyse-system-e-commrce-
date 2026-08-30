import os
import joblib
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score, f1_score
from app.config import Config

# Synthetic Training Data for Return Reason Classification
REASON_TRAINING_DATA = [
    # Size Issue
    ("The shoe is smaller than expected and uncomfortable.", "Size Issue"),
    ("Runs very small, need to order a size up.", "Size Issue"),
    ("Too big, fits loosely around waist and shoulders.", "Size Issue"),
    ("The chest size doesn't match the size chart provided.", "Size Issue"),
    ("Tight around hips, smaller than standard Large size.", "Size Issue"),
    ("Sleeves are too short and overall fit is too tight.", "Size Issue"),
    ("Way larger than indicated on the product page sizing guide.", "Size Issue"),
    ("Fits tight across chest, definitely not true to size.", "Size Issue"),
    
    # Quality Issue
    ("Stitching came apart after wearing it just twice.", "Quality Issue"),
    ("Poor material quality, fabric feels cheap and thin.", "Quality Issue"),
    ("Zipper broke on the very first day of light usage.", "Quality Issue"),
    ("Item stopped working after 3 days. Terrible build quality.", "Quality Issue"),
    ("Buttons fell off right out of the package.", "Quality Issue"),
    ("Sole detached from shoe after single workout session.", "Quality Issue"),
    ("Screen flickers constantly and audio stutters. Subpar quality.", "Quality Issue"),
    ("Battery drains completely within 30 minutes. Defective unit.", "Quality Issue"),

    # Damaged Product
    ("Package arrived completely crushed and box torn open.", "Damaged Product"),
    ("Screen is cracked right out of the sealed box.", "Damaged Product"),
    ("Item scratched all over and dented during transit.", "Damaged Product"),
    ("Glass container smashed into pieces inside shipment box.", "Damaged Product"),
    ("Water damage on product box and unit damaged.", "Damaged Product"),
    ("Chipped wood corner on furniture piece during shipping.", "Damaged Product"),
    ("Broken plastic handle inside cracked packaging.", "Damaged Product"),

    # Wrong Product
    ("Received a completely different item than what I ordered.", "Wrong Product"),
    ("Sent me men's shoes instead of women's boots.", "Wrong Product"),
    ("Received 64GB version instead of 256GB version ordered.", "Wrong Product"),
    ("Order says wireless earbuds but got wired earphones.", "Wrong Product"),
    ("Totally wrong model number shipped in package.", "Wrong Product"),
    ("Got a kitchen knife set instead of blender.", "Wrong Product"),

    # Wrong Color
    ("Ordered blue jacket but received bright red one.", "Wrong Color"),
    ("Color in picture is beige but item is dark brown.", "Wrong Color"),
    ("Ordered silver metal watch, received gold shade.", "Wrong Color"),
    ("Shade of grey is much darker than online photos.", "Wrong Color"),

    # Product Not as Described
    ("Listing says genuine leather but it is cheap plastic.", "Product Not as Described"),
    ("Specifications advertised 10 hour battery life, lasts 2 hours.", "Product Not as Described"),
    ("Features mentioned in description are completely missing.", "Product Not as Described"),
    ("Product photo showed accessories included, none came in box.", "Product Not as Described"),
    ("Advertised as waterproof but water got inside immediately.", "Product Not as Described"),

    # Missing Item
    ("Missing power cable and user manual from sealed package.", "Missing Item"),
    ("Only 1 piece delivered instead of 2 pack listed.", "Missing Item"),
    ("Screws and mounting hardware missing from box.", "Missing Item"),
    ("Charging case was missing inside earbud package.", "Missing Item"),

    # Delivery Issue
    ("Delivered 2 weeks late after scheduled delivery date.", "Delivery Issue"),
    ("Package left outside in the rain by courier driver.", "Delivery Issue"),
    ("Box was dropped and mishandled by shipping company.", "Delivery Issue"),
    ("Delivery took way too long, missed birthday deadline.", "Delivery Issue"),

    # Compatibility Issue
    ("Does not connect with iPhone 15 or latest iOS version.", "Compatibility Issue"),
    ("Cable connector type C does not fit my older tablet.", "Compatibility Issue"),
    ("Software driver not compatible with Windows 11 system.", "Compatibility Issue"),
    ("Mount bracket doesn't fit standard VESA television mount.", "Compatibility Issue"),

    # Customer Changed Mind
    ("Don't need this item anymore, found alternative option.", "Customer Changed Mind"),
    ("Bought by mistake during impulse flash sale.", "Customer Changed Mind"),
    ("Decided to keep old appliance instead of replacing.", "Customer Changed Mind"),
    ("No longer required for project, returning unused.", "Customer Changed Mind"),

    # Other
    ("Gave as a gift but recipient already owns exact item.", "Other"),
    ("Smells strongly of chemical dye.", "Other"),
    ("Instructions not available in English language.", "Other")
]

# Synthetic Training Data for Sentiment Classification
SENTIMENT_TRAINING_DATA = [
    ("Horrible product, total waste of money! Extremely dissatisfied.", "Negative"),
    ("Broke on day one. Terrible quality and bad customer service.", "Negative"),
    ("Very disappointed, size is completely inaccurate.", "Negative"),
    ("Product arrived damaged and unusable. Extremely annoyed.", "Negative"),
    ("Worst purchase ever. Waste of time and effort.", "Negative"),
    ("Flimsy construction, cheap plastic, complete disappointment.", "Negative"),
    ("Scratched, dented, and late delivery. Unacceptable.", "Negative"),

    ("Product is okay, but fit is slightly loose. Neutral overall.", "Neutral"),
    ("Standard item. Returned because size didn't fit properly.", "Neutral"),
    ("Average quality product, just wasn't what I needed.", "Neutral"),
    ("Decent item, but wrong color was sent by seller.", "Neutral"),
    ("It works as expected, just returning due to change of plans.", "Neutral"),

    ("Great product! Super high quality, but size was slightly off.", "Positive"),
    ("Loved the material and design, unfortunately bought wrong model.", "Positive"),
    ("Excellent packaging and premium feel, just needed different size.", "Positive"),
    ("Beautiful color and great performance, returning to get larger size.", "Positive"),
    ("Very satisfied with build quality, just bought two by mistake.", "Positive")
]

def train_and_save_models():
    """Trains TF-IDF + LogisticRegression models and saves them via joblib."""
    os.makedirs(Config.MODEL_FOLDER, exist_ok=True)

    # 1. Train Return Reason Model
    df_reason = pd.DataFrame(REASON_TRAINING_DATA, columns=["comment", "reason"])
    
    reason_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), min_df=1, stop_words='english')),
        ('clf', LogisticRegression(max_iter=1000, C=1.0, random_state=42))
    ])
    
    reason_pipeline.fit(df_reason["comment"], df_reason["reason"])
    
    # Evaluate Reason Model
    y_pred_reason = reason_pipeline.predict(df_reason["comment"])
    acc_reason = accuracy_score(df_reason["reason"], y_pred_reason)
    print(f"[ML Pipeline] Return Reason Model Trained. Accuracy: {acc_reason * 100:.2f}%")

    reason_model_path = os.path.join(Config.MODEL_FOLDER, "return_reason_model.joblib")
    joblib.dump(reason_pipeline, reason_model_path)
    print(f"[ML Pipeline] Saved Return Reason Model to {reason_model_path}")

    # 2. Train Sentiment Model
    df_sent = pd.DataFrame(SENTIMENT_TRAINING_DATA, columns=["comment", "sentiment"])
    
    sent_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), min_df=1, stop_words='english')),
        ('clf', LogisticRegression(max_iter=1000, C=1.0, random_state=42))
    ])
    
    sent_pipeline.fit(df_sent["comment"], df_sent["sentiment"])
    
    # Evaluate Sentiment Model
    y_pred_sent = sent_pipeline.predict(df_sent["comment"])
    acc_sent = accuracy_score(df_sent["sentiment"], y_pred_sent)
    print(f"[ML Pipeline] Sentiment Model Trained. Accuracy: {acc_sent * 100:.2f}%")

    sent_model_path = os.path.join(Config.MODEL_FOLDER, "sentiment_model.joblib")
    joblib.dump(sent_pipeline, sent_model_path)
    print(f"[ML Pipeline] Saved Sentiment Model to {sent_model_path}")

    return {
        "reason_accuracy": acc_reason,
        "sentiment_accuracy": acc_sent,
        "reason_classes": list(reason_pipeline.named_steps['clf'].classes_),
        "sentiment_classes": list(sent_pipeline.named_steps['clf'].classes_)
    }

if __name__ == "__main__":
    train_and_save_models()
