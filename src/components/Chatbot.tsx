import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Calendar, CheckCircle } from 'lucide-react';

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
      const response = await fetch(`https://chatbot-c23f.vercel.app/api/book-meeting`, { // Change here
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        addMessage(
          `Great! I've initiated your meeting booking process. ${data.message} You'll receive an email with the booking link shortly.`,
          true
        );
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
      addMessage(
        'I apologize, but there was an issue with booking your meeting. Please try again or contact us directly.',
        true
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getNextQuestion = () => {
    if (!conversationContext.askedAboutGoals) {
      return "That's great to hear! Before we schedule a meeting, I'd love to learn more about you. What are your main goals that you'd like to work on with a coach?";
    } else if (!conversationContext.askedAboutExperience) {
      return "Thank you for sharing that! Have you worked with a coach before, or would this be your first coaching experience?";
    } else if (!conversationContext.askedAboutTimeframe) {
      return "Perfect! One more question - when are you looking to get started? Are you ready to begin soon or are you planning for the future?";
    } else {
      return "Excellent! Based on what you've shared, I think our coaching program would be a great fit for you. Would you like me to help you schedule a consultation with one of our expert coaches?";
    }
  };

  const updateConversationContext = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (!conversationContext.askedAboutGoals) {
      setConversationContext(prev => ({ ...prev, askedAboutGoals: true }));
    } else if (!conversationContext.askedAboutExperience) {
      setConversationContext(prev => ({ ...prev, askedAboutExperience: true }));
    } else if (!conversationContext.askedAboutTimeframe) {
      setConversationContext(prev => ({ ...prev, askedAboutTimeframe: true }));
    } else if (!conversationContext.readyToBook) {
      // Check if user confirms they want to book
      const confirmationWords = ['yes', 'sure', 'okay', 'ok', 'definitely', 'absolutely', 'please', 'book', 'schedule'];
      if (confirmationWords.some(word => lowerMessage.includes(word))) {
        setConversationContext(prev => ({ ...prev, readyToBook: true }));
        return true; // Signal to show booking form
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

    // Check if user wants to book a meeting initially
    const bookingKeywords = ['book', 'schedule', 'meeting', 'appointment', 'consultation', 'session'];
    const wantsToBook = bookingKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    );

    // If user expresses interest in booking but we haven't started the conversation flow
    if (wantsToBook && !conversationContext.interestedInBooking) {
      setConversationContext(prev => ({ ...prev, interestedInBooking: true }));
      addMessage(getNextQuestion(), true);
      setIsLoading(false);
      return;
    }

    // If we're in the booking conversation flow
    if (conversationContext.interestedInBooking && !conversationContext.readyToBook) {
      const shouldShowBookingForm = updateConversationContext(userMessage);
      
      if (shouldShowBookingForm) {
        setBookingMode(true);
        addMessage(
          "Perfect! I'd be happy to help you schedule a consultation. Please provide your name and email address, and I'll set up a meeting for you.",
          true
        );
        setIsLoading(false);
        return;
      } else {
        // Ask the next question in the sequence
        addMessage(getNextQuestion(), true);
        setIsLoading(false);
        return;
      }
    }

    // Regular chat functionality
    try {
      const response = await fetch(`https://chatbot-c23f.vercel.app//api/chat`, { // Change here
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      
      if (response.ok) {
        addMessage(data.response, true);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      addMessage(
        'I apologize, but I\'m having trouble connecting right now. You can still book a meeting by providing your name and email, or try contacting us directly.',
        true
      );
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-20 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-40"
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
              <button
                onClick={onToggle}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[400px]">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${message.isBot ? 'bg-gradient-to-r from-blue-600 to-teal-600' : 'bg-gray-500'}`}>
                    {message.isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  <div className={`p-3 rounded-lg ${message.isBot ? 'bg-gray-100 text-gray-800' : 'bg-gradient-to-r from-blue-600 to-teal-600 text-white'}`}>
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${message.isBot ? 'text-gray-500' : 'text-white/70'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            {bookingMode ? (
              <form onSubmit={handleBookingSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Your name"
                  value={bookingData.name}
                  onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={bookingData.email}
                  onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white p-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
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
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputText.trim()}
                  className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-3 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Chatbot;
