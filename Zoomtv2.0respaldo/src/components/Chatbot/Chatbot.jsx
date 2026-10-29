import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CHATBOT_CONFIG } from './chatbotConfig';
import { NOTICIA_PLACEHOLDER } from '../../utils/placeholderImage';
import './Chatbot.css';

const API_URL = (() => {
  const configuredUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  try {
    const api = new URL(configuredUrl, window.location.origin);
    const isLoopback = ['localhost', '127.0.0.1', '::1'].includes(api.hostname);
    const pageIsLoopback = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

    // En móvil, "localhost" apunta al propio teléfono. En desarrollo usamos el
    // mismo host desde el que se abrió la página; en producción usamos el origen del sitio.
    if (isLoopback && !pageIsLoopback) {
      if (import.meta.env.DEV) api.hostname = window.location.hostname;
      else return `${window.location.origin}/api`;
    }
    return api.toString().replace(/\/$/, '');
  } catch {
    return `${window.location.origin}/api`;
  }
})();
const QUICK_QUESTIONS = [
  'Noticias de Actualidad',
  'Noticias de Deportes',
  'Noticias Nacionales',
  'Noticias Regionales',
  'Noticias de Música',
  '¿Cuál es la programación de hoy?',
  '¿Qué anunciantes están activos?',
  '¿Cuáles son las redes sociales?',
  '¿Cómo veo el canal en vivo?'
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: CHATBOT_CONFIG.MESSAGES.WELCOME,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Focus en el input cuando se abre el chat
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleSendMessage = async (suggestedQuestion) => {
    const messageText = (typeof suggestedQuestion === 'string' ? suggestedQuestion : inputMessage).trim();
    if (!messageText || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    let requestTimeout;
    try {
      const controller = new AbortController();
      requestTimeout = window.setTimeout(() => controller.abort(), 20000);
      const response = await fetch(`${API_URL}/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: userMessage.text,
          history: messages.slice(-8).map((message) => ({
            role: message.isUser ? 'user' : 'assistant',
            text: message.text
          }))
        })
      });
      window.clearTimeout(requestTimeout);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'No fue posible consultar la base de datos.');
      if (typeof payload.response !== 'string' || !payload.response.trim()) {
        throw new Error('El asistente recibió una respuesta vacía. Inténtalo nuevamente.');
      }

      const botMessage = {
        id: Date.now() + 1,
        text: payload.response || CHATBOT_CONFIG.MESSAGES.FALLBACK,
        newsCards: Array.isArray(payload.newsCards) ? payload.newsCards : [],
        liveCta: payload.liveCta || null,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error al generar respuesta:', error);
      const errorText = error.name === 'AbortError'
        ? 'La consulta tardó demasiado. Comprueba que el servidor esté activo e inténtalo de nuevo.'
        : error instanceof TypeError
          ? `No pude conectar con el servidor (${API_URL}). Comprueba que la API esté iniciada e inténtalo de nuevo.`
          : error.message || CHATBOT_CONFIG.MESSAGES.ERROR;
      const errorMessage = {
        id: Date.now() + 1,
        text: errorText,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      window.clearTimeout(requestTimeout);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chatbot-container">
      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window dark:chatbot-window-dark">
          <div className="flex flex-col h-[400px]">
            {/* Header */}
            <div className="chatbot-header">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">
                  {CHATBOT_CONFIG.MESSAGES.CHAT_TITLE}
                </h2>
                <div className="flex items-center gap-2">
                  <div className="chatbot-online-indicator text-xs px-2 py-1 rounded-full">
                    {CHATBOT_CONFIG.MESSAGES.ONLINE_STATUS}
                  </div>
                  <button 
                    onClick={toggleChat}
                    className="chatbot-close-button"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
            
            {/* Messages */}
            <div className="chatbot-messages" id="chatDisplay">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`chatbot-message-container ${
                    message.isUser ? 'chatbot-message-user-container' : 'chatbot-message-bot-container'
                  }`}
                >
                  <div
                    className={`${
                      message.isUser
                        ? 'chatbot-message-user'
                        : 'chatbot-message-bot'
                    }`}
                  >
                    <div className="chatbot-message-text">{message.text}</div>
                    {message.newsCards?.map((news) => (
                      <Link key={`${message.id}-${news.id}`} to={news.href} className="chatbot-news-card">
                        <img
                          src={news.image || NOTICIA_PLACEHOLDER}
                          alt={news.title}
                          loading="lazy"
                          onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = NOTICIA_PLACEHOLDER; }}
                        />
                        <div className="chatbot-news-card-body">
                          <span className="chatbot-news-card-category">{news.category}</span>
                          <h3>{news.title}</h3>
                          <p>{news.summary}</p>
                          {(news.date || news.source) && <small>{[news.date, news.source].filter(Boolean).join(' · ')}</small>}
                          <span className="chatbot-news-card-link">Leer noticia →</span>
                        </div>
                      </Link>
                    ))}
                    {message.liveCta && (
                      <Link to={message.liveCta.href || '/live'} className="chatbot-live-cta">
                        {message.liveCta.label || 'Ver Live'}
                      </Link>
                    )}
                    {!message.isUser && message.id === 1 && messages.length === 1 && (
                      <div className="chatbot-suggestions" aria-label="Preguntas sugeridas">
                        {QUICK_QUESTIONS.map((question) => (
                          <button key={question} type="button" onClick={() => handleSendMessage(question)} disabled={isLoading}>
                            {question}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="chatbot-message-time">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="chatbot-message-container chatbot-message-bot-container">
                  <div className="chatbot-message-bot">
                    <div className="chatbot-loading-container">
                      <div className="chatbot-loading-dots">
                        <div className="chatbot-loading-dot"></div>
                        <div className="chatbot-loading-dot"></div>
                        <div className="chatbot-loading-dot"></div>
                      </div>
                      <span className="chatbot-loading-text">{CHATBOT_CONFIG.MESSAGES.LOADING}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <div className="chatbot-input-area dark:chatbot-input-area-dark">
              <div className="flex gap-2">
                <input 
                  ref={inputRef}
                  placeholder={CHATBOT_CONFIG.MESSAGES.PLACEHOLDER} 
                  className="chatbot-input dark:chatbot-input-dark flex-1" 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  type="text" 
                />
                <button 
                  className="chatbot-send-button"
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputMessage.trim()}
                >
                  {isLoading ? CHATBOT_CONFIG.MESSAGES.SEND_LOADING : CHATBOT_CONFIG.MESSAGES.SEND_BUTTON}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className={`chatbot-floating-button ${isOpen ? 'chat-open' : ''}`}
        aria-label="Open chat"
      >
      </button>
    </div>
  );
};

export default Chatbot;
