import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Calendar, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onToggle }) => {
  const API_BASE = 'https://chatbot-c23f.vercel.app';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your coaching assistant. I can help you learn about our services and book a meeting with our coaches. How can I assist you today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookingMode, setBookingMode] = useState(false);
  const [bookingData, setBookingData] = useState({ name: '', email: '' });
  const [conversationContext, setConversationContext] = useState({
    interestedInBooking: false,
    askedAboutGoals: false,
    askedAboutExperience: false,
    askedAboutTimeframe: false,
    readyToBook: false
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, isBot: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleBooking = async (name: string, email: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/api/book-meeting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        addMessage(`Great! ${data.message} You'll receive an email with the booking link shortly.`, true);
        setBookingMode(false);
        setBookingData({ name: '', email: '' });
        setConversationContext({
          interestedInBooking: false,
          askedAboutGoals: false,
          askedAboutExperience: false,
          askedAboutTimeframe: false,
          readyToBook: false
        });
      } else {
        throw new Error(data.error || 'Failed to book meeting');
      }
    } catch (error) {
      console.error('Booking error:', error);
      addMessage('There was an issue booking your meeting. Please try again or contact us directly.', true);
    } finally {
      setIsLoading(false);
    }
  };

  const getNextQuestion = () => {
    if (!conversationContext.askedAboutGoals)
      return "Great! What are your main goals with coaching?";
    else if (!conversationContext.askedAboutExperience)
      return "Have you worked with a coach before, or is this your first time?";
    else if (!conversationContext.askedAboutTimeframe)
      return "When are you looking to get started? Soon or later?";
    else
      return "Would you like me to help you schedule a consultation with a coach?";
  };

  const updateConversationContext = (userMessage: string) => {
    const lower = userMessage.toLowerCase();
    if (!conversationContext.askedAboutGoals) {
      setConversationContext(prev => ({ ...prev, askedAboutGoals: true }));
    } else if (!conversationContext.askedAboutExperience) {
      setConversationContext(prev => ({ ...prev, askedAboutExperience: true }));
    } else if (!conversationContext.askedAboutTimeframe) {
      setConversationContext(prev => ({ ...prev, askedAboutTimeframe: true }));
    } else if (!conversationContext.readyToBook) {
      const yesWords = ['yes', 'ok', 'sure', 'please', 'book', 'schedule'];
      if (yesWords.some(word => lower.includes(word))) {
        setConversationContext(prev => ({ ...prev, readyToBook: true }));
        return true;
      }
    }
    return false;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    addMessage(userMessage, false);
    setInputText('');
    setIsLoading(true);

    const bookingKeywords = ['book', 'schedule', 'meeting', 'appointment', 'consultation'];
    const wantsToBook = bookingKeywords.some(k => userMessage.toLowerCase().includes(k));

    if (wantsToBook && !conversationContext.interestedInBooking) {
      setConversationContext(prev => ({ ...prev, interestedInBooking: true }));
      addMessage(getNextQuestion(), true);
      setIsLoading(false);
      return;
    }

    if (conversationContext.interestedInBooking && !conversationContext.readyToBook) {
      const showBookingForm = updateConversationContext(userMessage);
      if (showBookingForm) {
        setBookingMode(true);
        addMessage("Great! Please share your name and email so I can schedule your meeting.", true);
        setIsLoading(false);
        return;
      } else {
        addMessage(getNextQuestion(), true);
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      if (response.ok) {
        addMessage(data.response, true);
      } else {
        throw new Error(data.error || 'Chat API error');
      }
    } catch (error) {
      console.error('Chat error:', error);
      addMessage('I had trouble connecting. You can still book a meeting by entering your name and email.', true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bookingData.name && bookingData.email) {
      handleBooking(bookingData.name, bookingData.email);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Toggle Button (shown on mobile too) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-teal-600 text-white p-4 rounded-full shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 w-[92%] h-[85vh] sm:h-[600px] max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Coaching Assistant</h3>
                    <p className="text-sm opacity-90">Online now</p>
                  </div>
                </div>
                <button onClick={onToggle} className="hover:text-white/90">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${msg.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${msg.isBot ? 'bg-gradient-to-r from-blue-600 to-teal-600' : 'bg-gray-500'}`}>
                      {msg.isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <div className={`p-3 rounded-lg ${msg.isBot ? 'bg-gray-100 text-gray-800' : 'bg-gradient-to-r from-blue-600 to-teal-600 text-white'}`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-xs mt-1 opacity-70">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0">
              {bookingMode ? (
                <form onSubmit={handleBookingSubmit} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={bookingData.name}
                    onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Your email"
                    value={bookingData.email}
                    onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white p-2 rounded-lg font-medium hover:shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>{isLoading ? 'Booking...' : 'Book Meeting'}</span>
                  </button>
                </form>
              ) : (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputText.trim()}
                    className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-3 rounded-lg"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
