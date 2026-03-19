import React from 'react';
import RagChat from '../../../components/common/RagChat';

const AIChat = () => (
  <RagChat
    title="Asistente Pedagógico EDA"
    subtitle="Consulta tus aulas, estudiantes, notas y asistencia"
    placeholder="Pregúntame sobre tus estudiantes, notas, asistencia..."
    resetMessage={'**Conversación reiniciada.** ¿En qué puedo ayudarte?'}
    colorScheme="green"
    pageHeaderTitle="Asistente IA"
    pageHeaderTheme="green"
    showPageHeader={true}
  />
);

export default AIChat;
