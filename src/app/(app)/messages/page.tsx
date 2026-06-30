'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, MessageSquare, Search } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Conversation {
  id: string
  name: string
  lastMessage: string
  time: string
  unread: number
  online: boolean
}

interface Message {
  id: string
  text: string
  fromMe: boolean
  time: string
}

const CONVERSATIONS: Conversation[] = [
  { id: '1', name: 'Adaeze Okonkwo', lastMessage: 'How is Emmanuel progressing?', time: '2m', unread: 2, online: true },
  { id: '2', name: 'Pastor James Ade', lastMessage: 'Great session yesterday!', time: '1h', unread: 0, online: false },
  { id: '3', name: 'Grace Mensah', lastMessage: 'I shared the lesson today 🙌', time: '3h', unread: 1, online: true },
  { id: '4', name: 'David Osei', lastMessage: "Let's schedule a call", time: '1d', unread: 0, online: false },
]

const MOCK_MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: '1', text: 'Hello! How are you doing today?', fromMe: false, time: '10:00' },
    { id: '2', text: 'I am doing great, thank God! Ready for our session.', fromMe: true, time: '10:02' },
    { id: '3', text: 'Wonderful! How is Emmanuel progressing?', fromMe: false, time: '10:05' },
    { id: '4', text: 'He is doing very well! We completed Day 3 together yesterday.', fromMe: true, time: '10:06' },
  ],
}

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(MOCK_MESSAGES)
  const [search, setSearch] = useState('')

  const selected = CONVERSATIONS.find(c => c.id === selectedId)
  const currentMessages = selectedId ? (messages[selectedId] ?? []) : []

  const sendMessage = () => {
    if (!input.trim() || !selectedId) return
    const newMsg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      fromMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(m => ({ ...m, [selectedId]: [...(m[selectedId] ?? []), newMsg] }))
    setInput('')
  }

  const filtered = CONVERSATIONS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${selectedId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 bg-white border-r border-gray-100`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900 mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 bg-gray-50 border-gray-200 text-sm"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map(conv => (
            <button
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-all border-b border-gray-50 ${
                selectedId === conv.id ? 'bg-[#f0f7f4]' : ''
              }`}
            >
              <div className="relative flex-shrink-0">
                <Avatar className="w-11 h-11">
                  <AvatarFallback className="bg-[#1F5E4A]/10 text-[#1F5E4A] font-bold text-sm">
                    {conv.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {conv.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-800 truncate">{conv.name}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{conv.time}</span>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && (
                <Badge className="bg-[#1F5E4A] text-white border-0 text-xs w-5 h-5 rounded-full flex items-center justify-center p-0 flex-shrink-0">
                  {conv.unread}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className={`${selectedId ? 'flex' : 'hidden md:flex'} flex-col flex-1`}>
        {selected ? (
          <>
            {/* Chat header */}
            <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
              <button
                onClick={() => setSelectedId(null)}
                className="md:hidden text-gray-500 hover:text-gray-700 mr-1"
              >
                ←
              </button>
              <div className="relative">
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-[#1F5E4A]/10 text-[#1F5E4A] font-bold text-sm">
                    {selected.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {selected.online && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{selected.name}</p>
                <p className="text-xs text-gray-400">{selected.online ? 'Online' : 'Offline'}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {currentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-14 h-14 bg-[#1F5E4A]/10 rounded-full flex items-center justify-center mb-3">
                    <MessageSquare className="w-7 h-7 text-[#1F5E4A]" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">No messages yet</p>
                  <p className="text-gray-400 text-xs mt-1">Start the conversation!</p>
                </div>
              ) : (
                currentMessages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.fromMe
                          ? 'bg-[#1F5E4A] text-white rounded-br-sm'
                          : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
                      }`}
                    >
                      {msg.text}
                      <p className={`text-xs mt-1 ${msg.fromMe ? 'text-white/60' : 'text-gray-400'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-100 px-4 py-3">
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Type a message..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  className="flex-1 h-11 bg-gray-50 border-gray-200 rounded-xl"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="w-11 h-11 bg-[#1F5E4A] hover:bg-[#174d3c] text-white rounded-xl p-0 flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-20 h-20 bg-[#1F5E4A]/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <MessageSquare className="w-10 h-10 text-[#1F5E4A]" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Your Messages</h2>
              <p className="text-gray-500 text-sm max-w-xs">
                Select a conversation from the list to start messaging your mentors, mentees, or volunteers.
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
