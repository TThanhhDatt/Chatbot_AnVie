import React, { useState, useEffect, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';

function ChatWindow() {
  const [darkMode, setDarkMode] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Chào bạn! Mình là AnVie, trợ lý tâm lý của bạn. Ngày hôm nay của bạn như thế nào? 😄', isBot: true },
  ]);
  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, isBot: false }]);
      try {
        const response = await fetch('http://localhost:8000/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: '123', message: input }),
        });
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          { text: data.response, isBot: true },
          { text: `Mức độ trầm cảm: ${data.depression_analysis.depression_severity}`, isBot: true },
        ]);
        if (data.depression_analysis.depression_level === 'Moderately Severe' || data.depression_analysis.depression_level === 'Severe') {
          setMessages((prev) => [...prev, { text: 'Mình thấy bạn có vẻ buồn. Có muốn chia sẻ thêm không? ❤️', isBot: true }]);
        }
      } catch (error) {
        setMessages((prev) => [...prev, { text: 'Lỗi kết nối server!', isBot: true }]);
      }
      setInput('');
      setShowEmojiPicker(false);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setInput(input + emojiObject.emoji);
  };

  const handleSuggestionClick = async (suggestion) => {
    setMessages([...messages, { text: suggestion, isBot: false }]);
    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: '123', message: suggestion }),
      });
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { text: data.response, isBot: true },
        { text: `Mức độ trầm cảm: ${data.depression_analysis.depression_severity}`, isBot: true },
      ]);
      if (data.depression_analysis.depression_severity === 'Moderately Severe' || data.depression_analysis.depression_severity === 'Severe') {
        setMessages((prev) => [...prev, { text: 'Mình thấy bạn có vẻ buồn. Có muốn chia sẻ thêm không? ❤️', isBot: true }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { text: 'Lỗi kết nối server!', isBot: true }]);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-indigo-500 to-cyan-500 text-black'}`}>
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">AnVie - Trợ lý Tâm Lý Học Đường</h1>
          <button
            onClick={toggleDarkMode}
            className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
          >
            {darkMode ? '🌞 Sáng' : '🌙 Tối'}
          </button>
        </div>
        <div className={`border rounded-2xl shadow-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-colors duration-300`}>
          <div className="h-96 overflow-y-auto mb-4 p-4 rounded-xl bg-opacity-50 backdrop-blur-sm">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 flex ${msg.isBot ? 'justify-start' : 'justify-end'} animate-fadeIn`}
              >
                {msg.isBot && (
                  <img
                    src="/assets/images/image.jpg" 
                    alt="Bot Avatar"
                    className="w-10 h-10 rounded-full mr-3 self-end"
                  />
                )}
                <div
                  className={`inline-block p-3 rounded-xl max-w-xs ${
                    msg.isBot
                      ? darkMode
                        ? 'bg-indigo-700 text-white'
                        : 'bg-indigo-100 text-black'
                      : darkMode
                      ? 'bg-purple-700 text-white'
                      : 'bg-purple-200 text-black'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {['Hãy giúp tôi vấn đề này nhé!!', 'Tư vấn cho mình việc này được không?'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`px-3 py-1 rounded-full text-sm ${
                  darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-indigo-200 text-indigo-800 hover:bg-indigo-300'
                } transition`}
              >
                {suggestion}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Gõ tin nhắn nhé! 😊"
              className={`flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'
              }`}
            />
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-3 rounded-full hover:bg-gray-200"
            >
              😊
            </button>
            <button
              onClick={handleSendMessage}
              className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
            >
              ➤
            </button>
          </div>
          {showEmojiPicker && (
            <div className="absolute mt-2">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;