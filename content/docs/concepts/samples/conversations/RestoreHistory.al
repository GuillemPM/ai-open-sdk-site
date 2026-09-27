Request: Record "AIOS Chat Request";
begin
    // Rebuild earlier turns, for example from your own chat log table
    Request.SetSystemMessage('You answer questions about Business Central sales orders.');
    Request.AppendUserMessage('Which orders ship this week?');
    Request.AppendAssistantMessage('Orders 101005 and 101009 ship on Friday.');

    Request.SetPrompt('Which of them is the larger order?');
    Result := Client.GenerateText(Model, Request);
end;
