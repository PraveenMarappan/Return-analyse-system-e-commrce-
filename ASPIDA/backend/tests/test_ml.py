import unittest
from app.services.nlp_service import NLPService
from app.services.sentiment_service import SentimentService
from app.services.risk_service import RiskService

class TestMLPipeline(unittest.TestCase):
    def test_reason_classification(self):
        comment = "The shoe is smaller than expected and uncomfortable."
        res = NLPService.classify_return_reason(comment)
        self.assertEqual(res['primary_reason'], 'Size Issue')
        self.assertEqual(res['root_cause'], 'SIZE INFORMATION')
        self.assertGreaterEqual(res['confidence'], 0.70)

    def test_sentiment_analysis(self):
        comment = "Horrible product, total waste of money! Extremely dissatisfied."
        res = SentimentService.analyze_sentiment(comment)
        self.assertEqual(res['sentiment'], 'Negative')
        self.assertLess(res['sentiment_score'], 0.0)

if __name__ == '__main__':
    unittest.main()
