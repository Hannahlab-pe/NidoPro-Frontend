import React from 'react';
import RagChat from '../../../components/common/RagChat';

const SecretaryAIChat = () => (
  <RagChat
    title="Asistente Administrativo EDA"
    subtitle="Consulta estudiantes, pensiones, docentes y más"
    placeholder="Pregúntame sobre estudiantes, notas, asistencia..."
    resetMessage={'**Conversación reiniciada.** ¿En qué puedo ayudarte?'}
    colorScheme="sky"
    pageHeaderTitle="Asistente IA"
    pageHeaderTheme="sky"
    showPageHeader={true}
  />
);

export default SecretaryAIChat;
