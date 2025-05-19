from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from services.llm_service import get_llm_response
from services.depression_service import analyze_depression  # Import trực tiếp hàm analyze_depression
import logging
from fastapi.middleware.cors import CORSMiddleware

# Cấu hình logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="Student Chatbot Backend")

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

class ChatRequest(BaseModel):
    user_id: str
    message: str

@app.post("/api/chat")
async def handle_chat(request: ChatRequest):
    try:
        # Gọi Gemini cho phản hồi hội thoại
        llm_response = await get_llm_response(request.message)
        logger.info(f"LLM response for '{request.message}': {llm_response}")

        # Gọi trực tiếp hàm analyze_depression để phân tích trầm cảm
        depression_result = analyze_depression(request.message)
        logger.info(f"Depression analysis for '{request.message}': {depression_result}")

        # Kết hợp kết quả
        return {
            "response": llm_response,
            "depression_analysis": depression_result
        }
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail="Có lỗi xảy ra, thử lại nhé!")