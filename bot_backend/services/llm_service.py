import requests
import json
from dotenv import load_dotenv
import os
import logging

load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
logger = logging.getLogger(__name__)

async def get_llm_response(user_input: str, image_url: str = None) -> str:
    try:
        if not OPENROUTER_API_KEY:
            logger.warning("No OpenRouter API key provided, using mock response")
            return f"Phản hồi từ OpenRouter: {user_input}"

        # Gọi API OpenRouter
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        }

        # Tạo dữ liệu gửi đến API
        messages = [
            {
                "role": "user",
                "content": []
            }
        ]

        # Thêm nội dung văn bản
        messages[0]["content"].append({
            "type": "text",
            "text": user_input
        })

        data = {
            "model": "meta-llama/llama-3.3-8b-instruct:free",  # Tên mô hình
            "messages": messages,
            "max_tokens": 500,  # Số lượng token tối đa trong phản hồi
            "temperature": 0.7  # Độ sáng tạo của mô hình
        }

        # Gửi yêu cầu POST đến API
        response = requests.post(url, headers=headers, data=json.dumps(data))
        response.raise_for_status()  # Kiểm tra lỗi HTTP

        # Trích xuất phản hồi từ API
        result = response.json()
        return result.get("choices", [{}])[0].get("message", {}).get("content", "Không có phản hồi từ OpenRouter")
    except Exception as e:
        logger.error(f"LLM error: {str(e)}")
        return "Oops, có lỗi khi gọi API OpenRouter. Thử lại nhé!"