import React from 'react';
import RagChat from '../../../components/common/RagChat';

const ParentAIChat = () => (
  <RagChat
    title="Asistente Familiar EDA"
    subtitle="Consulta las notas, asistencia y observaciones de tu hijo"
    placeholder="Pregúntame sobre las notas o asistencia de tu hijo..."
    resetMessage={'**Conversación reiniciada.** ¿En qué puedo ayudarte?'}
    colorScheme="yellow"
    pageHeaderTitle="Asistente Familiar IA"
    pageHeaderTheme="yellow"
    showPageHeader={true}
  />
);

export default ParentAIChat;
