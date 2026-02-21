import { useState } from 'react';
import { initialChatMessages } from '@/data/mockData';
import { Send, MessageCircle, X } from 'lucide-react';

const botResponses = [
    "I can help you with that! Your current queue position is 1 with an estimated wait of 10 minutes.",
    "Would you like me to reschedule your appointment? I can check available slots for you.",
    "The average wait time for General Medicine today is about 15 minutes.",
    "You can book a new token by selecting a department from the dashboard.",
    "Is there anything else I can help you with?",
];

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState(initialChatMessages);
    const [input, setInput] = useState('');

    const sendMessage = () => {
        if (!input.trim()) return;
        const userMsg = {
            id: `cm-${Date.now()}`,
            sender: 'user',
            text: input,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        const botMsg = {
            id: `cm-${Date.now() + 1}`,
            sender: 'bot',
            text: botResponses[Math.floor(Math.random() * botResponses.length)],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, userMsg, botMsg]);
        setInput('');
    };

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all z-50"
            >
                <MessageCircle size={24} />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl">
                <div>
                    <h3 className="font-semibold text-white">Chat with Careline AI</h3>
                    <p className="text-xs text-blue-100">Instant answers and quick actions</p>
                </div>
                <button onClick={() => setOpen(false)} className="text-white hover:text-blue-100 transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${msg.sender === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm shadow-sm'
                                }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick actions */}
            <div className="px-4 pb-3 pt-2 bg-white flex flex-wrap gap-2 border-t border-gray-100">
                {['Check Wait Time', 'Reschedule', 'Contact Support'].map((action) => (
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
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-2.5 transition-colors shadow-sm"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}