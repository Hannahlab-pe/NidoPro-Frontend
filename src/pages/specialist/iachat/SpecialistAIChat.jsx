import React from 'react';
import RagChat from '../../../components/common/RagChat';

const SpecialistAIChat = () => (
  <RagChat
    title="Asistente Especialista EDA"
    subtitle="Consulta aulas, estudiantes, notas y observaciones"
    placeholder="Pregúntame sobre estudiantes, evaluaciones, asistencia..."
    resetMessage={'**Conversación reiniciada.** ¿En qué puedo ayudarte?'}
    colorScheme="teal"
    pageHeaderTitle="Asistente IA"
    pageHeaderTheme="teal"
    showPageHeader={true}
  />
);

export default SpecialistAIChat;
