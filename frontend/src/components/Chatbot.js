import React, { useEffect, useRef, useState } from 'react';
import { Bot, MessageCircle, Send, X } from 'lucide-react';
import client from '../api/client';
import './Chatbot.css';
import { chatbotSchema, validateWithToast } from '../validation/schemas';
import BikeImage from './BikeImage';

const WELCOME = {
  role: 'bot',
  content: 'Hi! I can help you find available bikes, check your bookings, and answer bike rental questions.'
};

const renderInlineFormatting = (text) => text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((part, index) => {
  if (part.startsWith('**') && part.endsWith('**')) {
    return <strong key={index}>{part.slice(2, -2)}</strong>;
  }
  if (part.startsWith('*') && part.endsWith('*')) {
    return <em key={index}>{part.slice(1, -1)}</em>;
  }
  if (part.startsWith('`') && part.endsWith('`')) {
    return <code key={index}>{part.slice(1, -1)}</code>;
  }
  return part;
});

const renderChatText = (text) => String(text).split(/\r?\n/).map((line, index) => {
  if (!line.trim()) return <br key={index} />;
  const numberedItem = line.match(/^\s*(\d+\.)\s+(.*)$/);
  if (numberedItem) {
    return <div className="bike-chat-list-item" key={index}>{numberedItem[1]} {renderInlineFormatting(numberedItem[2])}</div>;
  }
  const bulletItem = line.match(/^\s*[-*]\s+(.*)$/);
  if (bulletItem) {
    return <div className="bike-chat-list-item nested" key={index}>• {renderInlineFormatting(bulletItem[1])}</div>;
  }
  return <div key={index}>{renderInlineFormatting(line)}</div>;
});

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatbotRef = useRef(null);
  const messageListRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (chatbotRef.current && !chatbotRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [isOpen, messages, isSending]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (isSending) return;
    const content = validateWithToast(chatbotSchema, draft);
    if (!content) return;

    const nextMessages = [...messages, { role: 'user', content }];
    setMessages(nextMessages);
    setDraft('');
    setIsSending(true);

    try {
      const apiMessages = nextMessages.slice(-12).map((item) => ({
        role: item.role === 'bot' ? 'assistant' : item.role,
        content: item.content
      }));
      const response = await client.post('/api/chat', { messages: apiMessages }, { timeout: 65000 });
      setMessages([...nextMessages, {
        role: 'bot',
        content: response.data.reply,
        action: response.data.show_bikes_link ? 'browse-bikes' : null,
        bikeResults: Array.isArray(response.data.bike_results) ? response.data.bike_results : null
      }]);
    } catch (error) {
      const detail = error.response?.data?.detail;
      const message = error.code === 'ECONNABORTED'
        ? 'The assistant took too long to respond. Please try again.'
        : detail || 'I could not connect right now. Please try again in a moment.';
      setMessages([
        ...nextMessages,
        { role: 'bot', content: message }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={`bike-chatbot${isOpen ? ' is-open' : ''}`} ref={chatbotRef}>
      {isOpen && (
        <section className="bike-chat-panel" role="dialog" aria-label="Bike Rental Assistant">
          <header className="bike-chat-header">
            <div className="bike-chat-brand-icon"><Bot size={20} /></div>
            <div className="bike-chat-header-copy">
              <strong>Bike Rental Assistant</strong>
              <span>Ask about bikes or your bookings</span>
            </div>
            <button className="bike-chat-close" onClick={() => setIsOpen(false)} aria-label="Close chat">
              <X size={20} />
            </button>
          </header>

          <div className="bike-chat-messages" ref={messageListRef} aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${index}-${message.role}`} className={`bike-chat-message ${message.role === 'user' ? 'user' : 'assistant'}`}>
                {message.role === 'bot' ? renderChatText(message.content) : message.content}
                {message.bikeResults?.length > 0 && (
                  <div className="bike-chat-bike-results">
                    {message.bikeResults.map((bike) => (
                      <article className="bike-chat-bike-card" key={bike.id}>
                        <BikeImage src={bike.image_url} alt={bike.name} />
                        <div className="bike-chat-bike-info">
                          <strong>{bike.name}</strong>
                          {bike.brand && <span>{bike.brand}{bike.model ? ` · ${bike.model}` : ''}</span>}
                          {bike.engine && <span>Engine: {bike.engine}</span>}
                          {bike.mileage && <span>Mileage: {bike.mileage}</span>}
                          <span className="bike-chat-bike-prices">
                            {bike.price_per_day != null && `₹${bike.price_per_day}/day`}
                            {bike.price_per_hour != null && ` · ₹${bike.price_per_hour}/hour`}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
                {message.action === 'browse-bikes' && (
                  <button
                    type="button"
                    className="bike-chat-browse-action"
                    onClick={() => {
                      document.getElementById('bikes-collection')?.scrollIntoView({ behavior: 'smooth' });
                      setIsOpen(false);
                    }}
                  >
                    View available bikes
                  </button>
                )}
              </div>
            ))}
            {isSending && <div className="bike-chat-message assistant bike-chat-typing">Checking that for you…</div>}
          </div>

          <form className="bike-chat-input-row" onSubmit={sendMessage} noValidate>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type your question…"
              aria-label="Message the assistant"
              maxLength={2000}
              disabled={isSending}
            />
            <button type="submit" aria-label="Send message" disabled={!draft.trim() || isSending}>
              <Send size={18} />
            </button>
          </form>
          <p className="bike-chat-privacy">Your booking questions are checked against your signed-in account.</p>
        </section>
      )}

      {!isOpen && (
        <button
          className="bike-chat-launcher"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat assistant"
          aria-expanded={false}
        >
          <MessageCircle size={23} />
          <span>Ask us</span>
        </button>
      )}
    </div>
  );
};

export default Chatbot;
