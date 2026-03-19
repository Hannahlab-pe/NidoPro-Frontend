import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw, Shuffle } from 'lucide-react';
import ragService from '../../services/ragService';
import PageHeader from './PageHeader';
import { useAuthStore } from '../../store/useAuthStore';

// ─── Paletas de acento por esquema ────────────────────────────────────────────
const ACCENTS = {
  blue:   { userBg: 'bg-blue-600',   sendActive: 'bg-blue-600 hover:bg-blue-700',   ring: 'focus:ring-blue-500',   chip: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-100',   dot: 'bg-blue-500'   },
  green:  { userBg: 'bg-emerald-600',sendActive: 'bg-emerald-600 hover:bg-emerald-700', ring: 'focus:ring-emerald-500', chip: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' },
  yellow: { userBg: 'bg-amber-500',  sendActive: 'bg-amber-500 hover:bg-amber-600', ring: 'focus:ring-amber-500',  chip: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-100',  dot: 'bg-amber-500'  },
  teal:   { userBg: 'bg-teal-600',   sendActive: 'bg-teal-600 hover:bg-teal-700',   ring: 'focus:ring-teal-500',   chip: 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-100',   dot: 'bg-teal-500'   },
  sky:    { userBg: 'bg-sky-600',    sendActive: 'bg-sky-600 hover:bg-sky-700',     ring: 'focus:ring-sky-500',    chip: 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-100',     dot: 'bg-sky-500'    },
};

// ─── Preguntas sugeridas por rol ──────────────────────────────────────────────
const ROLE_PROMPTS = {
  ADMINISTRADOR: [
    '¿Cuántos trabajadores hay en el sistema?',
    'Lista todos los docentes',
    '¿Cuántos estudiantes están registrados?',
    'Busca al estudiante con DNI 12345678',
    '¿Qué pensiones pendientes tiene el estudiante [nombre]?',
    '¿En qué aula está matriculado [nombre]?',
    '¿Cómo registro un nuevo estudiante?',
    '¿Cómo creo un nuevo docente?',
    'Muéstrame los especialistas del colegio',
  ],
  SECRETARIA: [
    '¿Cuántos trabajadores hay en el sistema?',
    'Lista todos los docentes',
    '¿Cuántos estudiantes están registrados?',
    'Busca al estudiante con DNI 12345678',
    '¿Qué pensiones pendientes tiene el estudiante [nombre]?',
    '¿En qué aula está matriculado [nombre]?',
    '¿Cómo registro un nuevo estudiante?',
    '¿Cómo creo un nuevo docente?',
    'Muéstrame los especialistas del colegio',
  ],
  DOCENTE: [
    '¿Cuáles son mis aulas asignadas?',
    'Lista los estudiantes de mi aula',
    '¿Cómo va la asistencia de hoy?',
    '¿Qué estudiantes faltaron esta semana?',
    'Muéstrame las notas de [nombre del estudiante]',
    '¿Cuáles son mis observaciones registradas?',
    '¿Qué aula tengo para el curso de Matemáticas?',
  ],
  ESPECIALISTA: [
    '¿Cuáles son mis aulas asignadas?',
    'Lista los estudiantes de mi aula',
    '¿Cómo va la asistencia de hoy?',
    '¿Qué estudiantes faltaron esta semana?',
    'Muéstrame las notas de [nombre del estudiante]',
    '¿Cuáles son mis observaciones registradas?',
    '¿Qué aula tengo para el curso de Matemáticas?',
  ],
  ESTUDIANTE: [
    '¿Cómo van mis notas?',
    '¿Cuántas faltas tengo este mes?',
    '¿Hay alguna observación del profesor sobre mí?',
    '¿Aprobé todas las materias?',
    '¿Cuál es mi porcentaje de asistencia?',
    'Muéstrame mis últimas calificaciones',
  ],
};

function getRoleKey(nombre) {
  const r = (nombre || '').toUpperCase();
  if (r === 'ADMINISTRADOR' || r === 'ADMIN') return 'ADMINISTRADOR';
  if (r === 'SECRETARIA') return 'SECRETARIA';
  if (r === 'DOCENTE' || r === 'TRABAJADOR') return 'DOCENTE';
  if (r === 'ESPECIALISTA') return 'ESPECIALISTA';
  if (r === 'ESTUDIANTE' || r === 'PADRE' || r === 'PARENT') return 'ESTUDIANTE';
  return null;
}

function pick3(arr) {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, 3);
}

// ─── Renderizado de markdown básico ──────────────────────────────────────────
function renderContent(content) {
  return content.split('\n').map((line, i) => {
    if (line.includes('**')) {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
              : <span key={j}>{part}</span>
          )}
        </p>
      );
    }
    if (line.startsWith('•') || line.startsWith('- ')) {
      return <p key={i} className="ml-2 mt-1 text-current/90">{line.replace(/^[•\-]\s*/, '· ')}</p>;
    }
    if (/^\d+\./.test(line.trim())) {
      return <p key={i} className="ml-2 mt-1">{line}</p>;
    }
    return <p key={i} className={i > 0 ? 'mt-1.5' : ''}>{line || <>&nbsp;</>}</p>;
  });
}

// ─── Componente ───────────────────────────────────────────────────────────────
const RagChat = ({
  title = 'Asistente IA',
  subtitle = 'Consulta información del sistema en lenguaje natural',
  placeholder = 'Escribe tu pregunta...',
  welcomeMessage = null,
  resetMessage = '**Conversación reiniciada.** ¿En qué puedo ayudarte?',
  colorScheme = 'blue',
  pageHeaderTitle = 'Asistente IA',
  pageHeaderTheme = 'blue',
  showPageHeader = true,
}) => {
  const accent = ACCENTS[colorScheme] || ACCENTS.blue;
  const { role } = useAuthStore();
  const roleKey = getRoleKey(role?.nombre);
  const allPrompts = (roleKey && ROLE_PROMPTS[roleKey]) || [
    '¿Qué puedes hacer por mí?',
    'Ayúdame con información del sistema',
    '¿Qué datos puedes consultar?',
  ];

  const [messages, setMessages]       = useState([]);
  const [newMessage, setNewMessage]   = useState('');
  const [isTyping, setIsTyping]       = useState(false);
  const [suggestions, setSuggestions] = useState(() => pick3(allPrompts));
  const [chipsVisible, setChipsVisible] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);

  // Animar chips al montar
  useEffect(() => {
    const t = setTimeout(() => setChipsVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 128)}px`;
  }, [newMessage]);

  const shuffleSuggestions = useCallback(() => {
    setChipsVisible(false);
    setTimeout(() => {
      setSuggestions(pick3(allPrompts));
      setChipsVisible(true);
    }, 150);
  }, [allPrompts]);

  const formatTime = (d) => d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const sendToAgent = async (text) => {
    setIsTyping(true);
    try {
      const response = await ragService.sendMessage(text);
      setMessages((p) => [...p, { id: Date.now(), type: 'ai', content: response, timestamp: new Date() }]);
    } catch (err) {
      setMessages((p) => [...p, {
        id: Date.now(), type: 'ai',
        content: `**Error al conectar con el asistente**\n\n${err.message}`,
        timestamp: new Date(),
      }]);
    }
    setIsTyping(false);
  };

  const handleSend = async (text = newMessage) => {
    const t = text.trim();
    if (!t || isTyping) return;
    setMessages((p) => [...p, { id: Date.now(), type: 'user', content: t, timestamp: new Date() }]);
    setNewMessage('');
    await sendToAgent(t);
  };

  const handleClear = async () => {
    try { await ragService.resetConversation(); } catch (_) {}
    setMessages([{ id: Date.now(), type: 'ai', content: resetMessage, timestamp: new Date() }]);
    shuffleSuggestions();
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full gap-3">

      {/* PageHeader del sistema */}
      {showPageHeader && (
        <PageHeader title={pageHeaderTitle} theme={pageHeaderTheme} />
      )}

      {/* Área de mensajes + estado vacío */}
      <div className="flex-1 overflow-y-auto min-h-0">

        {/* Estado vacío — centrado */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full gap-6 px-4 pb-4">

            {/* Ícono EDA */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className={`w-14 h-14 rounded-2xl ${accent.userBg} flex items-center justify-center shadow-md`}>
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-800">{title}</p>
                <p className="text-sm text-gray-400 mt-0.5 max-w-xs">{subtitle}</p>
              </div>
            </div>

            {/* Chips sugeridos */}
            <div className="w-full max-w-lg">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Sugerencias</span>
                <button
                  onClick={shuffleSuggestions}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>Otras</span>
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {suggestions.map((prompt, i) => (
                  <button
                    key={`${prompt}-${i}`}
                    onClick={() => handleSend(prompt)}
                    disabled={isTyping}
                    className={`
                      text-left text-sm px-4 py-2.5 rounded-xl border transition-all duration-200
                      ${accent.chip}
                      ${chipsVisible
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-2'}
                    `}
                    style={{ transitionDelay: chipsVisible ? `${i * 60}ms` : '0ms' }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mensajes */}
        {!isEmpty && (
          <div className="px-2 py-3 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-lg shrink-0 mt-0.5 flex items-center justify-center ${
                  msg.type === 'user' ? accent.userBg : 'bg-gray-100'
                }`}>
                  {msg.type === 'user'
                    ? <User className="w-3.5 h-3.5 text-white" />
                    : <Bot className="w-3.5 h-3.5 text-gray-500" />
                  }
                </div>

                {/* Burbuja */}
                <div className={`max-w-[78%] md:max-w-2xl rounded-2xl px-4 py-2.5 ${
                  msg.type === 'user'
                    ? `${accent.userBg} text-white rounded-tr-sm`
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-xs'
                }`}>
                  <div className="text-sm leading-relaxed">
                    {renderContent(msg.content)}
                  </div>
                  <p className={`text-[10px] mt-1.5 ${
                    msg.type === 'user' ? 'text-white/60' : 'text-gray-400'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-lg shrink-0 bg-gray-100 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm shadow-xs px-4 py-3">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input bar — siempre al fondo, libre */}
      <div className="shrink-0 pb-1">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={placeholder}
            disabled={isTyping}
            rows={1}
            className={`
              flex-1 resize-none rounded-2xl border border-gray-200 bg-white
              px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400
              shadow-sm transition-all focus:outline-none focus:ring-2 focus:border-transparent
              ${accent.ring}
              disabled:opacity-50
            `}
            style={{ minHeight: '44px', maxHeight: '128px' }}
          />

          {/* Botón limpiar */}
          <button
            onClick={handleClear}
            className="shrink-0 p-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Nueva conversación"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Botón enviar */}
          <button
            onClick={() => handleSend()}
            disabled={!newMessage.trim() || isTyping}
            className={`shrink-0 p-2.5 rounded-xl transition-all ${
              newMessage.trim() && !isTyping
                ? `${accent.sendActive} text-white shadow-sm`
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5 text-center">
          Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>

    </div>
  );
};

export default RagChat;
