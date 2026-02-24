import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Loader2 } from 'lucide-react';
import chatbotService from '@/services/chatbotService';

export default function ChatWidget() {
    const name = localStorage.getItem('user');

    const [user, setUser] = useState(
        name ? JSON.parse(name) : null
    );

    console.log(user)
    console.log(user?.role)
    const initialChatMessages = [
        { id: 'c1', sender: 'bot', text: `Hello ${user.fullName}! How can I assist you today?`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ];
    const [open, setOpen] = useState(false);

    const [messages, setMessages] = useState(initialChatMessages);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };


    useEffect(() => {
        if (open) {
            scrollToBottom();
        }
    }, [messages, open]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMsg = {
            id: `cm-${Date.now()}`,
            sender: 'user',
            text: input,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Send to backend
            const response = await chatbotService.sendMessage(input, messages);

            const botMsg = {
                id: `cm-${Date.now() + 1}`,
                sender: 'bot',
                text: response.data,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, botMsg]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMsg = {
                id: `cm-${Date.now() + 1}`,
                sender: 'bot',
                text: error.response?.data?.message || "I'm sorry, I'm having trouble connecting right now. Please try again later.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all z-50 animate-bounce hover:animate-none"
            >
                <MessageCircle size={24} />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[550px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50 transform transition-all duration-300 ease-in-out">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl">
                <div>
                    <h3 className="font-semibold text-white">Chat with Careline AI</h3>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <p className="text-xs text-blue-100">Online | Instant answers</p>
                    </div>
                </div>
                <button onClick={() => setOpen(false)} className="text-white hover:text-blue-100 transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-200">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${msg.sender === 'user'
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm shadow-sm'
                                }`}
                        >
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                            <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                                {msg.timestamp}
                            </p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin text-blue-600" />
                            <span className="text-sm text-gray-500 italic">Careline AI is thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick actions */}
            <div className="px-4 pb-3 pt-2 bg-white flex flex-wrap gap-2 border-t border-gray-100">
                {['Check Wait Time', 'How to book?', 'Available Hospitals'].map((action) => (
                    <button
                        key={action}
                        onClick={() => { setInput(action); }}
                        className="bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg px-3 py-1.5 text-xs border border-gray-300 transition-colors"
                    >
                        {action}
                    </button>
                ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 flex gap-2 bg-white rounded-b-xl">
                <input
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
                    placeholder="Ask me anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={loading}
                />
                <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg px-4 py-2.5 transition-colors shadow-sm flex items-center justify-center min-w-[50px]"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
            </div>
        </div>
    );
}
