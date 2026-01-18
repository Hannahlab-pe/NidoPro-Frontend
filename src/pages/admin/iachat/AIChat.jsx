import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  Users,
  Target,
  Calendar,
  Lightbulb,
  MessageSquare,
  Mic,
  Paperclip,
  MoreVertical,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Maximize,
  Minimize,
  TrendingUp,
  DollarSign,
  School,
  FileText,
  BarChart3
} from 'lucide-react';
import openaiService from '../../../services/openaiService';

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
<<<<<<< HEAD
      content: '👩‍� ¡Hola Directora! Soy tu **Asistente Educativo EDA** especializado en jardines infantiles.\n\n🎨 Estoy aquí para ayudarte con:\n• Desarrollo infantil y actividades lúdicas\n• Mejora continua de profesores\n• Comunicación efectiva con padres\n• Gestión de conflictos en el aula\n• Planes de mejora educativa\n• Salud y seguridad infantil\n• Organización de eventos especiales\n• Evaluación del desarrollo infantil\n\n� **¿En qué puedo ayudarte hoy?** Como directora de kinder, sé que tienes muchos desafíos diarios. ¡Estoy aquí para apoyarte!',
=======
      content: '👩‍💼 ¡Hola Directora! Soy tu **Asistente Educativo EDA** especializado en jardines infantiles.\n\n🎨 Estoy aquí para ayudarte con:\n• Desarrollo infantil y actividades lúdicas\n• Mejora continua de profesores\n• Comunicación efectiva con padres\n• Gestión de conflictos en el aula\n• Planes de mejora educativa\n• Salud y seguridad infantil\n• Organización de eventos especiales\n• Evaluación del desarrollo infantil\n\n🎯 **¿En qué puedo ayudarte hoy?** Como directora de kinder, sé que tienes muchos desafíos diarios. ¡Estoy aquí para apoyarte!',
>>>>>>> 3d4869c38449de1478c0d5fc72bafd4929f19900
      timestamp: new Date(Date.now() - 60000)
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'connected', 'error'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const messagesEndRef = useRef(null);

  // Verificar estado de la API al cargar
  useEffect(() => {
    const checkApiStatus = () => {
      if (openaiService.isConfigured()) {
        setApiStatus('connected');
      } else {
        setApiStatus('error');
      }
    };

    checkApiStatus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    {
      icon: Users,
      title: "Mejorar profesores",
      prompt: "Como directora de kinder, ¿qué estrategias puedo implementar para mejorar el desempeño de mis profesores? Necesito ideas prácticas para capacitación, motivación y desarrollo profesional continuo."
    },
    {
      icon: Target,
      title: "Actividades lúdicas",
      prompt: "Ayúdame a crear un plan mensual de actividades lúdicas para niños de 3-5 años. Quiero actividades que promuevan el desarrollo cognitivo, motor y social, adaptadas a cada edad."
    },
    {
      icon: MessageSquare,
      title: "Comunicación con padres",
      prompt: "Necesito estrategias efectivas para mejorar la comunicación con los padres de familia. ¿Cómo puedo crear un sistema de comunicación que mantenga informados a los padres sobre el progreso de sus hijos?"
    },
    {
      icon: BookOpen,
      title: "Desarrollo infantil",
      prompt: "Como directora, ¿cómo puedo asegurar que nuestro currículo cubra todas las áreas del desarrollo infantil? Necesito un checklist de hitos importantes para cada edad y formas de evaluarlos."
    },
    {
      icon: Lightbulb,
      title: "Gestión de conflictos",
      prompt: "Los conflictos entre niños son comunes en el kinder. ¿Qué técnicas de resolución de conflictos puedo enseñar a mis profesores para manejar situaciones difíciles en el aula?"
    },
    {
      icon: Calendar,
      title: "Eventos especiales",
      prompt: "Estoy planeando el festival de fin de año. ¿Qué ideas tienes para actividades divertidas, seguras y educativas que involucren a toda la comunidad educativa?"
    }
  ];

  const simulateAIResponse = async (userMessage) => {
    setIsTyping(true);

    try {
      // Preparar historial de conversación para OpenAI
      const history = conversationHistory.slice(-6); // Limitar a últimos 6 mensajes para contexto

      // Llamar a OpenAI ChatGPT
      const aiResponse = await openaiService.sendMessage(userMessage, history);

      // Agregar respuesta a los mensajes
      const newAiMessage = {
        id: Date.now(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newAiMessage]);

      // Actualizar historial de conversación
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: aiResponse }
      ]);

    } catch (error) {
      console.error('Error getting AI response:', error);

      // Mensaje de error amigable
      const errorMessage = {
        id: Date.now(),
        type: 'ai',
        content: `❌ **Disculpa, hay un problema temporal**\n\nNo pude procesar tu consulta en este momento. Esto puede deberse a:\n\n🔧 Configuración de API pendiente\n🌐 Problemas de conectividad\n⚡ Límites de uso alcanzados\n\n💡 **Mientras tanto:**\n• Usa las consultas frecuentes\n• Intenta reformular tu pregunta\n• Contacta al soporte técnico\n\n¿Te gustaría intentar con una pregunta más específica?`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    }

    setIsTyping(false);
  };

  const handleSendMessage = async (messageContent = newMessage) => {
    if (!messageContent.trim()) return;

    // Agregar mensaje del usuario
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Obtener respuesta de IA
    await simulateAIResponse(messageContent);
  };

  const handleQuickPrompt = async (prompt) => {
    await handleSendMessage(prompt);
  };

  const clearConversation = () => {
    setMessages([
      {
        id: 1,
        type: 'ai',
<<<<<<< HEAD
        content: '🔄 **Conversación reiniciada**\n\n👩‍� ¡Hola de nuevo Directora! Soy tu **Asistente Educativo EDA**.\n\n¿En qué nuevo desafío educativo puedo ayudarte hoy?',
=======
        content: '🔄 **Conversación reiniciada**\n\n👩‍💼 ¡Hola de nuevo Directora! Soy tu **Asistente Educativo EDA**.\n\n¿En qué nuevo desafío educativo puedo ayudarte hoy?',
>>>>>>> 3d4869c38449de1478c0d5fc72bafd4929f19900
        timestamp: new Date()
      }
    ]);
    setConversationHistory([]);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'h-full'}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base md:text-lg font-semibold text-gray-900 flex items-center space-x-2 truncate">
                <span>Asistente Educativo Kinder</span>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full hidden sm:inline">ChatGPT</span>
              </h1>
              <div className="flex items-center space-x-2">
                {apiStatus === 'connected' && (
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-xs md:text-sm text-green-600 truncate">En línea • Listo para ayudar</span>
                  </div>
                )}
                {apiStatus === 'error' && (
                  <div className="flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 text-orange-500" />
                    <span className="text-xs md:text-sm text-orange-600">Configuración pendiente</span>
                  </div>
                )}
                {apiStatus === 'checking' && (
                  <span className="text-xs md:text-sm text-gray-500">Verificando conexión...</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 md:space-x-2 ml-2">
            <button
              onClick={toggleFullscreen}
              className="p-1.5 md:p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
            <button
              onClick={clearConversation}
              className="p-1.5 md:p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Limpiar conversación"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="p-1.5 md:p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 md:hidden">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Prompts */}
      {false && (
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Consultas Frecuentes:</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {quickPrompts.map((prompt, index) => {
              const IconComponent = prompt.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleQuickPrompt(prompt.prompt)}
                  className="flex items-center space-x-2 p-3 text-left bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200 text-sm"
                >
                  <IconComponent className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700 truncate">{prompt.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex space-x-2 md:space-x-3 max-w-[85%] md:max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-3 h-3 md:w-4 md:h-4" />
                ) : (
                  <Bot className="w-3 h-3 md:w-4 md:h-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`rounded-2xl p-3 md:p-4 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {/* Render basic markdown formatting */}
                  {message.content.split('\n').map((line, index) => {
                    // Handle bold text **text**
                    if (line.includes('**')) {
                      const parts = line.split(/(\*\*.*?\*\*)/g);
                      return (
                        <div key={index} className={index > 0 ? 'mt-2' : ''}>
                          {parts.map((part, partIndex) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return (
                                <strong key={partIndex} className="font-semibold">
                                  {part.slice(2, -2)}
                                </strong>
                              );
                            }
                            return <span key={partIndex}>{part}</span>;
                          })}
                        </div>
                      );
                    }
                    // Handle bullet points
                    if (line.startsWith('•') || line.startsWith('-')) {
                      return (
                        <div key={index} className="ml-2 mt-1">
                          {line}
                        </div>
                      );
                    }
                    // Handle numbered lists
                    if (/^\d+\./.test(line.trim())) {
                      return (
                        <div key={index} className="ml-2 mt-1">
                          {line}
                        </div>
                      );
                    }
                    // Regular lines
                    return (
                      <div key={index} className={index > 0 ? 'mt-2' : ''}>
                        {line || '\u00A0'}
                      </div>
                    );
                  })}
                </div>
                <div className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-400'
                }`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex space-x-2 md:space-x-3 max-w-[85%] md:max-w-3xl">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-3 h-3 md:w-4 md:h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-3 md:p-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-3 md:p-4">
        <div className="flex items-end space-x-2 md:space-x-3">
          <div className="flex-1">
            <div className="relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Pregúntame sobre educación infantil, profesores, actividades..."
                className="w-full p-3 pr-12 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-h-32 text-sm md:text-base"
                rows="1"
                style={{ minHeight: '44px' }}
              />
            </div>
          </div>

          <button
            onClick={() => handleSendMessage()}
            disabled={!newMessage.trim() || isTyping}
            className={`p-3 rounded-lg transition-colors flex-shrink-0 ${
              newMessage.trim() && !isTyping
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span className="hidden sm:inline">Presiona Enter para enviar, Shift+Enter para nueva línea</span>
          <span className="sm:hidden">Enter para enviar</span>
          <div className="flex items-center space-x-2">
            {apiStatus === 'connected' && (
              <span className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="w-3 h-3" />
                <span className="hidden sm:inline">ChatGPT Conectado</span>
                <span className="sm:hidden">Conectado</span>
              </span>
            )}
            {apiStatus === 'error' && (
              <span className="flex items-center space-x-1 text-orange-600">
                <AlertCircle className="w-3 h-3" />
                <span className="hidden sm:inline">API no configurada</span>
                <span className="sm:hidden">Error</span>
              </span>
            )}
            <span className="hidden md:inline">EDA IA v2.1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;