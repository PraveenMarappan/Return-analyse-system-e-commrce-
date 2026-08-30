from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
import numpy as np
from app.models import Return, Product, ReturnAnalysis, db

class ClusteringService:
    @classmethod
    def discover_recurring_clusters(cls, n_clusters=4):
        """
        Uses TF-IDF + KMeans clustering on customer return comments to automatically
        identify recurring complaint patterns and clusters.
        """
        returns = Return.query.all()
        if len(returns) < 5:
            return []

        comments = [r.customer_comment for r in returns if r.customer_comment]
        if not comments:
            return []

        # Vectorize comments
        vectorizer = TfidfVectorizer(stop_words='english', max_features=100, ngram_range=(1, 2))
        X = vectorizer.fit_transform(comments)

        n_clusters = min(n_clusters, len(comments))
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        kmeans.fit(X)

        feature_names = vectorizer.get_feature_names_out()
        cluster_labels = kmeans.labels_

        clusters = []
        for cluster_id in range(n_clusters):
            # Find indices for this cluster
            indices = np.where(cluster_labels == cluster_id)[0]
            if len(indices) == 0:
                continue

            # Get top keywords for cluster center
            center = kmeans.cluster_centers_[cluster_id]
            top_keyword_indices = center.argsort()[::-1][:5]
            keywords = [feature_names[i] for i in top_keyword_indices]

            # Get associated returns and products
            cluster_returns = [returns[i] for i in indices]
            product_ids = list(set(r.product_id for r in cluster_returns))
            products = Product.query.filter(Product.id.in_(product_ids)).all()
            product_names = [p.name for p in products[:5]]

            # Determine cluster topic title and severity
            keyword_str = ", ".join(keywords)
            
            if any(k in keyword_str for k in ['size', 'small', 'tight', 'chart']):
                title = "Size & Fit Inconsistency Cluster"
                severity = "High" if len(indices) > 30 else "Medium"
                action = "Audit size chart specifications and add precise measurements for highlighted products."
            elif any(k in keyword_str for k in ['broken', 'stitching', 'quality', 'material']):
                title = "Material & Quality Defect Cluster"
                severity = "Critical" if len(indices) > 25 else "High"
                action = "Initiate factory supplier inspection and review batch material durability."
            elif any(k in keyword_str for k in ['damaged', 'box', 'crushed', 'package']):
                title = "Transit Packaging Vulnerability Cluster"
                severity = "High" if len(indices) > 20 else "Medium"
                action = "Upgrade protective bubble packaging and audit warehouse courier fulfillment."
            else:
                title = f"Pattern Cluster: {keywords[0].capitalize() if keywords else 'General Issue'}"
                severity = "Medium"
                action = "Review product descriptions and customer feedback logs."

            clusters.append({
                "cluster_id": int(cluster_id + 1),
                "title": title,
                "keywords": keywords,
                "returns_count": len(indices),
                "percentage_of_total": round((len(indices) / len(returns)) * 100, 1),
                "affected_products": product_names,
                "severity": severity,
                "suggested_action": action
            })

        clusters.sort(key=lambda x: x['returns_count'], reverse=True)
        return clusters
