import os
import cv2
import numpy as np
import base64
import io
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from ultralytics import YOLO
import requests
import traceback

from dotenv import load_dotenv
load_dotenv()


app = Flask(__name__)
CORS(app)

# Load YOLO model
model = YOLO("best_YOLOv8m_model.pt")

# PlateRecognizer API key
API_TOKEN = os.getenv("PLATE_API_TOKEN", "YOUR_API_KEY_HERE")

@app.route("/detect", methods=["POST"])
def detect():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        in_memory_file = io.BytesIO()
        file.save(in_memory_file)
        in_memory_file.seek(0)

        img = Image.open(in_memory_file).convert("RGB")
        img_bgr = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        original_img = img_bgr.copy()

        results = model(img_bgr)[0]

        for box in results.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            pad = 10
            h, w = img_bgr.shape[:2]
            x1, y1 = max(0, x1 - pad), max(0, y1 - pad)
            x2, y2 = min(w, x2 + pad), min(h, y2 + pad)
            cropped = img_bgr[y1:y2, x1:x2]

            # Save and send to PlateRecognizer
            _, plate_jpg = cv2.imencode(".jpg", cropped)
            with open("temp_plate.jpg", "wb") as f:
                f.write(plate_jpg)

            with open("temp_plate.jpg", "rb") as f:
                res = requests.post(
                    "https://api.platerecognizer.com/v1/plate-reader/",
                    files={"upload": f},
                    headers={"Authorization": f"Token {API_TOKEN}"},
                )

            print("API Response:", res.status_code, res.text)

            if res.status_code in [200, 201]:
                data = res.json()
                if data.get("results"):
                    plate_text = data["results"][0]["plate"].upper()
                else:
                    plate_text = "Not detected"
            else:
                plate_text = "API error"

            # Draw on original image
            cv2.rectangle(original_img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(
                original_img,
                plate_text,
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 255, 0),
                2,
            )

            # Encode cropped & annotated
            _, cropped_jpg = cv2.imencode(".jpg", cropped)
            _, annotated_jpg = cv2.imencode(".jpg", original_img)

            cropped_b64 = base64.b64encode(cropped_jpg).decode("utf-8")
            annotated_b64 = base64.b64encode(annotated_jpg).decode("utf-8")

            return jsonify({
                "plate_text": plate_text,
                "cropped_image": cropped_b64,
                "annotated_image": annotated_b64
            })

        return jsonify({"error": "No plate detected"}), 400

    except Exception as e:
        print("❌ Error:", e)
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("🚀 Backend running at http://127.0.0.1:5000")
    app.run(debug=False)
