import os
import cv2
import numpy as np
from PIL import Image
from werkzeug.utils import secure_filename
from app.config import Config

class ImageService:
    @staticmethod
    def allowed_file(filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

    @classmethod
    def process_and_analyze_damage(cls, file_storage):
        """
        Validates, resizes, normalizes, and extracts visual characteristics from an uploaded damage image.
        Uses OpenCV for edge density, variance of Laplacian, and color variance.
        Returns preliminary damage assessment label and damage score (0-100).
        """
        if not file_storage or not cls.allowed_file(file_storage.filename):
            return {
                "success": False,
                "message": "Invalid image file. Allowed formats: PNG, JPG, JPEG, WEBP."
            }

        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        filename = secure_filename(file_storage.filename)
        unique_filename = f"damage_{os.urandom(4).hex()}_{filename}"
        save_path = os.path.join(Config.UPLOAD_FOLDER, unique_filename)

        # Save file
        file_storage.save(save_path)

        try:
            # Pillow image normalization & validation
            with Image.open(save_path) as pil_img:
                pil_img.verify()
            
            with Image.open(save_path) as pil_img:
                pil_img = pil_img.convert('RGB')
                pil_img.thumbnail((800, 800))
                pil_img.save(save_path, optimize=True, quality=85)

            # OpenCV Computer Vision Processing Pipeline
            img_bgr = cv2.imread(save_path)
            if img_bgr is None:
                raise ValueError("Could not decode image with OpenCV.")

            gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

            # 1. Variance of Laplacian (Surface irregularity / edge sharpness variance)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

            # 2. Canny Edge Detection Density (Scratch, tear, or crack density)
            edges = cv2.Canny(gray, 100, 200)
            edge_density = (np.count_nonzero(edges) / edges.size) * 100

            # 3. Color Standard Deviation (Discoloration or stain detection)
            mean_std = np.mean(cv2.meanStdDev(img_bgr)[1])

            # Heuristic calculation for damage score 0-100
            # Higher edge density and irregular laplacian variance indicate potential surface cracks, tears, or crushed edges
            damage_score_raw = (edge_density * 8.0) + (mean_std * 0.4) + min(30, laplacian_var * 0.05)
            damage_score = int(round(min(100.0, max(0.0, damage_score_raw))))

            if damage_score >= 60 or edge_density > 8.0:
                assessment = "Visible damage/defect"
                confidence = 0.88
            elif damage_score >= 30 or edge_density > 4.0:
                assessment = "Possible surface damage"
                confidence = 0.76
            else:
                assessment = "No obvious damage"
                confidence = 0.82

            relative_image_path = f"/uploads/{unique_filename}"

            return {
                "success": True,
                "image_path": relative_image_path,
                "damage_assessment": assessment,
                "damage_score": damage_score,
                "confidence": confidence,
                "metrics": {
                    "edge_density_pct": round(edge_density, 2),
                    "laplacian_variance": round(laplacian_var, 2),
                    "color_variance": round(mean_std, 2)
                },
                "disclaimer": "Preliminary visual analysis. Analyst confirmation recommended."
            }

        except Exception as e:
            print(f"[Image Service] Error processing image: {e}")
            return {
                "success": False,
                "message": f"Image processing failed: {str(e)}"
            }
